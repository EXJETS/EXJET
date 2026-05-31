"""
Scalp strategy (1m/5m): 0.3–0.8% targets.

Logic:
  - Mean-reversion Z-score on 5m
  - Liquidity sweep fade
  - Order block + FVG entries
  - Session-filtered (overlap/NY/London only)
  - Requires 15m and 1h trend confirmation (or neutral)
"""

from __future__ import annotations

from typing import Dict, List, Optional

import pandas as pd
from loguru import logger

from src.behavioral.liquidity_sweep import LiquiditySweepDetector, is_near_round_number
from src.behavioral.session_patterns import classify_session, session_from_series_index
from src.core.statistics import zscore
from src.strategies.base_strategy import BaseStrategy, RawSignal


class ScalpStrategy(BaseStrategy):
    def __init__(self, cfg: dict, stats_cfg: dict, structure_cfg: dict) -> None:
        super().__init__("scalp", cfg, stats_cfg, structure_cfg)
        self.sweep_detector = LiquiditySweepDetector(cfg.get("behavioral", {}))
        self.zscore_threshold = stats_cfg.get("zscore_entry_threshold", 2.0)
        self.zscore_window = stats_cfg.get("zscore_window", 20)

    def generate_signal(self, dfs: Dict[str, pd.DataFrame]) -> RawSignal:
        """
        dfs must contain keys: "5m", "15m", "1h"
        Signal timeframe: 5m
        Confirmation: 15m and 1h
        """
        tf_5m = dfs.get("5m")
        tf_15m = dfs.get("15m")
        tf_1h = dfs.get("1h")

        if tf_5m is None or len(tf_5m) < 50:
            return RawSignal("none", self.name, "5m", 0, pd.Timestamp.now(), None, None)

        tf_5m = self.prepare(tf_5m, "5m")
        last = tf_5m.iloc[-1]
        price = float(last["close"])
        ts = tf_5m.index[-1]

        regime = self.get_regime(tf_5m)
        structure = self.get_structure(tf_5m)

        # Session filter: scalps only in liquid sessions
        session = session_from_series_index(ts)
        if not session.is_high_liquidity:
            return RawSignal("none", self.name, "5m", price, ts, regime, structure,
                             reasons=["Low liquidity session"])

        direction = "none"
        reasons: List[str] = []
        confidence = 0.0

        # ── Z-score mean reversion (works best in ranging regime) ─────────────
        z = zscore(tf_5m["close"], self.zscore_window).iloc[-1]
        if regime.favors_mean_reversion():
            if z < -self.zscore_threshold:
                direction = "long"
                reasons.append(f"Z-score={z:.2f} (oversold, ranging)")
                confidence += 0.35
            elif z > self.zscore_threshold:
                direction = "short"
                reasons.append(f"Z-score={z:.2f} (overbought, ranging)")
                confidence += 0.35

        # ── Liquidity sweep fade ─────────────────────────────────────────────
        sh = structure.swing_highs
        sl = structure.swing_lows
        sweeps = self.sweep_detector.detect(tf_5m, sh, sl)
        latest_sweep = self.sweep_detector.latest_sweep(sweeps, max_bars_ago=2, current_bar=len(tf_5m) - 1)

        if latest_sweep is not None:
            if latest_sweep.fade_direction == "long" and direction in ("long", "none"):
                direction = "long"
                reasons.append(f"Bearish sweep fade @ {latest_sweep.swept_level:.0f}")
                confidence += 0.30 * latest_sweep.confidence
            elif latest_sweep.fade_direction == "short" and direction in ("short", "none"):
                direction = "short"
                reasons.append(f"Bullish sweep fade @ {latest_sweep.swept_level:.0f}")
                confidence += 0.30 * latest_sweep.confidence

        # ── Order Block entry ────────────────────────────────────────────────
        atr = float(last.get("atr", price * 0.001))
        ob = self.structure_analyzer.price_near_ob(price, structure, atr)
        if ob is not None and not ob.mitigated:
            ob_dir = "long" if ob.kind == "bullish" else "short"
            if direction == "none" or direction == ob_dir:
                direction = ob_dir
                reasons.append(f"{ob.kind.capitalize()} OB @ {ob.bottom:.0f}–{ob.top:.0f}")
                confidence += 0.20

        # ── FVG fill ─────────────────────────────────────────────────────────
        fvg = self.structure_analyzer.price_in_fvg(price, structure)
        if fvg is not None and not fvg.filled:
            fvg_dir = "long" if fvg.kind == "bullish" else "short"
            if direction == "none" or direction == fvg_dir:
                direction = fvg_dir
                reasons.append(f"{fvg.kind.capitalize()} FVG @ {fvg.bottom:.0f}–{fvg.top:.0f}")
                confidence += 0.15

        # ── Round number proximity (fade extreme extensions) ──────────────────
        if is_near_round_number(price):
            reasons.append(f"Near round number @ {price:.0f}")
            confidence += 0.05

        # ── HTF confirmation: 15m and 1h must agree or be neutral ────────────
        if direction != "none" and tf_15m is not None and tf_1h is not None:
            tf_15m_prep = self.prepare(tf_15m, "15m")
            tf_1h_prep = self.prepare(tf_1h, "1h")
            trend_15m = self._trend_direction(tf_15m_prep)
            trend_1h = self._trend_direction(tf_1h_prep)

            counter_trend = False
            if direction == "long" and trend_1h == "bearish":
                reasons.append("⚠ Counter 1h trend")
                confidence -= 0.20
                counter_trend = True
            elif direction == "short" and trend_1h == "bullish":
                reasons.append("⚠ Counter 1h trend")
                confidence -= 0.20
                counter_trend = True

            if not counter_trend:
                if (direction == "long" and trend_15m == "bullish") or \
                   (direction == "short" and trend_15m == "bearish"):
                    confidence += 0.10
                    reasons.append(f"15m trend confirms")

        # ── Momentum confirmation ────────────────────────────────────────────
        if direction != "none":
            mom = self._momentum_score(last, direction)
            confidence += mom * 0.15
            if mom > 0.6:
                reasons.append(f"Momentum OK (score={mom:.2f})")

        # ── Volume confirmation ──────────────────────────────────────────────
        vol = self._volume_score(last)
        confidence += vol * 0.10
        if vol > 0.5:
            reasons.append(f"Volume spike (ratio={last.get('volume_ratio', 1):.1f}x)")

        confidence = max(0.0, min(1.0, confidence))

        if direction == "none" or confidence < 0.35:
            return RawSignal("none", self.name, "5m", price, ts, regime, structure,
                             reasons=reasons, base_confidence=confidence)

        logger.debug(f"Scalp signal: {direction} @ {price:.2f} | conf={confidence:.2f} | {reasons}")
        return RawSignal(
            direction=direction,
            strategy_name=self.name,
            timeframe="5m",
            price=price,
            timestamp=ts,
            regime=regime,
            structure=structure,
            reasons=reasons,
            base_confidence=confidence,
        )

    # ── Backtest signal function (for BacktestEngine) ─────────────────────────

    def signal_fn(self, df: pd.DataFrame, i: int) -> Optional[str]:
        """For use with BacktestEngine — no HTF context, 5m-only."""
        if i < 50:
            return None
        sub = df.iloc[:i + 1]
        z = zscore(sub["close"], self.zscore_window).iloc[-1]
        atr = sub["atr"].iloc[-1] if "atr" in sub.columns else sub["close"].iloc[-1] * 0.01

        regime = self.get_regime(sub)

        if regime.favors_mean_reversion():
            if z < -self.zscore_threshold:
                return "long"
            if z > self.zscore_threshold:
                return "short"

        # Trend-following via EMA in trending regime
        if regime.favors_momentum():
            last = sub.iloc[-1]
            trend = self._trend_direction(sub)
            rsi_val = last.get("rsi", 50)
            if trend == "bullish" and 40 <= rsi_val <= 60:
                return "long"
            if trend == "bearish" and 40 <= rsi_val <= 60:
                return "short"

        return None
