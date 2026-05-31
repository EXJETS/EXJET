"""
Regime detector: classifies market as trending / ranging / volatile / choppy.
Uses Hurst exponent + ADX + ATR percentile.
Each regime switches strategy logic:
  trending  → momentum / breakout strategies
  ranging   → mean-reversion / Z-score strategies
  volatile  → stand aside or reduce size
  choppy    → stand aside
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import pandas as pd
from loguru import logger

from src.core.statistics import hurst_exponent, classify_regime_hurst


@dataclass
class RegimeState:
    regime: str          # "trending", "ranging", "volatile", "choppy"
    hurst: float
    adx: float
    atr_pct: float
    atr_pct_rank: float  # 0–1 percentile of current ATR vs. rolling window
    trend_direction: str  # "bullish", "bearish", "neutral"
    strength: float      # 0–1 confidence in the regime classification

    def should_trade(self) -> bool:
        return self.regime not in ("volatile", "choppy")

    def favors_mean_reversion(self) -> bool:
        return self.regime == "ranging"

    def favors_momentum(self) -> bool:
        return self.regime == "trending"


class RegimeDetector:
    def __init__(self, cfg: dict) -> None:
        self.hurst_window = cfg.get("hurst_window", 100)
        self.hurst_trending = cfg.get("hurst_trending_threshold", 0.55)
        self.hurst_ranging = cfg.get("hurst_ranging_threshold", 0.45)
        self.adx_trending = cfg.get("adx_trending_threshold", 25)
        self.adx_strong = cfg.get("adx_strong_trend", 40)
        self.atr_volatile_pct = 0.80  # top 20% ATR = volatile
        self.atr_window = 50  # for ATR percentile

    def detect(self, df: pd.DataFrame) -> RegimeState:
        """Compute regime for the most recent bar of df."""
        if len(df) < self.hurst_window:
            return RegimeState("choppy", 0.5, 0.0, 0.0, 0.5, "neutral", 0.0)

        close = df["close"]
        last = df.iloc[-1]

        # Hurst on last hurst_window closes
        h = hurst_exponent(close.tail(self.hurst_window))
        hurst_regime = classify_regime_hurst(h, self.hurst_trending, self.hurst_ranging)

        # ADX
        adx_val = last.get("adx", 20.0)
        plus_di = last.get("plus_di", 0.0)
        minus_di = last.get("minus_di", 0.0)

        # ATR percentile
        atr_pct_val = last.get("atr_pct", 1.0)
        if "atr_pct" in df.columns:
            atr_series = df["atr_pct"].dropna().tail(self.atr_window)
            rank = float((atr_series < atr_pct_val).mean()) if len(atr_series) > 5 else 0.5
        else:
            rank = 0.5

        # Trend direction
        ema_9 = last.get("ema_9", close.iloc[-1])
        ema_21 = last.get("ema_21", close.iloc[-1])
        ema_50 = last.get("ema_50", close.iloc[-1])
        price = close.iloc[-1]

        if price > ema_9 > ema_21 > ema_50:
            trend_dir = "bullish"
        elif price < ema_9 < ema_21 < ema_50:
            trend_dir = "bearish"
        else:
            trend_dir = "neutral"

        # Regime classification
        # Volatile: very high ATR rank (abnormal volatility — stand aside)
        if rank > self.atr_volatile_pct and atr_pct_val > 3.0:
            regime = "volatile"
            strength = rank

        # Trending: Hurst trending + ADX confirms
        elif hurst_regime == "trending" and adx_val >= self.adx_trending:
            regime = "trending"
            strength = min(1.0, (h - self.hurst_trending) * 5 + (adx_val - self.adx_trending) / 30)

        # Ranging: Hurst mean-reverting
        elif hurst_regime == "ranging" and adx_val < self.adx_trending:
            regime = "ranging"
            strength = min(1.0, (self.hurst_ranging - h) * 5 + (self.adx_trending - adx_val) / 30)

        # Choppy: mixed signals
        else:
            regime = "choppy"
            strength = 0.3

        return RegimeState(
            regime=regime,
            hurst=h,
            adx=adx_val,
            atr_pct=atr_pct_val,
            atr_pct_rank=rank,
            trend_direction=trend_dir,
            strength=float(strength),
        )
