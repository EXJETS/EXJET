"""
Walk-forward testing to detect and prevent overfitting.

Splits data into N folds. Each fold:
  - Train window (in-sample): optimize / validate parameters
  - Test window (out-of-sample): evaluate on unseen data
Results aggregated across all OOS folds to get true expected performance.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable, List, Optional, Tuple

import numpy as np
import pandas as pd
from loguru import logger

from src.backtesting.backtest_engine import BacktestConfig, BacktestEngine, SignalFn
from src.backtesting.metrics import BacktestMetrics, compute_metrics


@dataclass
class WalkForwardFold:
    fold_number: int
    train_start: pd.Timestamp
    train_end: pd.Timestamp
    test_start: pd.Timestamp
    test_end: pd.Timestamp
    is_metrics: BacktestMetrics    # in-sample
    oos_metrics: BacktestMetrics   # out-of-sample


@dataclass
class WalkForwardResult:
    folds: List[WalkForwardFold]
    avg_oos_win_rate: float
    avg_oos_profit_factor: float
    avg_oos_sharpe: float
    avg_oos_max_drawdown: float
    avg_oos_return: float
    valid_folds: int
    is_robust: bool      # True if majority of OOS folds are profitable
    degradation: float   # IS return - OOS return (positive = overfitting signal)

    def summary(self) -> str:
        return (
            f"WalkForward: {self.valid_folds}/{len(self.folds)} valid folds | "
            f"OOS WinRate={self.avg_oos_win_rate:.1%} | "
            f"OOS PF={self.avg_oos_profit_factor:.2f} | "
            f"OOS Sharpe={self.avg_oos_sharpe:.2f} | "
            f"Degradation={self.degradation:.1%} | "
            f"Robust={'YES' if self.is_robust else 'NO'}"
        )


class WalkForwardTester:
    def __init__(
        self,
        config: BacktestConfig,
        n_splits: int = 6,
        train_pct: float = 0.7,
    ) -> None:
        self.config = config
        self.n_splits = n_splits
        self.train_pct = train_pct

    def _split(self, df: pd.DataFrame) -> List[Tuple[pd.DataFrame, pd.DataFrame]]:
        """Generate (train_df, test_df) pairs for walk-forward splits."""
        n = len(df)
        fold_size = n // self.n_splits
        splits = []

        for fold in range(self.n_splits):
            end_idx = (fold + 1) * fold_size
            if end_idx > n:
                break
            start_idx = 0  # expanding window
            split_idx = start_idx + int((end_idx - start_idx) * self.train_pct)

            train = df.iloc[start_idx:split_idx]
            test = df.iloc[split_idx:end_idx]

            if len(train) >= 100 and len(test) >= 20:
                splits.append((train, test))

        return splits

    def run(
        self,
        df: pd.DataFrame,
        signal_fn: SignalFn,
        strategy_name: str = "unnamed",
    ) -> WalkForwardResult:
        splits = self._split(df)
        if not splits:
            logger.warning("Walk-forward: no valid splits")
            empty = BacktestMetrics(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, False, "empty")
            return WalkForwardResult([], 0, 0, 0, 0, 0, 0, False, 0)

        engine = BacktestEngine(self.config)
        folds: List[WalkForwardFold] = []

        for fold_num, (train_df, test_df) in enumerate(splits):
            logger.info(
                f"WF Fold {fold_num+1}/{len(splits)}: "
                f"train={len(train_df)} bars, test={len(test_df)} bars"
            )

            is_metrics = engine.run(train_df, signal_fn, f"{strategy_name}_fold{fold_num+1}_IS")
            oos_metrics = engine.run(test_df, signal_fn, f"{strategy_name}_fold{fold_num+1}_OOS")

            folds.append(WalkForwardFold(
                fold_number=fold_num + 1,
                train_start=train_df.index[0],
                train_end=train_df.index[-1],
                test_start=test_df.index[0],
                test_end=test_df.index[-1],
                is_metrics=is_metrics,
                oos_metrics=oos_metrics,
            ))

        # Aggregate OOS stats
        oos_list = [f.oos_metrics for f in folds if f.oos_metrics.n_trades >= 5]
        valid_folds = sum(1 for f in folds if f.oos_metrics.is_valid)

        if not oos_list:
            return WalkForwardResult(folds, 0, 0, 0, 0, 0, 0, False, 0)

        avg_wr = float(np.mean([m.win_rate for m in oos_list]))
        avg_pf = float(np.mean([m.profit_factor for m in oos_list]))
        avg_sh = float(np.mean([m.sharpe_ratio for m in oos_list]))
        avg_dd = float(np.mean([m.max_drawdown_pct for m in oos_list]))
        avg_ret = float(np.mean([m.total_return_pct for m in oos_list]))

        # IS vs OOS degradation
        is_list = [f.is_metrics for f in folds if f.is_metrics.n_trades >= 5]
        avg_is_ret = float(np.mean([m.total_return_pct for m in is_list])) if is_list else 0
        degradation = avg_is_ret - avg_ret

        is_robust = valid_folds >= len(folds) // 2 and avg_pf > 1.0

        result = WalkForwardResult(
            folds=folds,
            avg_oos_win_rate=avg_wr,
            avg_oos_profit_factor=avg_pf,
            avg_oos_sharpe=avg_sh,
            avg_oos_max_drawdown=avg_dd,
            avg_oos_return=avg_ret,
            valid_folds=valid_folds,
            is_robust=is_robust,
            degradation=degradation,
        )

        logger.info(f"Walk-forward [{strategy_name}]: {result.summary()}")
        return result
