"""
Multi-timeframe filter.

Rules:
  5m signal   → requires 15m and 1h trend agreement (or neutral)
  15m signal  → requires 1h and 4h trend agreement
  1h signal   → requires 4h trend agreement
  4h signal   → requires 1d trend agreement
Counter-trend setups are flagged but not blocked — they get a score penalty.
"""

from __future__ import annotations

from typing import Dict, Optional

import pandas as pd
from loguru import logger

from src.core.indicators import compute_all


def get_ema_trend(df: pd.DataFrame) -> str:
    """Fast EMA stack classification."""
    if len(df) < 50:
        return "neutral"
    last = df.iloc[-1]
    c = last["close"]
    e9 = last.get("ema_9", c)
    e21 = last.get("ema_21", c)
    e50 = last.get("ema_50", c)
    if c > e9 > e21 > e50:
        return "bullish"
    if c < e9 < e21 < e50:
        return "bearish"
    return "neutral"


MTF_RULES: Dict[str, list] = {
    "1m":  ["5m", "15m"],
    "5m":  ["15m", "1h"],
    "15m": ["1h", "4h"],
    "1h":  ["4h"],
    "4h":  ["1d"],
    "1d":  [],
}


class MTFFilter:
    def __init__(self, stats_cfg: dict) -> None:
        self.stats_cfg = stats_cfg

    def evaluate(
        self,
        signal_timeframe: str,
        signal_direction: str,
        dfs: Dict[str, pd.DataFrame],
        pre_computed: bool = False,
    ) -> dict:
        """
        Returns:
          aligned: True if all required HTFs agree or are neutral
          htf_trend: trend of the primary HTF
          counter_trend: True if any HTF disagrees
          details: dict of {tf: trend} for debug
        """
        required_tfs = MTF_RULES.get(signal_timeframe, [])
        trends: Dict[str, str] = {}

        for tf in required_tfs:
            df = dfs.get(tf)
            if df is None or len(df) < 50:
                trends[tf] = "neutral"
                continue

            if "ema_9" not in df.columns:
                df = compute_all(df, self.stats_cfg)

            trends[tf] = get_ema_trend(df)

        # Primary HTF is first in required list
        htf_trend = trends.get(required_tfs[0], "neutral") if required_tfs else "neutral"

        counter_trend = False
        for tf, trend in trends.items():
            direction_equiv = "bullish" if signal_direction == "long" else "bearish"
            if trend != "neutral" and trend != direction_equiv:
                counter_trend = True
                logger.debug(f"MTF counter-trend: {tf} is {trend}, signal={signal_direction}")
                break

        aligned = not counter_trend

        return {
            "aligned": aligned,
            "htf_trend": htf_trend,
            "counter_trend": counter_trend,
            "details": trends,
        }
