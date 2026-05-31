"""
Performance metrics: win rate, profit factor, max drawdown, Sharpe, Sortino,
Calmar, expectancy — all computed NET of fees and slippage.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import numpy as np
import pandas as pd


@dataclass
class Trade:
    entry_time: pd.Timestamp
    exit_time: pd.Timestamp
    direction: str         # "long" or "short"
    entry_price: float
    exit_price: float
    size_pct: float        # % of capital allocated
    fee_rate: float        # each-side fee (e.g. 0.001)
    slippage_pct: float    # each side slippage

    @property
    def gross_pnl_pct(self) -> float:
        if self.direction == "long":
            return (self.exit_price - self.entry_price) / self.entry_price
        else:
            return (self.entry_price - self.exit_price) / self.entry_price

    @property
    def costs_pct(self) -> float:
        return (self.fee_rate + self.slippage_pct) * 2  # entry + exit

    @property
    def net_pnl_pct(self) -> float:
        return self.gross_pnl_pct - self.costs_pct

    @property
    def net_return(self) -> float:
        return self.net_pnl_pct * self.size_pct

    @property
    def is_win(self) -> bool:
        return self.net_pnl_pct > 0

    @property
    def duration_hours(self) -> float:
        delta = self.exit_time - self.entry_time
        return delta.total_seconds() / 3600


@dataclass
class BacktestMetrics:
    n_trades: int
    win_rate: float
    profit_factor: float
    expectancy_pct: float        # average net R per trade
    max_drawdown_pct: float
    max_drawdown_duration_bars: int
    sharpe_ratio: float
    sortino_ratio: float
    calmar_ratio: float
    total_return_pct: float
    annualized_return_pct: float
    avg_win_pct: float
    avg_loss_pct: float
    avg_hold_hours: float
    largest_win_pct: float
    largest_loss_pct: float
    recovery_factor: float
    is_valid: bool               # False if < min_trades or negative
    notes: str = ""

    def to_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items()}

    def summary(self) -> str:
        valid_str = "VALID" if self.is_valid else "INVALID"
        return (
            f"[{valid_str}] Trades={self.n_trades} | "
            f"WinRate={self.win_rate:.1%} | PF={self.profit_factor:.2f} | "
            f"Sharpe={self.sharpe_ratio:.2f} | MaxDD={self.max_drawdown_pct:.1%} | "
            f"TotalReturn={self.total_return_pct:.1%}"
        )


def compute_metrics(
    trades: List[Trade],
    initial_capital: float = 10000.0,
    min_trades: int = 30,
    periods_per_year: int = 252,
) -> BacktestMetrics:
    if not trades:
        return BacktestMetrics(
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            is_valid=False, notes="No trades"
        )

    returns = np.array([t.net_return for t in trades])
    pnl_pcts = np.array([t.net_pnl_pct for t in trades])

    wins = [r for r in pnl_pcts if r > 0]
    losses = [r for r in pnl_pcts if r <= 0]

    win_rate = len(wins) / len(returns)
    avg_win = np.mean(wins) if wins else 0.0
    avg_loss = abs(np.mean(losses)) if losses else 0.0
    profit_factor = (sum(wins) / abs(sum(losses))) if losses and sum(losses) != 0 else float("inf")
    expectancy = np.mean(pnl_pcts)

    # Equity curve
    equity = initial_capital * np.cumprod(1 + returns)
    equity = np.insert(equity, 0, initial_capital)

    # Drawdown
    running_max = np.maximum.accumulate(equity)
    drawdown_series = (equity - running_max) / running_max
    max_dd = float(drawdown_series.min())

    # Max drawdown duration (in trades)
    in_dd = False
    dd_len = dd_max_len = 0
    for val in drawdown_series:
        if val < 0:
            if not in_dd:
                in_dd = True
                dd_len = 1
            else:
                dd_len += 1
            dd_max_len = max(dd_max_len, dd_len)
        else:
            in_dd = False
            dd_len = 0

    # Returns for Sharpe/Sortino (trade-by-trade)
    r = returns
    if r.std() > 0:
        sharpe = float(r.mean() / r.std() * np.sqrt(periods_per_year))
    else:
        sharpe = 0.0

    downside = r[r < 0]
    if len(downside) > 0 and downside.std() > 0:
        sortino = float(r.mean() / downside.std() * np.sqrt(periods_per_year))
    else:
        sortino = 0.0

    total_return = float((equity[-1] / initial_capital) - 1)

    # Annualized return estimate
    if len(trades) > 1 and trades[-1].exit_time > trades[0].entry_time:
        years = (trades[-1].exit_time - trades[0].entry_time).total_seconds() / (365.25 * 86400)
        annualized = float((equity[-1] / initial_capital) ** (1 / max(years, 0.1)) - 1) if years > 0 else total_return
    else:
        annualized = total_return

    calmar = (annualized / abs(max_dd)) if max_dd < 0 else 0.0
    recovery = (total_return / abs(max_dd)) if max_dd < 0 else 0.0
    avg_hold = np.mean([t.duration_hours for t in trades])

    is_valid = (
        len(trades) >= min_trades
        and profit_factor > 1.0
        and total_return > 0
    )

    notes = ""
    if len(trades) < min_trades:
        notes = f"Too few trades ({len(trades)} < {min_trades})"
    elif profit_factor <= 1.0:
        notes = f"Profit factor ≤ 1 ({profit_factor:.2f})"
    elif total_return <= 0:
        notes = f"Negative total return ({total_return:.1%})"

    return BacktestMetrics(
        n_trades=len(trades),
        win_rate=round(win_rate, 4),
        profit_factor=round(profit_factor, 3),
        expectancy_pct=round(expectancy * 100, 4),
        max_drawdown_pct=round(max_dd, 4),
        max_drawdown_duration_bars=dd_max_len,
        sharpe_ratio=round(sharpe, 3),
        sortino_ratio=round(sortino, 3),
        calmar_ratio=round(calmar, 3),
        total_return_pct=round(total_return, 4),
        annualized_return_pct=round(annualized, 4),
        avg_win_pct=round(avg_win * 100, 4),
        avg_loss_pct=round(avg_loss * 100, 4),
        avg_hold_hours=round(avg_hold, 2),
        largest_win_pct=round(max(wins) * 100, 4) if wins else 0.0,
        largest_loss_pct=round(min(losses) * 100, 4) if losses else 0.0,
        recovery_factor=round(recovery, 3),
        is_valid=is_valid,
        notes=notes,
    )
