"""
Base strategy class. All strategies inherit from this.
Provides: indicator computation, regime awareness, Bayesian tracking.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional

import pandas as pd
from loguru import logger

from src.core.indicators import compute_all
from src.core.market_structure import MarketStructureAnalyzer, StructureState
from src.core.regime_detector import RegimeDetector, RegimeState
from src.core.statistics import BayesianSignalWeighter, zscore


@dataclass
class RawSignal:
    """Raw signal from a single strategy before confluence scoring."""
    direction: str           # "long", "short", "none"
    strategy_name: str
    timeframe: str
    price: float
    timestamp: pd.Timestamp
    regime: RegimeState
    structure: StructureState
    reasons: List[str] = field(default_factory=list)
    base_confidence: float = 0.0

    def is_valid(self) -> bool:
        return self.direction in ("long", "short") and self.base_confidence > 0


class BaseStrategy(ABC):
    def __init__(
        self,
        name: str,
        cfg: dict,
        stats_cfg: dict,
        structure_cfg: dict,
    ) -> None:
        self.name = name
        self.cfg = cfg
        self.stats_cfg = stats_cfg
        self.regime_detector = RegimeDetector(stats_cfg)
        self.structure_analyzer = MarketStructureAnalyzer(structure_cfg)
        self.bayesian_tracker = BayesianSignalWeighter(name=name)
        self._prepared_cache: Dict[str, pd.DataFrame] = {}

    def prepare(self, df: pd.DataFrame, timeframe: str) -> pd.DataFrame:
        """Attach all indicators and cache result."""
        key = f"{timeframe}_{df.index[-1]}"
        if key not in self._prepared_cache:
            self._prepared_cache[key] = compute_all(df, self.stats_cfg)
            # Keep cache small
            if len(self._prepared_cache) > 5:
                oldest = next(iter(self._prepared_cache))
                del self._prepared_cache[oldest]
        return self._prepared_cache[key]

    def get_regime(self, df: pd.DataFrame) -> RegimeState:
        return self.regime_detector.detect(df)

    def get_structure(self, df: pd.DataFrame) -> StructureState:
        return self.structure_analyzer.analyze(df)

    @abstractmethod
    def generate_signal(
        self,
        dfs: Dict[str, pd.DataFrame],
    ) -> RawSignal:
        """
        dfs: dict of {timeframe: prepared_dataframe}
        Returns a RawSignal with direction and base_confidence.
        """
        ...

    def record_outcome(self, success: bool) -> None:
        """Call after a trade resolves to update Bayesian tracker."""
        self.bayesian_tracker.update(success)
        logger.debug(
            f"{self.name} Bayesian update: "
            f"win_rate={self.bayesian_tracker.posterior_mean:.2%}, "
            f"n={self.bayesian_tracker.n_trades}"
        )

    def bayesian_weight(self) -> float:
        return self.bayesian_tracker.weight()

    def should_be_disabled(self) -> bool:
        """Auto-flag if edge has degraded (Bayesian lower CI drops below 40%)."""
        if self.bayesian_tracker.n_trades < 20:
            return False
        return self.bayesian_tracker.lower_credible_interval < 0.40

    # ── Common signal helpers ──────────────────────────────────────────────────

    def _trend_direction(self, df: pd.DataFrame) -> str:
        """Simple EMA stack trend reading."""
        last = df.iloc[-1]
        price = last["close"]
        e9 = last.get("ema_9", price)
        e21 = last.get("ema_21", price)
        e50 = last.get("ema_50", price)
        if price > e9 > e21 > e50:
            return "bullish"
        if price < e9 < e21 < e50:
            return "bearish"
        return "neutral"

    def _momentum_score(self, last: pd.Series, direction: str) -> float:
        """0–1 score from RSI, MACD, Stochastic for given direction."""
        score = 0.0
        count = 0

        rsi = last.get("rsi", 50)
        if direction == "long":
            if 30 <= rsi <= 55:
                score += 0.8
            elif rsi < 30:
                score += 1.0  # oversold
            count += 1
        else:
            if 45 <= rsi <= 70:
                score += 0.8
            elif rsi > 70:
                score += 1.0  # overbought
            count += 1

        macd = last.get("macd", 0)
        macd_sig = last.get("macd_signal", 0)
        if direction == "long" and macd > macd_sig:
            score += 0.7
        elif direction == "short" and macd < macd_sig:
            score += 0.7
        count += 1

        k = last.get("stoch_k", 50)
        if direction == "long" and k < 30:
            score += 0.8
        elif direction == "short" and k > 70:
            score += 0.8
        count += 1

        return score / count if count > 0 else 0.5

    def _volume_score(self, last: pd.Series) -> float:
        """Returns 0–1; volume spike = higher score."""
        vr = last.get("volume_ratio", 1.0)
        return min(1.0, max(0.0, (vr - 0.5) / 2.0))
