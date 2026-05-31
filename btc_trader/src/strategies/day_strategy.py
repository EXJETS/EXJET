"""
Day trading strategy (15m/1h): 1–3% targets.

Logic:
  - Regime-adaptive: momentum in trending, mean-reversion in ranging
  - BOS/CHoCH structure-based entries
  - MACD + RSI confluence on 1h
  - 4h trend confirmation required
  - Breakout fakeout filter: wait for retest + volume, not first candle
"""

from __future__ import annotations

from typing import Dict, List, Optional

import pandas as pd
from loguru import logger

from src.core.statistics import zscore
from src.strategies.base_strategy import BaseStrategy, RawSignal


class DayStrategy(BaseStrategy):
    def __init__(self, cfg: dict, stats_cfg: dict, structure_cfg: dict) -> None:
        super().__init__("day", cfg, stats_cfg, structure_cfg)
        self.zscore_threshold = stats_cfg.get("zscore_entry_threshold", 2.0)
        self.zscore_window = stats_cfg.get("zscore_window", 20)

    def generate_signal(self, dfs: Dict[str, pd.DataFrame]) -> RawSignal:
        """
        dfs must contain: "15m", "1h", "4h"
        Signal timeframe: 1h
        Confirmation: 4h
        """
        tf_1h = dfs.get("1h")
        tf_4h = dfs.get("4h")
        tf_15m = dfs.get("15m")

        if tf_1h is None or len(tf_1h) < 50:
            return RawSignal("none", self.name, "1h", 0, pd.Timestamp.now(), None, None)

        tf_1h = self.prepare(tf_1h, "1h")
        last = tf_1h.iloc[-1]
        price = float(last["close"])
        ts = tf_1h.index[-1]

        regime = self.get_regime(tf_1h)
        structure = self.get_structure(tf_1h)

        direction = "none"
        reasons: List[str] = []
        confidence = 0.0

        # ── Get 4h context ───────────────────────────────────────────────────
        htf_trend = "neutral"
        if tf_4h is not None and len(tf_4h) >= 50:
            tf_4h_prep = self.prepare(tf_4h, "4h")
            htf_trend = self._trend_direction(tf_4h_prep)
            htf_regime = self.get_regime(tf_4h_prep)
        else:
            htf_regime = regime

        # ── Trending regime: BOS + momentum entry ────────────────────────────
        if regime.favors_momentum() or htf_trend in ("bullish", "bearish"):
            # BOS-based entry
            if structure.last_bos == "bullish":
                if htf_trend != "bearish":
                    direction = "long"
                    reasons.append("Bullish BOS on 1h")
                    confidence += 0.30
            elif structure.last_bos == "bearish":
                if htf_trend != "bullish":
                    direction = "short"
                    reasons.append("Bearish BOS on 1h")
                    confidence += 0.30

            # CHoCH entry (early trend reversal)
            if structure.last_choch == "bullish" and htf_trend != "bearish":
                direction = "long"
                reasons.append("Bullish CHoCH (trend reversal)")
                confidence += 0.25
            elif structure.last_choch == "bearish" and htf_trend != "bullish":
                direction = "short"
                reasons.append("Bearish CHoCH (trend reversal)")
                confidence += 0.25

            # EMA trend alignment
            trend_1h = self._trend_direction(tf_1h)
            if trend_1h == "bullish" and direction in ("long", "none"):
                direction = "long"
                reasons.append(f"1h EMA bullish stack")
                confidence += 0.15
            elif trend_1h == "bearish" and direction in ("short", "none"):
                direction = "short"
                reasons.append(f"1h EMA bearish stack")
                confidence += 0.15

        # ── Ranging regime: Z-score / BB mean reversion ──────────────────────
        if regime.favors_mean_reversion() or htf_trend == "neutral":
            z = zscore(tf_1h["close"], self.zscore_window).iloc[-1]
            bb_pct_b = float(last.get("bb_pct_b", 0.5))

            if z < -self.zscore_threshold and bb_pct_b < 0.1:
                if direction in ("long", "none"):
                    direction = "long"
                    reasons.append(f"Z-score={z:.2f} + BB oversold (ranging)")
                    confidence += 0.35
            elif z > self.zscore_threshold and bb_pct_b > 0.9:
                if direction in ("short", "none"):
                    direction = "short"
                    reasons.append(f"Z-score={z:.2f} + BB overbought (ranging)")
                    confidence += 0.35

        if direction == "none":
            return RawSignal("none", self.name, "1h", price, ts, regime, structure,
                             reasons=reasons, base_confidence=0.0)

        # ── Breakout fakeout filter ───────────────────────────────────────────
        # Don't enter on first candle of breakout — require retest + volume
        recent_bos = [b for b in structure.bos_events if b["kind"] == direction.replace("long", "bullish").replace("short", "bearish")]
        if recent_bos:
            last_bos_bar = recent_bos[-1]["bar"]
            bars_since_bos = len(tf_1h) - 1 - last_bos_bar
            if bars_since_bos == 0:
                reasons.append("⚠ First candle breakout — waiting for retest")
                confidence -= 0.20

        # ── MACD momentum ────────────────────────────────────────────────────
        macd = float(last.get("macd", 0))
        macd_sig = float(last.get("macd_signal", 0))
        macd_hist = float(last.get("macd_hist", 0))

        if direction == "long":
            if macd > macd_sig and macd_hist > 0:
                confidence += 0.15
                reasons.append("MACD bullish cross")
            elif macd < macd_sig:
                confidence -= 0.10
                reasons.append("⚠ MACD bearish")
        else:
            if macd < macd_sig and macd_hist < 0:
                confidence += 0.15
                reasons.append("MACD bearish cross")
            elif macd > macd_sig:
                confidence -= 0.10
                reasons.append("⚠ MACD bullish")

        # ── RSI filter ───────────────────────────────────────────────────────
        rsi = float(last.get("rsi", 50))
        if direction == "long":
            if 40 <= rsi <= 65:
                confidence += 0.10
            elif rsi > 70:
                confidence -= 0.15
                reasons.append("⚠ RSI overbought")
        else:
            if 35 <= rsi <= 60:
                confidence += 0.10
            elif rsi < 30:
                confidence -= 0.15
                reasons.append("⚠ RSI oversold")

        # ── HTF trend confirmation/penalty ───────────────────────────────────
        counter_trend = False
        if direction == "long" and htf_trend == "bearish":
            reasons.append("⚠ Counter 4h trend (bearish)")
            confidence -= 0.25
            counter_trend = True
        elif direction == "short" and htf_trend == "bullish":
            reasons.append("⚠ Counter 4h trend (bullish)")
            confidence -= 0.25
            counter_trend = True
        elif direction == "long" and htf_trend == "bullish":
            confidence += 0.15
            reasons.append("4h trend confirms (bullish)")
        elif direction == "short" and htf_trend == "bearish":
            confidence += 0.15
            reasons.append("4h trend confirms (bearish)")

        # ── Order block / FVG context ────────────────────────────────────────
        atr = float(last.get("atr", price * 0.005))
        ob = self.structure_analyzer.price_near_ob(price, structure, atr)
        if ob and not ob.mitigated:
            ob_dir = "long" if ob.kind == "bullish" else "short"
            if ob_dir == direction:
                reasons.append(f"{ob.kind.capitalize()} OB confluence")
                confidence += 0.10

        # ── Volume ───────────────────────────────────────────────────────────
        vol = self._volume_score(last)
        confidence += vol * 0.10
        if vol > 0.5:
            reasons.append(f"Volume confirmation ({last.get('volume_ratio', 1):.1f}x)")

        confidence = max(0.0, min(1.0, confidence))

        if confidence < 0.30:
            return RawSignal("none", self.name, "1h", price, ts, regime, structure,
                             reasons=reasons, base_confidence=confidence)

        logger.debug(f"Day signal: {direction} @ {price:.2f} | conf={confidence:.2f}")
        return RawSignal(
            direction=direction,
            strategy_name=self.name,
            timeframe="1h",
            price=price,
            timestamp=ts,
            regime=regime,
            structure=structure,
            reasons=reasons,
            base_confidence=confidence,
        )

    def signal_fn(self, df: pd.DataFrame, i: int) -> Optional[str]:
        """For BacktestEngine."""
        if i < 50:
            return None
        sub = df.iloc[:i + 1]
        regime = self.get_regime(sub)
        last = sub.iloc[-1]
        trend = self._trend_direction(sub)

        if regime.favors_momentum():
            rsi = last.get("rsi", 50)
            macd = last.get("macd", 0)
            macd_sig = last.get("macd_signal", 0)
            if trend == "bullish" and macd > macd_sig and 40 <= rsi <= 65:
                return "long"
            if trend == "bearish" and macd < macd_sig and 35 <= rsi <= 60:
                return "short"

        elif regime.favors_mean_reversion():
            z = zscore(sub["close"], self.zscore_window).iloc[-1]
            if z < -self.zscore_threshold:
                return "long"
            if z > self.zscore_threshold:
                return "short"

        return None
