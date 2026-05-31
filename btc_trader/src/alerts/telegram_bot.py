"""
Telegram alert dispatcher.
Each alert includes: timeframe, strategy, reasons, confluence score, entry,
ATR stop, TP1/TP2, risk:reward, confidence, and counter-trend flag.
Rate-limited to prevent spam. Cooldown tracked per strategy.
"""

from __future__ import annotations

import asyncio
import os
import time
from typing import Dict, Optional

from dotenv import load_dotenv
from loguru import logger

load_dotenv()

try:
    from telegram import Bot
    from telegram.error import TelegramError
    TELEGRAM_AVAILABLE = True
except ImportError:
    TELEGRAM_AVAILABLE = False
    logger.warning("python-telegram-bot not installed — Telegram alerts disabled")

from src.confluence.signal_scorer import ScoredSignal
from src.core.risk_manager import TradeSetup


DIRECTION_EMOJI = {"long": "📈 LONG", "short": "📉 SHORT"}
STRATEGY_EMOJI = {"scalp": "⚡", "day": "🌅", "swing": "🌊"}


def _format_alert(scored: ScoredSignal, setup: TradeSetup, strategy_type: str) -> str:
    """Build the full Telegram message text."""
    signal = scored.raw
    direction_str = DIRECTION_EMOJI.get(signal.direction, signal.direction.upper())
    strategy_emoji = STRATEGY_EMOJI.get(strategy_type, "")
    counter_flag = " ⚠️ COUNTER-TREND" if scored.is_counter_trend else ""

    regime_str = f"{signal.regime.regime.upper()} (H={signal.regime.hurst:.2f})" if signal.regime else "N/A"
    trend_str = signal.regime.trend_direction if signal.regime else "N/A"

    # Score bar
    score_bar = "█" * int(scored.score / 10) + "░" * (10 - int(scored.score / 10))

    reasons_str = "\n".join(f"  • {r}" for r in scored.confluence_reasons[:8])

    rr_str = f"{setup.rr_ratio:.1f}R"
    confidence_pct = int(scored.score)

    lines = [
        f"{strategy_emoji} *BTC/USDT {direction_str}* {counter_flag}",
        f"",
        f"*Strategy:* {strategy_type.capitalize()} | *TF:* {signal.timeframe}",
        f"*Regime:* {regime_str} | *Trend:* {trend_str}",
        f"",
        f"📊 *Confluence Score: {scored.score:.0f}/100*",
        f"`{score_bar}` {confidence_pct}%",
        f"",
        f"*Entry:*    `${setup.entry:,.2f}`",
        f"*Stop:*     `${setup.stop_loss:,.2f}` (ATR×{setup.atr:.0f})",
        f"*TP1:*      `${setup.tp1:,.2f}` (R={setup.tp1_rr}R)",
        f"*TP2:*      `${setup.tp2:,.2f}` (R={setup.rr_ratio*2:.1f}R)",
        f"*Risk/Reward:* {rr_str}",
        f"*Position size:* {setup.position_size_pct:.1f}% capital",
        f"*Risk:* {setup.risk_pct:.2f}% capital",
        f"",
        f"*Signal Reasons:*",
        reasons_str,
        f"",
        f"*Score Breakdown:*",
    ]

    for component, val in scored.component_scores.items():
        lines.append(f"  {component}: {val:.1f}")

    if scored.is_counter_trend:
        lines.extend([
            f"",
            f"⚠️ *Counter-trend setup — higher risk. Reduce size.*",
        ])

    return "\n".join(lines)


class TelegramAlerter:
    def __init__(self, cfg: dict) -> None:
        self.cfg = cfg
        self.token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.chat_id = os.getenv("TELEGRAM_CHAT_ID", "")
        self.enabled = cfg.get("telegram_enabled", True) and TELEGRAM_AVAILABLE
        self.cooldown_minutes = cfg.get("cooldown_minutes", 15)
        self.max_per_hour = cfg.get("max_alerts_per_hour", 10)
        self._last_alert: Dict[str, float] = {}  # strategy → timestamp
        self._hour_count: Dict[str, list] = {}   # strategy → [timestamps]
        self._bot: Optional["Bot"] = None

    def _get_bot(self):
        if self._bot is None and TELEGRAM_AVAILABLE and self.token:
            self._bot = Bot(token=self.token)
        return self._bot

    def _is_rate_limited(self, strategy: str) -> bool:
        now = time.time()

        # Per-strategy cooldown
        last = self._last_alert.get(strategy, 0)
        if now - last < self.cooldown_minutes * 60:
            return True

        # Per-strategy hourly cap
        hour_window = [t for t in self._hour_count.get(strategy, []) if now - t < 3600]
        self._hour_count[strategy] = hour_window
        if len(hour_window) >= self.max_per_hour:
            return True

        return False

    def _record_alert(self, strategy: str) -> None:
        now = time.time()
        self._last_alert[strategy] = now
        self._hour_count.setdefault(strategy, []).append(now)

    async def send_alert(
        self,
        scored: ScoredSignal,
        setup: TradeSetup,
        strategy_type: str,
    ) -> bool:
        """Send a formatted alert. Returns True if sent, False if suppressed."""
        if not self.enabled:
            logger.info(f"[ALERT] {strategy_type} {scored.raw.direction} @ ${scored.raw.price:,.2f} "
                        f"| Score={scored.score:.0f} [Telegram disabled]")
            return False

        if not self.chat_id or not self.token:
            logger.warning("Telegram credentials not configured")
            return False

        if self._is_rate_limited(strategy_type):
            logger.debug(f"Alert suppressed (rate limit): {strategy_type}")
            return False

        text = _format_alert(scored, setup, strategy_type)

        try:
            bot = self._get_bot()
            if bot:
                await bot.send_message(
                    chat_id=self.chat_id,
                    text=text,
                    parse_mode="Markdown",
                )
                self._record_alert(strategy_type)
                logger.info(
                    f"Telegram alert sent: {strategy_type} {scored.raw.direction} "
                    f"@ ${setup.entry:,.2f} | Score={scored.score:.0f}"
                )
                return True
        except Exception as exc:
            logger.error(f"Telegram send failed: {exc}")

        return False

    def send_alert_sync(
        self,
        scored: ScoredSignal,
        setup: TradeSetup,
        strategy_type: str,
    ) -> bool:
        """Synchronous wrapper for send_alert."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.ensure_future(self.send_alert(scored, setup, strategy_type))
                return True
            return loop.run_until_complete(self.send_alert(scored, setup, strategy_type))
        except Exception as exc:
            logger.error(f"send_alert_sync error: {exc}")
            return False

    async def send_system_message(self, text: str) -> None:
        """Send a plain system notification (startup, shutdown, errors)."""
        if not self.enabled or not self.chat_id:
            return
        try:
            bot = self._get_bot()
            if bot:
                await bot.send_message(chat_id=self.chat_id, text=f"🤖 *System*: {text}", parse_mode="Markdown")
        except Exception as exc:
            logger.error(f"System message failed: {exc}")
