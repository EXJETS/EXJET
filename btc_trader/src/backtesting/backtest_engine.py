"""
Core backtesting engine.

Design:
  - Bar-by-bar simulation (no look-ahead bias).
  - Strategy generates signal (long/short/none) per bar.
  - Engine manages position: entry, stop, TP1 (50% exit), TP2 (full exit).
  - All P&L computed NET of fees and slippage.
  - Supports max_open_bars timeout to prevent trades lasting forever.
"""

from __future__ import annotations

import copy
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from loguru import logger

from src.backtesting.metrics import BacktestMetrics, Trade, compute_metrics


@dataclass
class BacktestConfig:
    initial_capital: float = 10000.0
    fee_rate: float = 0.001          # 0.1% per side
    slippage_pct: float = 0.0005     # 0.05% per side
    position_size_pct: float = 0.05  # 5% of capital per trade
    atr_stop_multiplier: float = 1.5
    tp1_rr: float = 1.5
    tp2_rr: float = 3.0
    max_open_bars: int = 100
    min_trades: int = 30


@dataclass
class OpenPosition:
    direction: str      # "long" or "short"
    entry_price: float
    stop_loss: float
    tp1: float
    tp2: float
    entry_time: pd.Timestamp
    size_pct: float
    tp1_hit: bool = False  # partial exit at TP1


SignalFn = Callable[[pd.DataFrame, int], Optional[str]]
# Returns "long", "short", or None for the bar at index i.
# The function receives the FULL df but must only use df.iloc[:i+1] to avoid lookahead.


class BacktestEngine:
    """
    Vectorized bar-by-bar backtester.

    Usage:
        engine = BacktestEngine(config)
        metrics = engine.run(df, signal_fn)
        print(metrics.summary())
    """

    def __init__(self, config: BacktestConfig) -> None:
        self.config = config

    def run(
        self,
        df: pd.DataFrame,
        signal_fn: SignalFn,
        strategy_name: str = "unnamed",
    ) -> BacktestMetrics:
        cfg = self.config
        trades: List[Trade] = []
        position: Optional[OpenPosition] = None
        capital = cfg.initial_capital
        bar_count_in_trade = 0

        if "atr" not in df.columns:
            logger.warning("Backtest: 'atr' column missing, using close*0.01")
            df = df.copy()
            df["atr"] = df["close"] * 0.01

        close = df["close"].values
        high = df["high"].values
        low = df["low"].values
        atr_vals = df["atr"].values
        ts = df.index
        n = len(df)

        for i in range(50, n):  # warmup = 50 bars for indicators
            price = close[i]
            h = high[i]
            l = low[i]

            # ── Manage open position ──────────────────────────────────────────
            if position is not None:
                bar_count_in_trade += 1
                closed = False

                if position.direction == "long":
                    # TP1 partial exit at 50%
                    if not position.tp1_hit and h >= position.tp1:
                        position.tp1_hit = True

                    # Stop loss hit
                    if l <= position.stop_loss:
                        exit_price = position.stop_loss * (1 - cfg.slippage_pct)
                        trades.append(Trade(
                            entry_time=position.entry_time,
                            exit_time=ts[i],
                            direction="long",
                            entry_price=position.entry_price,
                            exit_price=exit_price,
                            size_pct=position.size_pct,
                            fee_rate=cfg.fee_rate,
                            slippage_pct=cfg.slippage_pct,
                        ))
                        closed = True

                    # TP2 full exit
                    elif h >= position.tp2:
                        exit_price = position.tp2 * (1 - cfg.slippage_pct)
                        trades.append(Trade(
                            entry_time=position.entry_time,
                            exit_time=ts[i],
                            direction="long",
                            entry_price=position.entry_price,
                            exit_price=exit_price,
                            size_pct=position.size_pct,
                            fee_rate=cfg.fee_rate,
                            slippage_pct=cfg.slippage_pct,
                        ))
                        closed = True

                else:  # short
                    if not position.tp1_hit and l <= position.tp1:
                        position.tp1_hit = True

                    if h >= position.stop_loss:
                        exit_price = position.stop_loss * (1 + cfg.slippage_pct)
                        trades.append(Trade(
                            entry_time=position.entry_time,
                            exit_time=ts[i],
                            direction="short",
                            entry_price=position.entry_price,
                            exit_price=exit_price,
                            size_pct=position.size_pct,
                            fee_rate=cfg.fee_rate,
                            slippage_pct=cfg.slippage_pct,
                        ))
                        closed = True

                    elif l <= position.tp2:
                        exit_price = position.tp2 * (1 + cfg.slippage_pct)
                        trades.append(Trade(
                            entry_time=position.entry_time,
                            exit_time=ts[i],
                            direction="short",
                            entry_price=position.entry_price,
                            exit_price=exit_price,
                            size_pct=position.size_pct,
                            fee_rate=cfg.fee_rate,
                            slippage_pct=cfg.slippage_pct,
                        ))
                        closed = True

                # Max-bars timeout
                if not closed and bar_count_in_trade >= cfg.max_open_bars:
                    exit_price = price * (1 - cfg.slippage_pct if position.direction == "long" else 1 + cfg.slippage_pct)
                    trades.append(Trade(
                        entry_time=position.entry_time,
                        exit_time=ts[i],
                        direction=position.direction,
                        entry_price=position.entry_price,
                        exit_price=exit_price,
                        size_pct=position.size_pct,
                        fee_rate=cfg.fee_rate,
                        slippage_pct=cfg.slippage_pct,
                    ))
                    closed = True

                if closed:
                    position = None
                    bar_count_in_trade = 0
                    # Update capital with last trade result
                    if trades:
                        capital *= (1 + trades[-1].net_return)
                    continue

            # ── Check for new signal ──────────────────────────────────────────
            if position is None:
                signal = signal_fn(df, i)
                if signal in ("long", "short"):
                    atr = atr_vals[i]
                    entry = price * (1 + cfg.slippage_pct if signal == "long" else 1 - cfg.slippage_pct)
                    stop_dist = atr * cfg.atr_stop_multiplier

                    if signal == "long":
                        sl = entry - stop_dist
                        tp1 = entry + stop_dist * cfg.tp1_rr
                        tp2 = entry + stop_dist * cfg.tp2_rr
                    else:
                        sl = entry + stop_dist
                        tp1 = entry - stop_dist * cfg.tp1_rr
                        tp2 = entry - stop_dist * cfg.tp2_rr

                    position = OpenPosition(
                        direction=signal,
                        entry_price=entry,
                        stop_loss=sl,
                        tp1=tp1,
                        tp2=tp2,
                        entry_time=ts[i],
                        size_pct=cfg.position_size_pct,
                    )
                    bar_count_in_trade = 0

        metrics = compute_metrics(trades, cfg.initial_capital, cfg.min_trades)
        logger.info(f"Backtest [{strategy_name}]: {metrics.summary()}")
        return metrics

    def run_with_trades(
        self,
        df: pd.DataFrame,
        signal_fn: SignalFn,
    ) -> Tuple[BacktestMetrics, List[Trade]]:
        """Same as run() but also returns the full trade list."""
        cfg = self.config
        trades: List[Trade] = []
        position: Optional[OpenPosition] = None
        capital = cfg.initial_capital
        bar_count_in_trade = 0

        if "atr" not in df.columns:
            df = df.copy()
            df["atr"] = df["close"] * 0.01

        close = df["close"].values
        high = df["high"].values
        low = df["low"].values
        atr_vals = df["atr"].values
        ts = df.index
        n = len(df)

        for i in range(50, n):
            price = close[i]
            h = high[i]
            l = low[i]

            if position is not None:
                bar_count_in_trade += 1
                closed = False

                if position.direction == "long":
                    if not position.tp1_hit and h >= position.tp1:
                        position.tp1_hit = True
                    if l <= position.stop_loss:
                        exit_price = position.stop_loss * (1 - cfg.slippage_pct)
                        trades.append(Trade(position.entry_time, ts[i], "long",
                                            position.entry_price, exit_price,
                                            position.size_pct, cfg.fee_rate, cfg.slippage_pct))
                        closed = True
                    elif h >= position.tp2:
                        exit_price = position.tp2 * (1 - cfg.slippage_pct)
                        trades.append(Trade(position.entry_time, ts[i], "long",
                                            position.entry_price, exit_price,
                                            position.size_pct, cfg.fee_rate, cfg.slippage_pct))
                        closed = True
                else:
                    if not position.tp1_hit and l <= position.tp1:
                        position.tp1_hit = True
                    if h >= position.stop_loss:
                        exit_price = position.stop_loss * (1 + cfg.slippage_pct)
                        trades.append(Trade(position.entry_time, ts[i], "short",
                                            position.entry_price, exit_price,
                                            position.size_pct, cfg.fee_rate, cfg.slippage_pct))
                        closed = True
                    elif l <= position.tp2:
                        exit_price = position.tp2 * (1 + cfg.slippage_pct)
                        trades.append(Trade(position.entry_time, ts[i], "short",
                                            position.entry_price, exit_price,
                                            position.size_pct, cfg.fee_rate, cfg.slippage_pct))
                        closed = True

                if not closed and bar_count_in_trade >= cfg.max_open_bars:
                    exit_price = price * (1 - cfg.slippage_pct if position.direction == "long" else 1 + cfg.slippage_pct)
                    trades.append(Trade(position.entry_time, ts[i], position.direction,
                                        position.entry_price, exit_price,
                                        position.size_pct, cfg.fee_rate, cfg.slippage_pct))
                    closed = True

                if closed:
                    position = None
                    bar_count_in_trade = 0
                    if trades:
                        capital *= (1 + trades[-1].net_return)

            if position is None:
                signal = signal_fn(df, i)
                if signal in ("long", "short"):
                    atr = atr_vals[i]
                    entry = price * (1 + cfg.slippage_pct if signal == "long" else 1 - cfg.slippage_pct)
                    stop_dist = atr * cfg.atr_stop_multiplier
                    if signal == "long":
                        sl = entry - stop_dist
                        tp1 = entry + stop_dist * cfg.tp1_rr
                        tp2 = entry + stop_dist * cfg.tp2_rr
                    else:
                        sl = entry + stop_dist
                        tp1 = entry - stop_dist * cfg.tp1_rr
                        tp2 = entry - stop_dist * cfg.tp2_rr

                    position = OpenPosition(signal, entry, sl, tp1, tp2, ts[i],
                                            cfg.position_size_pct)
                    bar_count_in_trade = 0

        metrics = compute_metrics(trades, cfg.initial_capital, cfg.min_trades)
        return metrics, trades
