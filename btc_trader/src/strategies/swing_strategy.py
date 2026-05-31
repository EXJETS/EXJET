"""
Swing trading strategy (4h/1d): 5%+ targets.

Logic:
  - Hurst + ADX regime detection
  - Weekly structure: HH/HL / LH/LL sequences
  - Cointegration spread for BTC/ETH divergence
  - 1d trend alignment required
  - ATR-based wide stops, Kelly sizing
  - Monte Carlo validated before each new campaign
"""

from __future__ import annotations

from typing import Dict, List, Optional

import pandas as pd
from loguru import logger

from src.core.statistics import zscore, test_cointegration, calculate_spread
from src.strategies.base_strategy import BaseStrategy, RawSignal


class SwingStrategy(BaseStrategy):
    def __init__(self, cfg: dict, stats_cfg: dict, structure_cfg: dict) -> None:
        super().__init__("swing", cfg, stats_cfg, structure_cfg)
        self.zscore_threshold = stats_cfg.get("zscore_entry_threshold", 2.0)
        self._cointegration_cache: Optional[dict] = None
        self._coint_last_update: Optional[pd.Timestamp] = None

    def generate_signal(
        self,
        dfs: Dict[str, pd.DataFrame],
        eth_df: Optional[pd.DataFrame] = None,
    ) -> RawSignal:
        """
        dfs must contain: "4h", "1d"
        eth_df: optional ETH/USDT 1d DataFrame for cointegration spread
        """
        tf_4h = dfs.get("4h")
        tf_1d = dfs.get("1d")

        if tf_4h is None or len(tf_4h) < 100:
            return RawSignal("none", self.name, "4h", 0, pd.Timestamp.now(), None, None)

        tf_4h = self.prepare(tf_4h, "4h")
        last_4h = tf_4h.iloc[-1]
        price = float(last_4h["close"])
        ts = tf_4h.index[-1]

        regime = self.get_regime(tf_4h)
        structure_4h = self.get_structure(tf_4h)

        direction = "none"
        reasons: List[str] = []
        confidence = 0.0

        # ── Daily trend — must confirm ────────────────────────────────────────
        daily_trend = "neutral"
        if tf_1d is not None and len(tf_1d) >= 50:
            tf_1d_prep = self.prepare(tf_1d, "1d")
            structure_1d = self.get_structure(tf_1d_prep)
            daily_trend = self._trend_direction(tf_1d_prep)
            regime_1d = self.get_regime(tf_1d_prep)

            # Weekly structure (via 1d swing sequence)
            sh_1d = structure_1d.swing_highs
            sl_1d = structure_1d.swing_lows
            if len(sh_1d) >= 3 and len(sl_1d) >= 3:
                daily_struct_trend = self.structure_analyzer.infer_trend(sh_1d, sl_1d, min_points=3)
                if daily_struct_trend == "bullish":
                    reasons.append("1d structure: HH/HL (bullish)")
                    if direction in ("long", "none"):
                        direction = "long"
                        confidence += 0.25
                elif daily_struct_trend == "bearish":
                    reasons.append("1d structure: LH/LL (bearish)")
                    if direction in ("short", "none"):
                        direction = "short"
                        confidence += 0.25

        # ── 4h structure: BOS / CHoCH ─────────────────────────────────────────
        if structure_4h.last_bos == "bullish" and daily_trend != "bearish":
            if direction in ("long", "none"):
                direction = "long"
                reasons.append("4h Bullish BOS")
                confidence += 0.20
        elif structure_4h.last_bos == "bearish" and daily_trend != "bullish":
            if direction in ("short", "none"):
                direction = "short"
                reasons.append("4h Bearish BOS")
                confidence += 0.20

        if structure_4h.last_choch == "bullish" and daily_trend in ("bullish", "neutral"):
            if direction in ("long", "none"):
                direction = "long"
                reasons.append("4h Bullish CHoCH (reversal)")
                confidence += 0.20
        elif structure_4h.last_choch == "bearish" and daily_trend in ("bearish", "neutral"):
            if direction in ("short", "none"):
                direction = "short"
                reasons.append("4h Bearish CHoCH (reversal)")
                confidence += 0.20

        # ── Hurst + ADX regime ────────────────────────────────────────────────
        if regime.favors_momentum():
            trend_4h = self._trend_direction(tf_4h)
            if trend_4h == "bullish" and direction in ("long", "none"):
                direction = "long"
                confidence += 0.15
                reasons.append(f"4h trending bullish (H={regime.hurst:.2f}, ADX={regime.adx:.0f})")
            elif trend_4h == "bearish" and direction in ("short", "none"):
                direction = "short"
                confidence += 0.15
                reasons.append(f"4h trending bearish (H={regime.hurst:.2f}, ADX={regime.adx:.0f})")

        elif regime.favors_mean_reversion():
            z = zscore(tf_4h["close"], 20).iloc[-1]
            if z < -self.zscore_threshold and direction in ("long", "none"):
                direction = "long"
                confidence += 0.15
                reasons.append(f"4h Z-score mean reversion ({z:.2f})")
            elif z > self.zscore_threshold and direction in ("short", "none"):
                direction = "short"
                confidence += 0.15
                reasons.append(f"4h Z-score mean reversion ({z:.2f})")

        if direction == "none":
            return RawSignal("none", self.name, "4h", price, ts, regime, structure_4h)

        # ── BTC/ETH cointegration spread ─────────────────────────────────────
        if eth_df is not None and len(eth_df) >= 100:
            btc_1d = tf_1d["close"] if tf_1d is not None and len(tf_1d) >= 100 else tf_4h["close"]
            eth_aligned = eth_df["close"].reindex(btc_1d.index, method="ffill").dropna()
            btc_aligned = btc_1d.reindex(eth_aligned.index).dropna()
            eth_aligned = eth_aligned.reindex(btc_aligned.index)

            if len(btc_aligned) >= 50:
                coint = test_cointegration(btc_aligned, eth_aligned)
                if coint["cointegrated"]:
                    spread = calculate_spread(btc_aligned, eth_aligned, coint["hedge_ratio"])
                    spread_z = spread.iloc[-1]
                    if spread_z < -1.5 and direction == "long":
                        reasons.append(f"BTC/ETH spread oversold (z={spread_z:.2f})")
                        confidence += 0.10
                    elif spread_z > 1.5 and direction == "short":
                        reasons.append(f"BTC/ETH spread overbought (z={spread_z:.2f})")
                        confidence += 0.10

        # ── Weekly key levels (Order Blocks 1d) ───────────────────────────────
        atr = float(last_4h.get("atr", price * 0.01))
        if tf_1d is not None and len(tf_1d) >= 50:
            tf_1d_prep = self.prepare(tf_1d, "1d")
            structure_1d_full = self.get_structure(tf_1d_prep)
            ob = self.structure_analyzer.price_near_ob(price, structure_1d_full, atr * 3)
            if ob and not ob.mitigated:
                ob_dir = "long" if ob.kind == "bullish" else "short"
                if ob_dir == direction:
                    reasons.append(f"1d {ob.kind.capitalize()} OB confluence")
                    confidence += 0.15

        # ── Daily RSI ────────────────────────────────────────────────────────
        if tf_1d is not None and len(tf_1d) >= 14:
            tf_1d_prep = self.prepare(tf_1d, "1d")
            daily_rsi = float(tf_1d_prep.iloc[-1].get("rsi", 50))
            if direction == "long" and daily_rsi < 40:
                reasons.append(f"Daily RSI oversold ({daily_rsi:.0f})")
                confidence += 0.10
            elif direction == "short" and daily_rsi > 60:
                reasons.append(f"Daily RSI overbought ({daily_rsi:.0f})")
                confidence += 0.10

        # ── Counter-trend check ────────────────────────────────────────────
        if direction == "long" and daily_trend == "bearish":
            reasons.append("⚠ Counter daily trend")
            confidence -= 0.30
        elif direction == "short" and daily_trend == "bullish":
            reasons.append("⚠ Counter daily trend")
            confidence -= 0.30

        # ── Volume on 4h ─────────────────────────────────────────────────────
        vol = self._volume_score(last_4h)
        confidence += vol * 0.10

        confidence = max(0.0, min(1.0, confidence))

        if confidence < 0.30:
            return RawSignal("none", self.name, "4h", price, ts, regime, structure_4h,
                             reasons=reasons, base_confidence=confidence)

        logger.debug(f"Swing signal: {direction} @ {price:.2f} | conf={confidence:.2f}")
        return RawSignal(
            direction=direction,
            strategy_name=self.name,
            timeframe="4h",
            price=price,
            timestamp=ts,
            regime=regime,
            structure=structure_4h,
            reasons=reasons,
            base_confidence=confidence,
        )

    def signal_fn(self, df: pd.DataFrame, i: int) -> Optional[str]:
        """For BacktestEngine."""
        if i < 100:
            return None
        sub = df.iloc[:i + 1]
        regime = self.get_regime(sub)
        trend = self._trend_direction(sub)
        last = sub.iloc[-1]

        adx = last.get("adx", 0)
        rsi = last.get("rsi", 50)

        if regime.favors_momentum() and adx >= 25:
            if trend == "bullish" and rsi < 60:
                return "long"
            if trend == "bearish" and rsi > 40:
                return "short"

        if regime.favors_mean_reversion():
            z = zscore(sub["close"], 20).iloc[-1]
            if z < -self.zscore_threshold:
                return "long"
            if z > self.zscore_threshold:
                return "short"

        return None
