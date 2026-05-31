"""
Smart money / ICT market structure concepts:
  - Swing highs / lows
  - Break of Structure (BOS)
  - Change of Character (CHoCH)
  - Order Blocks (OB)
  - Fair Value Gaps (FVG)
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple

import numpy as np
import pandas as pd
from loguru import logger


@dataclass
class SwingPoint:
    idx: int
    timestamp: pd.Timestamp
    price: float
    kind: str  # "high" or "low"


@dataclass
class OrderBlock:
    idx: int
    timestamp: pd.Timestamp
    top: float
    bottom: float
    kind: str    # "bullish" or "bearish"
    mitigated: bool = False


@dataclass
class FairValueGap:
    idx: int
    timestamp: pd.Timestamp
    top: float
    bottom: float
    kind: str    # "bullish" or "bearish"
    filled: bool = False


@dataclass
class StructureState:
    trend: str = "neutral"        # "bullish", "bearish", "neutral"
    last_bos: Optional[str] = None          # "bullish" or "bearish"
    last_choch: Optional[str] = None
    swing_highs: List[SwingPoint] = field(default_factory=list)
    swing_lows: List[SwingPoint] = field(default_factory=list)
    order_blocks: List[OrderBlock] = field(default_factory=list)
    fvgs: List[FairValueGap] = field(default_factory=list)
    bos_events: List[dict] = field(default_factory=list)
    choch_events: List[dict] = field(default_factory=list)


class MarketStructureAnalyzer:
    """
    Incrementally analyzes OHLCV data for smart money structure concepts.
    Call analyze(df) to get a StructureState snapshot.
    """

    def __init__(self, cfg: dict) -> None:
        self.swing_lookback = cfg.get("swing_lookback", 5)
        self.ob_lookback = cfg.get("ob_lookback", 3)
        self.fvg_min_size_atr = cfg.get("fvg_min_size_atr", 0.3)
        self.bos_lookback = cfg.get("bos_lookback", 20)

    # ── Swing Points ──────────────────────────────────────────────────────────

    def find_swing_points(self, df: pd.DataFrame) -> Tuple[List[SwingPoint], List[SwingPoint]]:
        lb = self.swing_lookback
        highs: List[SwingPoint] = []
        lows: List[SwingPoint] = []

        h = df["high"].values
        l = df["low"].values
        idx = df.index

        for i in range(lb, len(df) - lb):
            window_h = h[i - lb: i + lb + 1]
            window_l = l[i - lb: i + lb + 1]

            if h[i] == window_h.max():
                highs.append(SwingPoint(i, idx[i], h[i], "high"))
            if l[i] == window_l.min():
                lows.append(SwingPoint(i, idx[i], l[i], "low"))

        return highs, lows

    # ── Break of Structure ────────────────────────────────────────────────────

    def detect_bos(
        self,
        df: pd.DataFrame,
        swing_highs: List[SwingPoint],
        swing_lows: List[SwingPoint],
    ) -> List[dict]:
        """
        BOS = price closes BEYOND last significant swing high/low.
        Bullish BOS: close > last swing high (structure broken upward).
        Bearish BOS: close < last swing low (structure broken downward).
        """
        events: List[dict] = []
        if not swing_highs or not swing_lows:
            return events

        close = df["close"].values
        timestamps = df.index

        for i in range(1, len(df)):
            # find most recent swing high/low before bar i
            recent_highs = [sh for sh in swing_highs if sh.idx < i]
            recent_lows = [sl for sl in swing_lows if sl.idx < i]

            if recent_highs and close[i] > recent_highs[-1].price:
                if not events or events[-1]["kind"] != "bullish" or events[-1]["bar"] < i - 1:
                    events.append({
                        "bar": i,
                        "timestamp": timestamps[i],
                        "kind": "bullish",
                        "price": close[i],
                        "broken_level": recent_highs[-1].price,
                    })

            if recent_lows and close[i] < recent_lows[-1].price:
                if not events or events[-1]["kind"] != "bearish" or events[-1]["bar"] < i - 1:
                    events.append({
                        "bar": i,
                        "timestamp": timestamps[i],
                        "kind": "bearish",
                        "price": close[i],
                        "broken_level": recent_lows[-1].price,
                    })

        return events

    # ── Change of Character ───────────────────────────────────────────────────

    def detect_choch(
        self,
        swing_highs: List[SwingPoint],
        swing_lows: List[SwingPoint],
    ) -> List[dict]:
        """
        CHoCH = failed continuation of existing structure.
        In uptrend (higher highs): current swing low LOWER than previous → bearish CHoCH.
        In downtrend (lower lows): current swing high HIGHER than previous → bullish CHoCH.
        """
        events: List[dict] = []

        for i in range(1, len(swing_highs)):
            if swing_highs[i].price > swing_highs[i - 1].price:
                pass  # continuation of uptrend
            else:
                # failed high in uptrend context → check if lows are also breaking
                pass

        # CHoCH via swing low sequence
        for i in range(2, len(swing_lows)):
            sl_prev = swing_lows[i - 2]
            sl_curr = swing_lows[i - 1]
            sl_new = swing_lows[i]

            if sl_prev.price < sl_curr.price:  # uptrend (higher lows)
                if sl_new.price < sl_curr.price:  # new low breaks structure → bearish CHoCH
                    events.append({
                        "bar": sl_new.idx,
                        "timestamp": sl_new.timestamp,
                        "kind": "bearish",
                        "price": sl_new.price,
                    })

        for i in range(2, len(swing_highs)):
            sh_prev = swing_highs[i - 2]
            sh_curr = swing_highs[i - 1]
            sh_new = swing_highs[i]

            if sh_prev.price > sh_curr.price:  # downtrend (lower highs)
                if sh_new.price > sh_curr.price:  # new high breaks structure → bullish CHoCH
                    events.append({
                        "bar": sh_new.idx,
                        "timestamp": sh_new.timestamp,
                        "kind": "bullish",
                        "price": sh_new.price,
                    })

        return sorted(events, key=lambda x: x["bar"])

    # ── Order Blocks ──────────────────────────────────────────────────────────

    def find_order_blocks(self, df: pd.DataFrame) -> List[OrderBlock]:
        """
        Bullish OB: last bearish candle(s) before a strong bullish impulse.
        Bearish OB: last bullish candle(s) before a strong bearish impulse.
        Strong impulse = move > 2× ATR.
        """
        if "atr" not in df.columns:
            return []

        obs: List[OrderBlock] = []
        close = df["close"].values
        open_ = df["open"].values
        high = df["high"].values
        low = df["low"].values
        atr_val = df["atr"].values
        ts = df.index
        n = len(df)
        lb = self.ob_lookback

        for i in range(lb, n - 1):
            move = abs(close[i] - close[i - lb])
            if move < atr_val[i] * 1.5:
                continue

            # Bullish impulse (close > open before move)
            if close[i] > close[i - lb]:
                # find last bearish candle before impulse
                for j in range(i - 1, max(i - lb - 1, 0), -1):
                    if close[j] < open_[j]:  # bearish candle
                        obs.append(OrderBlock(
                            idx=j,
                            timestamp=ts[j],
                            top=high[j],
                            bottom=low[j],
                            kind="bullish",
                        ))
                        break

            # Bearish impulse
            elif close[i] < close[i - lb]:
                for j in range(i - 1, max(i - lb - 1, 0), -1):
                    if close[j] > open_[j]:  # bullish candle
                        obs.append(OrderBlock(
                            idx=j,
                            timestamp=ts[j],
                            top=high[j],
                            bottom=low[j],
                            kind="bearish",
                        ))
                        break

        # Mark mitigated OBs (price re-entered the block)
        for ob in obs:
            for i in range(ob.idx + 1, n):
                if ob.kind == "bullish" and low[i] <= ob.top and high[i] >= ob.bottom:
                    ob.mitigated = True
                    break
                if ob.kind == "bearish" and high[i] >= ob.bottom and low[i] <= ob.top:
                    ob.mitigated = True
                    break

        return obs

    # ── Fair Value Gaps ───────────────────────────────────────────────────────

    def find_fvgs(self, df: pd.DataFrame) -> List[FairValueGap]:
        """
        Bullish FVG: candle[i-1].high < candle[i+1].low (3-candle up-gap).
        Bearish FVG: candle[i-1].low > candle[i+1].high (3-candle down-gap).
        Gap must exceed fvg_min_size_atr * ATR to filter noise.
        """
        fvgs: List[FairValueGap] = []
        if "atr" not in df.columns or len(df) < 3:
            return fvgs

        high = df["high"].values
        low = df["low"].values
        atr_val = df["atr"].values
        ts = df.index
        n = len(df)

        for i in range(1, n - 1):
            min_size = atr_val[i] * self.fvg_min_size_atr

            # Bullish FVG
            gap_top = low[i + 1]
            gap_bottom = high[i - 1]
            if gap_top > gap_bottom and (gap_top - gap_bottom) >= min_size:
                fvg = FairValueGap(
                    idx=i,
                    timestamp=ts[i],
                    top=gap_top,
                    bottom=gap_bottom,
                    kind="bullish",
                )
                # Check if filled
                for j in range(i + 2, n):
                    if low[j] <= gap_bottom:
                        fvg.filled = True
                        break
                fvgs.append(fvg)

            # Bearish FVG
            gap_top2 = low[i - 1]
            gap_bottom2 = high[i + 1]
            if gap_top2 > gap_bottom2 and (gap_top2 - gap_bottom2) >= min_size:
                fvg = FairValueGap(
                    idx=i,
                    timestamp=ts[i],
                    top=gap_top2,
                    bottom=gap_bottom2,
                    kind="bearish",
                )
                for j in range(i + 2, n):
                    if high[j] >= gap_top2:
                        fvg.filled = True
                        break
                fvgs.append(fvg)

        return fvgs

    # ── Trend from swing sequence ─────────────────────────────────────────────

    def infer_trend(
        self,
        swing_highs: List[SwingPoint],
        swing_lows: List[SwingPoint],
        min_points: int = 3,
    ) -> str:
        if len(swing_highs) < min_points or len(swing_lows) < min_points:
            return "neutral"

        recent_sh = swing_highs[-min_points:]
        recent_sl = swing_lows[-min_points:]

        hh = all(recent_sh[i].price > recent_sh[i - 1].price for i in range(1, len(recent_sh)))
        hl = all(recent_sl[i].price > recent_sl[i - 1].price for i in range(1, len(recent_sl)))
        lh = all(recent_sh[i].price < recent_sh[i - 1].price for i in range(1, len(recent_sh)))
        ll = all(recent_sl[i].price < recent_sl[i - 1].price for i in range(1, len(recent_sl)))

        if hh and hl:
            return "bullish"
        if lh and ll:
            return "bearish"
        return "neutral"

    # ── Main analysis entry point ─────────────────────────────────────────────

    def analyze(self, df: pd.DataFrame) -> StructureState:
        state = StructureState()

        swing_highs, swing_lows = self.find_swing_points(df)
        state.swing_highs = swing_highs
        state.swing_lows = swing_lows
        state.trend = self.infer_trend(swing_highs, swing_lows)

        bos_events = self.detect_bos(df, swing_highs, swing_lows)
        state.bos_events = bos_events
        if bos_events:
            state.last_bos = bos_events[-1]["kind"]

        choch_events = self.detect_choch(swing_highs, swing_lows)
        state.choch_events = choch_events
        if choch_events:
            state.last_choch = choch_events[-1]["kind"]

        state.order_blocks = self.find_order_blocks(df)
        state.fvgs = self.find_fvgs(df)

        return state

    def price_near_ob(self, price: float, state: StructureState, atr: float) -> Optional[OrderBlock]:
        """Returns the most recent unmitigated OB that price is touching."""
        for ob in reversed(state.order_blocks):
            if ob.mitigated:
                continue
            tolerance = atr * 0.3
            if ob.bottom - tolerance <= price <= ob.top + tolerance:
                return ob
        return None

    def price_in_fvg(self, price: float, state: StructureState) -> Optional[FairValueGap]:
        """Returns the most recent unfilled FVG containing current price."""
        for fvg in reversed(state.fvgs):
            if fvg.filled:
                continue
            if fvg.bottom <= price <= fvg.top:
                return fvg
        return None
