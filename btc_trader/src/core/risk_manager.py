"""
Risk manager: ATR-based dynamic stops, fractional Kelly sizing,
drawdown tracking, consecutive-loss circuit breakers.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple

import numpy as np
import pandas as pd
from loguru import logger

from src.core.statistics import fractional_kelly


@dataclass
class TradeSetup:
    """All risk parameters for a single alert/trade."""
    direction: str           # "long" or "short"
    entry: float
    stop_loss: float
    tp1: float
    tp2: float
    risk_pct: float          # % of capital at risk
    position_size_pct: float # % of capital to allocate
    atr: float
    rr_ratio: float
    notes: str = ""

    @property
    def stop_distance(self) -> float:
        return abs(self.entry - self.stop_loss)

    @property
    def tp1_distance(self) -> float:
        return abs(self.tp1 - self.entry)


@dataclass
class DrawdownTracker:
    """Tracks equity curve and circuit-breaker state."""
    peak_equity: float
    current_equity: float
    consecutive_losses: int = 0
    paused: bool = False
    reduced: bool = False
    loss_history: List[float] = field(default_factory=list)

    def update(self, pnl: float) -> None:
        self.current_equity += pnl
        if self.current_equity > self.peak_equity:
            self.peak_equity = self.current_equity
            self.consecutive_losses = 0  # reset on new high
        if pnl < 0:
            self.consecutive_losses += 1
            self.loss_history.append(pnl)
        else:
            self.consecutive_losses = 0

    @property
    def drawdown_pct(self) -> float:
        if self.peak_equity <= 0:
            return 0.0
        return (self.peak_equity - self.current_equity) / self.peak_equity

    def check_circuit_breakers(self, cfg: dict) -> None:
        pause_dd = cfg.get("drawdown_pause_threshold", 0.10)
        reduce_dd = cfg.get("drawdown_reduce_threshold", 0.07)
        loss_pause = cfg.get("consecutive_loss_pause", 4)

        if self.drawdown_pct >= pause_dd or self.consecutive_losses >= loss_pause:
            if not self.paused:
                logger.warning(
                    f"CIRCUIT BREAKER: drawdown={self.drawdown_pct:.1%}, "
                    f"consecutive_losses={self.consecutive_losses} → PAUSING alerts"
                )
            self.paused = True
        elif self.drawdown_pct >= reduce_dd:
            self.reduced = True
            self.paused = False
        else:
            self.paused = False
            self.reduced = False


class RiskManager:
    def __init__(self, cfg: dict, initial_capital: float = 10000.0) -> None:
        self.cfg = cfg
        self.kelly_fraction = cfg.get("kelly_fraction", 0.25)
        self.kelly_max = cfg.get("kelly_max_position", 0.10)
        self.tp1_rr = cfg.get("tp1_rr", 1.5)
        self.tp2_rr = cfg.get("tp2_rr", 3.0)
        self.drawdown_tracker = DrawdownTracker(
            peak_equity=initial_capital,
            current_equity=initial_capital,
        )

    def build_setup(
        self,
        direction: str,
        entry: float,
        atr: float,
        atr_multiplier: float,
        win_rate: float = 0.55,
        avg_win_pct: float = 0.02,
        avg_loss_pct: float = 0.01,
    ) -> TradeSetup:
        """
        Construct full trade setup: stop, TP1/TP2, position size.
        direction: "long" or "short"
        """
        stop_distance = atr * atr_multiplier

        if direction == "long":
            stop_loss = entry - stop_distance
            tp1 = entry + stop_distance * self.tp1_rr
            tp2 = entry + stop_distance * self.tp2_rr
        else:
            stop_loss = entry + stop_distance
            tp1 = entry - stop_distance * self.tp1_rr
            tp2 = entry - stop_distance * self.tp2_rr

        # Reduce position if circuit breaker active
        size_multiplier = 1.0
        if self.drawdown_tracker.reduced:
            size_multiplier = self.cfg.get("size_reduction_after_losses", 0.5)

        pos_size = fractional_kelly(
            win_rate, avg_win_pct, avg_loss_pct,
            fraction=self.kelly_fraction * size_multiplier,
            max_position=self.kelly_max,
        )

        # risk_pct = what % of capital is at risk = pos_size * stop_distance / entry
        risk_pct = pos_size * (stop_distance / entry)
        rr = (stop_distance * self.tp1_rr) / stop_distance  # = tp1_rr

        return TradeSetup(
            direction=direction,
            entry=entry,
            stop_loss=round(stop_loss, 2),
            tp1=round(tp1, 2),
            tp2=round(tp2, 2),
            risk_pct=round(risk_pct * 100, 2),
            position_size_pct=round(pos_size * 100, 2),
            atr=round(atr, 2),
            rr_ratio=round(rr, 2),
        )

    def is_paused(self) -> bool:
        self.drawdown_tracker.check_circuit_breakers(self.cfg)
        return self.drawdown_tracker.paused

    def record_trade(self, pnl: float) -> None:
        self.drawdown_tracker.update(pnl)

    def drawdown_info(self) -> dict:
        dt = self.drawdown_tracker
        return {
            "current_equity": round(dt.current_equity, 2),
            "peak_equity": round(dt.peak_equity, 2),
            "drawdown_pct": round(dt.drawdown_pct * 100, 2),
            "consecutive_losses": dt.consecutive_losses,
            "paused": dt.paused,
            "reduced": dt.reduced,
        }
