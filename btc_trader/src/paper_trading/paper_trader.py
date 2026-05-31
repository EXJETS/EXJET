"""
Paper trading mode: tracks simulated P&L net of fees, maintains trade log,
reports live performance vs. backtest expectations.
"""

from __future__ import annotations

import csv
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional

import pandas as pd
from loguru import logger

from src.backtesting.metrics import BacktestMetrics, Trade, compute_metrics
from src.confluence.signal_scorer import ScoredSignal
from src.core.risk_manager import TradeSetup


@dataclass
class PaperTrade:
    trade_id: str
    strategy: str
    timeframe: str
    direction: str
    entry_price: float
    stop_loss: float
    tp1: float
    tp2: float
    size_pct: float
    score: float
    open_time: datetime
    entry_reason: str
    # Filled on close:
    exit_price: Optional[float] = None
    close_time: Optional[datetime] = None
    outcome: Optional[str] = None    # "tp1", "tp2", "stop", "manual"
    net_pnl_pct: Optional[float] = None
    is_open: bool = True


class PaperTrader:
    def __init__(self, cfg: dict) -> None:
        self.cfg = cfg
        self.fee_rate = cfg.get("fee_rate", 0.001)
        self.slippage_pct = cfg.get("slippage_pct", 0.0005)
        self.initial_balance = cfg.get("initial_balance", 10000.0)
        self.balance = self.initial_balance
        self.open_trades: Dict[str, PaperTrade] = {}
        self.closed_trades: List[PaperTrade] = []
        self.track_file = Path(cfg.get("track_file", "data/paper_trades.csv"))
        self.track_file.parent.mkdir(parents=True, exist_ok=True)
        self._trade_counter = 0
        self._load_existing()

    def _load_existing(self) -> None:
        if not self.track_file.exists():
            return
        try:
            df = pd.read_csv(self.track_file)
            logger.info(f"Loaded {len(df)} existing paper trades from {self.track_file}")
        except Exception as exc:
            logger.warning(f"Could not load paper trades: {exc}")

    def _next_id(self) -> str:
        self._trade_counter += 1
        return f"PT{self._trade_counter:04d}"

    def open_trade(self, scored: ScoredSignal, setup: TradeSetup, strategy: str) -> str:
        if not self.cfg.get("enabled", True):
            return ""

        trade_id = self._next_id()
        trade = PaperTrade(
            trade_id=trade_id,
            strategy=strategy,
            timeframe=scored.raw.timeframe,
            direction=setup.direction,
            entry_price=setup.entry,
            stop_loss=setup.stop_loss,
            tp1=setup.tp1,
            tp2=setup.tp2,
            size_pct=setup.position_size_pct,
            score=scored.score,
            open_time=datetime.now(timezone.utc),
            entry_reason=", ".join(scored.confluence_reasons[:3]),
        )
        self.open_trades[trade_id] = trade
        logger.info(
            f"Paper trade opened: {trade_id} | {strategy} {setup.direction} "
            f"@ ${setup.entry:,.2f} | SL=${setup.stop_loss:,.2f} | "
            f"TP1=${setup.tp1:,.2f} | TP2=${setup.tp2:,.2f}"
        )
        return trade_id

    def update_prices(self, current_price: float) -> List[str]:
        """Check all open trades against current price. Returns list of closed trade IDs."""
        closed = []
        for trade_id, trade in list(self.open_trades.items()):
            if trade.direction == "long":
                if current_price <= trade.stop_loss:
                    self._close_trade(trade, current_price, "stop")
                    closed.append(trade_id)
                elif current_price >= trade.tp2:
                    self._close_trade(trade, trade.tp2, "tp2")
                    closed.append(trade_id)
                elif current_price >= trade.tp1:
                    # Move stop to breakeven on TP1 hit
                    trade.stop_loss = trade.entry_price
            else:  # short
                if current_price >= trade.stop_loss:
                    self._close_trade(trade, current_price, "stop")
                    closed.append(trade_id)
                elif current_price <= trade.tp2:
                    self._close_trade(trade, trade.tp2, "tp2")
                    closed.append(trade_id)
                elif current_price <= trade.tp1:
                    trade.stop_loss = trade.entry_price

        return closed

    def _close_trade(self, trade: PaperTrade, exit_price: float, outcome: str) -> None:
        costs = (self.fee_rate + self.slippage_pct) * 2
        if trade.direction == "long":
            gross = (exit_price - trade.entry_price) / trade.entry_price
        else:
            gross = (trade.entry_price - exit_price) / trade.entry_price
        net = gross - costs

        trade.exit_price = exit_price
        trade.close_time = datetime.now(timezone.utc)
        trade.outcome = outcome
        trade.net_pnl_pct = net
        trade.is_open = False

        pnl_dollars = net * trade.size_pct / 100 * self.balance
        self.balance += pnl_dollars

        self.closed_trades.append(trade)
        if trade.trade_id in self.open_trades:
            del self.open_trades[trade.trade_id]

        emoji = "✅" if net > 0 else "❌"
        logger.info(
            f"{emoji} Paper trade closed: {trade.trade_id} | {trade.strategy} {trade.direction} | "
            f"Entry=${trade.entry_price:,.2f} → Exit=${exit_price:,.2f} | "
            f"Outcome={outcome} | Net={net*100:.2f}% | "
            f"P&L=${pnl_dollars:+.2f} | Balance=${self.balance:,.2f}"
        )
        self._append_to_csv(trade)

    def _append_to_csv(self, trade: PaperTrade) -> None:
        is_new = not self.track_file.exists()
        with open(self.track_file, "a", newline="") as f:
            writer = csv.writer(f)
            if is_new:
                writer.writerow([
                    "trade_id", "strategy", "timeframe", "direction",
                    "entry_price", "exit_price", "stop_loss", "tp1", "tp2",
                    "size_pct", "score", "outcome", "net_pnl_pct",
                    "open_time", "close_time", "reason",
                ])
            writer.writerow([
                trade.trade_id, trade.strategy, trade.timeframe, trade.direction,
                trade.entry_price, trade.exit_price, trade.stop_loss, trade.tp1, trade.tp2,
                trade.size_pct, trade.score, trade.outcome,
                f"{trade.net_pnl_pct*100:.4f}" if trade.net_pnl_pct else "",
                trade.open_time.isoformat(),
                trade.close_time.isoformat() if trade.close_time else "",
                trade.entry_reason,
            ])

    def get_performance(self) -> dict:
        """Live performance report vs initial capital."""
        closed = self.closed_trades
        if not closed:
            return {"balance": self.balance, "open_trades": len(self.open_trades), "n_trades": 0}

        returns = [t.net_pnl_pct * t.size_pct / 100 for t in closed if t.net_pnl_pct is not None]
        wins = [r for r in returns if r > 0]
        losses = [r for r in returns if r <= 0]

        return {
            "balance": round(self.balance, 2),
            "return_pct": round((self.balance / self.initial_balance - 1) * 100, 2),
            "open_trades": len(self.open_trades),
            "n_closed": len(closed),
            "win_rate": round(len(wins) / len(returns) * 100, 1) if returns else 0,
            "profit_factor": round(sum(wins) / abs(sum(losses)), 3) if losses and sum(losses) != 0 else 0,
            "avg_win_pct": round(sum([t.net_pnl_pct * 100 for t in closed if t.net_pnl_pct and t.net_pnl_pct > 0]) / max(len(wins), 1), 2),
            "avg_loss_pct": round(sum([t.net_pnl_pct * 100 for t in closed if t.net_pnl_pct and t.net_pnl_pct <= 0]) / max(len(losses), 1), 2),
            "strategy_breakdown": self._strategy_breakdown(),
        }

    def _strategy_breakdown(self) -> dict:
        strategies: Dict[str, dict] = {}
        for t in self.closed_trades:
            s = t.strategy
            if s not in strategies:
                strategies[s] = {"trades": 0, "wins": 0, "total_pnl": 0.0}
            strategies[s]["trades"] += 1
            if t.net_pnl_pct and t.net_pnl_pct > 0:
                strategies[s]["wins"] += 1
            strategies[s]["total_pnl"] += (t.net_pnl_pct or 0) * 100
        for s, data in strategies.items():
            n = data["trades"]
            data["win_rate"] = round(data["wins"] / n * 100, 1) if n > 0 else 0
            data["avg_pnl"] = round(data["total_pnl"] / n, 2) if n > 0 else 0
        return strategies

    def flag_degraded_strategies(self, min_trades: int = 20) -> List[str]:
        """Return strategy names whose live win-rate is significantly below backtest."""
        degraded = []
        breakdown = self._strategy_breakdown()
        for strategy, data in breakdown.items():
            if data["trades"] >= min_trades and data["win_rate"] < 40:
                logger.warning(f"Strategy '{strategy}' live win-rate={data['win_rate']:.0f}% — edge may have degraded!")
                degraded.append(strategy)
        return degraded
