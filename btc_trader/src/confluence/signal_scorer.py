"""
Confluence signal scorer.

Takes a RawSignal and behavioral context, computes a weighted score 0–100.
An alert only fires if the score exceeds the configured threshold.

Weights (configurable, default sum=100):
  htf_trend:        20  — higher-timeframe trend alignment
  momentum:         15  — RSI, MACD, Stochastic
  volume:           15  — volume spike confirmation
  market_structure: 20  — BOS, CHoCH, OB, FVG
  behavioral:       20  — liquidity sweep, funding, F&G, round numbers
  statistical:      10  — z-score, regime quality
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional

import pandas as pd
from loguru import logger

from src.behavioral.fear_greed import FearGreedSignal, fear_greed_score_contribution
from src.behavioral.funding_rate import FundingSignal, funding_score_contribution
from src.behavioral.liquidity_sweep import LiquiditySweep, round_number_distance_pct
from src.core.market_structure import StructureState
from src.core.regime_detector import RegimeState
from src.strategies.base_strategy import RawSignal


@dataclass
class ScoredSignal:
    raw: RawSignal
    score: float                # 0–100
    component_scores: Dict[str, float]
    fires: bool                 # True if score >= threshold
    is_counter_trend: bool
    confluence_reasons: list

    def format_score_breakdown(self) -> str:
        lines = [f"Score: {self.score:.1f}/100 | Fires: {'YES' if self.fires else 'NO'}"]
        for k, v in self.component_scores.items():
            lines.append(f"  {k}: {v:.1f}")
        return "\n".join(lines)


class ConfluenceScorer:
    def __init__(self, cfg: dict) -> None:
        weights = cfg.get("weights", {})
        self.w_htf = weights.get("htf_trend", 20)
        self.w_momentum = weights.get("momentum", 15)
        self.w_volume = weights.get("volume", 15)
        self.w_structure = weights.get("market_structure", 20)
        self.w_behavioral = weights.get("behavioral", 20)
        self.w_statistical = weights.get("statistical", 10)
        self.min_score = cfg.get("min_score_fire", 65)
        self.counter_trend_penalty = cfg.get("counter_trend_penalty", 20)

    def score(
        self,
        signal: RawSignal,
        htf_trend: str,                         # "bullish", "bearish", "neutral"
        funding: Optional[FundingSignal] = None,
        fear_greed: Optional[FearGreedSignal] = None,
        latest_sweep: Optional[LiquiditySweep] = None,
        bayesian_weight: float = 0.5,
        prepared_df: Optional[pd.DataFrame] = None,
    ) -> ScoredSignal:
        direction = signal.direction
        reasons = list(signal.reasons)
        components: Dict[str, float] = {}
        is_counter_trend = False

        # ── 1. HTF Trend (0–20) ───────────────────────────────────────────────
        if htf_trend == "neutral":
            htf_score = self.w_htf * 0.5
        elif htf_trend == direction.replace("long", "bullish").replace("short", "bearish"):
            htf_score = self.w_htf * 1.0
        else:
            htf_score = 0.0
            is_counter_trend = True
            reasons.append(f"Counter HTF trend ({htf_trend})")
        components["htf_trend"] = round(htf_score, 1)

        # ── 2. Momentum (0–15) ────────────────────────────────────────────────
        mom_raw = 0.5  # default
        if prepared_df is not None and len(prepared_df) > 0:
            last = prepared_df.iloc[-1]
            rsi = float(last.get("rsi", 50))
            macd = float(last.get("macd", 0))
            macd_sig = float(last.get("macd_signal", 0))
            k = float(last.get("stoch_k", 50))

            rsi_score = 0.0
            if direction == "long":
                if rsi < 30: rsi_score = 1.0
                elif rsi < 50: rsi_score = 0.7
                elif rsi > 70: rsi_score = 0.0
                else: rsi_score = 0.4
            else:
                if rsi > 70: rsi_score = 1.0
                elif rsi > 50: rsi_score = 0.7
                elif rsi < 30: rsi_score = 0.0
                else: rsi_score = 0.4

            macd_score = 1.0 if (direction == "long" and macd > macd_sig) or \
                                 (direction == "short" and macd < macd_sig) else 0.0
            stoch_score = 0.0
            if direction == "long" and k < 30: stoch_score = 1.0
            elif direction == "short" and k > 70: stoch_score = 1.0
            elif 30 <= k <= 70: stoch_score = 0.5

            mom_raw = (rsi_score + macd_score + stoch_score) / 3

        mom_score = self.w_momentum * mom_raw
        components["momentum"] = round(mom_score, 1)

        # ── 3. Volume (0–15) ──────────────────────────────────────────────────
        vol_raw = 0.5
        if prepared_df is not None and len(prepared_df) > 0:
            vr = float(prepared_df.iloc[-1].get("volume_ratio", 1.0))
            vol_raw = min(1.0, max(0.0, (vr - 0.5) / 2.0))
        vol_score = self.w_volume * vol_raw
        components["volume"] = round(vol_score, 1)

        # ── 4. Market Structure (0–20) ────────────────────────────────────────
        struct_raw = 0.0
        count = 0
        if signal.structure:
            st = signal.structure

            # BOS
            if st.last_bos:
                expected = "bullish" if direction == "long" else "bearish"
                struct_raw += 1.0 if st.last_bos == expected else 0.0
                count += 1

            # CHoCH
            if st.last_choch:
                expected = "bullish" if direction == "long" else "bearish"
                struct_raw += 0.8 if st.last_choch == expected else 0.0
                count += 1

            # Order blocks
            unmitigated_obs = [ob for ob in st.order_blocks if not ob.mitigated]
            if unmitigated_obs:
                correct_obs = [ob for ob in unmitigated_obs
                               if (direction == "long" and ob.kind == "bullish") or
                                  (direction == "short" and ob.kind == "bearish")]
                struct_raw += 0.7 if correct_obs else 0.0
                count += 1

            # FVGs
            unfilled_fvgs = [fvg for fvg in st.fvgs if not fvg.filled]
            if unfilled_fvgs:
                correct_fvgs = [fvg for fvg in unfilled_fvgs
                                if (direction == "long" and fvg.kind == "bullish") or
                                   (direction == "short" and fvg.kind == "bearish")]
                struct_raw += 0.6 if correct_fvgs else 0.0
                count += 1

        struct_raw = (struct_raw / count) if count > 0 else 0.3
        struct_score = self.w_structure * struct_raw
        components["market_structure"] = round(struct_score, 1)

        # ── 5. Behavioral (0–20) ─────────────────────────────────────────────
        beh_raw = 0.5
        beh_count = 1  # start at 1 for base

        # Liquidity sweep
        if latest_sweep is not None:
            sweep_conf = latest_sweep.confidence
            if latest_sweep.fade_direction == direction:
                beh_raw += sweep_conf * 0.8
                reasons.append(f"Liquidity sweep fade (conf={sweep_conf:.2f})")
            beh_count += 1

        # Funding rate
        if funding is not None:
            fund_contrib = funding_score_contribution(funding, direction)
            beh_raw += fund_contrib
            beh_count += 1
            if funding.sentiment != "neutral":
                reasons.append(f"Funding {funding.sentiment} → {funding.bias}")

        # Fear & Greed
        if fear_greed is not None:
            fg_contrib = fear_greed_score_contribution(fear_greed, direction)
            beh_raw += fg_contrib
            beh_count += 1
            if fear_greed.contrarian_bias != "neutral":
                reasons.append(f"F&G={fear_greed.value} ({fear_greed.classification})")

        # Round number proximity
        rn_dist = round_number_distance_pct(signal.price)
        if rn_dist < 0.001:
            beh_raw += 0.3
            reasons.append(f"Round number proximity ({rn_dist*100:.3f}%)")
            beh_count += 1

        beh_raw /= beh_count
        beh_score = self.w_behavioral * min(1.0, beh_raw)
        components["behavioral"] = round(beh_score, 1)

        # ── 6. Statistical (0–10) ─────────────────────────────────────────────
        stat_raw = 0.5
        if signal.regime:
            regime = signal.regime
            if regime.should_trade():
                stat_raw += 0.2
            if not regime.should_trade():
                stat_raw = 0.1
            # Regime conviction
            stat_raw = min(1.0, stat_raw + regime.strength * 0.3)

        # Bayesian weight contribution
        stat_raw = stat_raw * 0.7 + bayesian_weight * 0.3

        stat_score = self.w_statistical * stat_raw
        components["statistical"] = round(stat_score, 1)

        # ── Total ─────────────────────────────────────────────────────────────
        total = sum(components.values())

        # Counter-trend penalty
        if is_counter_trend:
            total = max(0, total - self.counter_trend_penalty)
            reasons.append(f"Counter-trend penalty −{self.counter_trend_penalty}")

        total = round(min(100.0, total), 1)
        fires = total >= self.min_score and signal.direction != "none"

        logger.debug(
            f"Confluence score [{signal.strategy_name} {signal.timeframe}]: "
            f"{total}/100 | fires={fires} | counter_trend={is_counter_trend}"
        )

        return ScoredSignal(
            raw=signal,
            score=total,
            component_scores=components,
            fires=fires,
            is_counter_trend=is_counter_trend,
            confluence_reasons=reasons,
        )
