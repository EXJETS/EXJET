"""
Trading session classifier and liquidity pattern analysis.
Sessions are in UTC:
  Asian:   00:00 – 08:00
  London:  08:00 – 13:00
  NY:      13:00 – 21:00
  Overlap: 13:00 – 16:00  ← highest liquidity
  Dead:    21:00 – 00:00  ← avoid breakouts here
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional

import pandas as pd


@dataclass
class SessionContext:
    session: str               # "asian", "london", "ny", "overlap", "dead"
    is_high_liquidity: bool
    is_london_open: bool       # first 30 min of London — fake breakout zone
    is_ny_open: bool           # first 30 min of NY
    hour_utc: int
    day_of_week: int           # 0=Mon, 6=Sun
    is_weekend: bool
    liquidity_multiplier: float  # scale for confluence score (0.5–1.5)


def classify_session(dt: Optional[datetime] = None) -> SessionContext:
    """Classify a UTC timestamp into session context."""
    if dt is None:
        dt = datetime.now(timezone.utc)
    elif dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    h = dt.hour
    m = dt.minute
    dow = dt.weekday()
    is_weekend = dow >= 5

    # Session assignment
    if 0 <= h < 8:
        session = "asian"
        is_high_liq = False
        liq_mult = 0.7
    elif 8 <= h < 13:
        session = "london"
        is_high_liq = True
        liq_mult = 1.1
    elif 13 <= h < 16:
        session = "overlap"
        is_high_liq = True
        liq_mult = 1.4
    elif 16 <= h < 21:
        session = "ny"
        is_high_liq = True
        liq_mult = 1.2
    else:
        session = "dead"
        is_high_liq = False
        liq_mult = 0.6

    is_london_open = h == 8 and m < 30
    is_ny_open = h == 13 and m < 30

    # Weekend: lower liquidity
    if is_weekend:
        liq_mult *= 0.7
        is_high_liq = False

    return SessionContext(
        session=session,
        is_high_liquidity=is_high_liq,
        is_london_open=is_london_open,
        is_ny_open=is_ny_open,
        hour_utc=h,
        day_of_week=dow,
        is_weekend=is_weekend,
        liquidity_multiplier=round(liq_mult, 2),
    )


def session_score_multiplier(session_ctx: SessionContext, strategy_type: str) -> float:
    """
    Adjust confluence score based on session for different strategy types.
    Scalps need liquidity. Swing trades are session-agnostic.
    """
    if strategy_type == "scalp":
        return session_ctx.liquidity_multiplier
    elif strategy_type == "day":
        return max(0.8, session_ctx.liquidity_multiplier * 0.9)
    else:  # swing
        return 1.0


def is_fake_breakout_risk(session_ctx: SessionContext) -> bool:
    """London/NY open first 30 min = high fake-breakout risk."""
    return session_ctx.is_london_open or session_ctx.is_ny_open


def session_from_series_index(ts: pd.Timestamp) -> SessionContext:
    """Convert a pandas Timestamp to SessionContext."""
    dt = ts.to_pydatetime()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return classify_session(dt)
