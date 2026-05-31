"""
Fear & Greed Index fetcher and signal generator.
Source: alternative.me (free, no API key needed).
Extreme fear = contrarian long bias.
Extreme greed = contrarian short bias.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Optional

import requests
from loguru import logger

FEAR_GREED_URL = "https://api.alternative.me/fng/?limit=1"


@dataclass
class FearGreedSignal:
    value: int             # 0–100
    classification: str    # "Extreme Fear", "Fear", "Neutral", "Greed", "Extreme Greed"
    timestamp: int
    contrarian_bias: str   # "long", "short", "neutral"
    strength: float        # 0–1


_cache: Optional[FearGreedSignal] = None
_cache_time: float = 0.0
_cache_ttl: float = 3600.0  # 1 hour


def fetch_fear_greed(refresh_minutes: int = 60) -> FearGreedSignal:
    global _cache, _cache_time
    if _cache is not None and (time.time() - _cache_time) < refresh_minutes * 60:
        return _cache

    try:
        resp = requests.get(FEAR_GREED_URL, timeout=5)
        resp.raise_for_status()
        data = resp.json()["data"][0]
        val = int(data["value"])
        classification = data["value_classification"]

        if val <= 20:
            bias = "long"
            strength = (20 - val) / 20
        elif val >= 80:
            bias = "short"
            strength = (val - 80) / 20
        else:
            bias = "neutral"
            strength = 0.0

        signal = FearGreedSignal(
            value=val,
            classification=classification,
            timestamp=int(data["timestamp"]),
            contrarian_bias=bias,
            strength=round(min(strength, 1.0), 3),
        )
        _cache = signal
        _cache_time = time.time()
        logger.info(f"Fear & Greed: {val} ({classification}) → bias={bias}")
        return signal

    except Exception as exc:
        logger.warning(f"Fear & Greed fetch failed: {exc}")
        if _cache:
            return _cache
        return FearGreedSignal(50, "Neutral", 0, "neutral", 0.0)


def fear_greed_score_contribution(signal: FearGreedSignal, trade_direction: str) -> float:
    """0–1 confluence contribution. Contrarian: extreme readings favor opposite direction."""
    if signal.contrarian_bias == "neutral":
        return 0.5
    if signal.contrarian_bias == trade_direction:
        return 0.5 + signal.strength * 0.5
    return 0.5 - signal.strength * 0.3
