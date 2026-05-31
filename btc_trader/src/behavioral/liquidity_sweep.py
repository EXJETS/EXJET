"""
Liquidity sweep detection.

A sweep occurs when price wicks through a cluster of stops (swing high/low)
but then CLOSES back inside — the move was manufactured to grab liquidity,
not a genuine breakout. We fade the sweep direction.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import pandas as pd
from loguru import logger

from src.core.market_structure import SwingPoint


@dataclass
class LiquiditySweep:
    bar_idx: int
    timestamp: pd.Timestamp
    kind: str              # "bullish_sweep" (wick above high, close below) or "bearish_sweep"
    swept_level: float
    close_price: float
    fade_direction: str    # "short" for bullish_sweep, "long" for bearish_sweep
    confidence: float      # 0–1


class LiquiditySweepDetector:
    """
    Tracks recent swing highs/lows and detects when price briefly exceeds
    them (wick) but closes back — classic stop-hunt / liquidity grab pattern.
    """

    def __init__(self, cfg: dict) -> None:
        self.lookback = cfg.get("liquidity_sweep_lookback", 30)
        self.retest_bars = cfg.get("liquidity_retest_bars", 5)
        self.wick_ratio_min = 0.5   # wick must be >= 50% of candle range beyond level

    def detect(
        self,
        df: pd.DataFrame,
        swing_highs: List[SwingPoint],
        swing_lows: List[SwingPoint],
    ) -> List[LiquiditySweep]:
        sweeps: List[LiquiditySweep] = []
        if len(df) < 3:
            return sweeps

        high = df["high"].values
        low = df["low"].values
        close = df["close"].values
        open_ = df["open"].values
        ts = df.index
        n = len(df)

        # Only consider recent swing levels
        relevant_highs = [sh for sh in swing_highs if sh.idx >= max(0, n - self.lookback)]
        relevant_lows = [sl for sl in swing_lows if sl.idx >= max(0, n - self.lookback)]

        for i in range(1, n):
            candle_range = high[i] - low[i]
            if candle_range < 1e-6:
                continue

            # Bullish sweep: wick above a swing high, close back below it
            for sh in relevant_highs:
                if sh.idx >= i:
                    continue
                level = sh.price
                if high[i] > level and close[i] < level:
                    # Wick above level
                    wick_above = high[i] - level
                    # Close should be clearly below level (at least 30% of wick back)
                    if close[i] < level and wick_above / candle_range >= 0.2:
                        # Bearish close (swept above, closed below) → fade = SHORT
                        body_close = abs(close[i] - open_[i])
                        confidence = min(1.0, wick_above / candle_range + body_close / candle_range)
                        sweeps.append(LiquiditySweep(
                            bar_idx=i,
                            timestamp=ts[i],
                            kind="bullish_sweep",
                            swept_level=level,
                            close_price=close[i],
                            fade_direction="short",
                            confidence=round(min(confidence, 1.0), 2),
                        ))

            # Bearish sweep: wick below swing low, close back above it
            for sl in relevant_lows:
                if sl.idx >= i:
                    continue
                level = sl.price
                if low[i] < level and close[i] > level:
                    wick_below = level - low[i]
                    if close[i] > level and wick_below / candle_range >= 0.2:
                        body_close = abs(close[i] - open_[i])
                        confidence = min(1.0, wick_below / candle_range + body_close / candle_range)
                        sweeps.append(LiquiditySweep(
                            bar_idx=i,
                            timestamp=ts[i],
                            kind="bearish_sweep",
                            swept_level=level,
                            close_price=close[i],
                            fade_direction="long",
                            confidence=round(min(confidence, 1.0), 2),
                        ))

        return sweeps

    def latest_sweep(
        self,
        sweeps: List[LiquiditySweep],
        max_bars_ago: int = 3,
        current_bar: int = None,
    ) -> Optional[LiquiditySweep]:
        if not sweeps:
            return None
        if current_bar is None:
            return sweeps[-1]
        recent = [s for s in sweeps if current_bar - s.bar_idx <= max_bars_ago]
        return recent[-1] if recent else None


def is_near_round_number(price: float, proximity_pct: float = 0.001) -> bool:
    """Returns True if price is within proximity_pct of a round thousand or 500."""
    for base in [1000, 500, 100]:
        nearest = round(price / base) * base
        if nearest > 0 and abs(price - nearest) / nearest <= proximity_pct:
            return True
    return False


def round_number_distance_pct(price: float) -> float:
    """Returns distance (%) to nearest significant round number."""
    candidates = []
    for base in [10000, 5000, 1000, 500]:
        nearest = round(price / base) * base
        if nearest > 0:
            candidates.append(abs(price - nearest) / nearest)
    return min(candidates) if candidates else 1.0
