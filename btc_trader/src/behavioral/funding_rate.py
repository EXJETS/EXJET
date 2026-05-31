"""
Funding rate sentiment analysis.
High positive funding = longs are overcrowded (fragile, bias short).
High negative funding = shorts are overcrowded (fragile, bias long).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from loguru import logger


@dataclass
class FundingSignal:
    rate: float            # current funding rate (e.g. 0.0001 = 0.01%)
    annualized: float      # rate * 3 * 365 for context
    sentiment: str         # "crowded_long", "crowded_short", "neutral"
    bias: str              # "short", "long", "neutral"
    strength: float        # 0–1


def analyze_funding(rate: float, extreme_threshold: float = 0.0001) -> FundingSignal:
    """
    Classify funding rate.
    Binance: funding paid every 8h. Rate of 0.01% = 0.0001.
    """
    annualized = rate * 3 * 365  # 3 payments/day * 365

    if rate > extreme_threshold:
        sentiment = "crowded_long"
        bias = "short"
        strength = min(1.0, rate / (extreme_threshold * 3))
    elif rate < -extreme_threshold:
        sentiment = "crowded_short"
        bias = "long"
        strength = min(1.0, abs(rate) / (extreme_threshold * 3))
    else:
        sentiment = "neutral"
        bias = "neutral"
        strength = 0.0

    return FundingSignal(
        rate=rate,
        annualized=round(annualized * 100, 2),
        sentiment=sentiment,
        bias=bias,
        strength=round(strength, 3),
    )


def funding_score_contribution(signal: FundingSignal, trade_direction: str) -> float:
    """
    Returns 0–1 contribution to confluence score.
    1.0 if funding confirms direction, 0.0 if neutral, penalize if counter.
    """
    if signal.sentiment == "neutral":
        return 0.5

    if signal.bias == trade_direction:
        return 0.7 + signal.strength * 0.3
    else:
        return 0.5 - signal.strength * 0.5
