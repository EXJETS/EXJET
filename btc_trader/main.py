"""
BTC Algorithmic Trading System — Main Orchestrator
Alerts-only mode (no live order execution).

Startup sequence:
  1. Load config + validate environment
  2. Download historical data for all timeframes
  3. Run backtests + walk-forward validation for all strategies
  4. Only enable strategies that pass validation
  5. Start WebSocket live feed
  6. On each closed candle: update data → run strategies → score confluence → alert
"""

from __future__ import annotations

import asyncio
import os
import signal
import sys
from pathlib import Path
from typing import Dict, Optional

import pandas as pd
import yaml
from dotenv import load_dotenv
from loguru import logger

# ── Setup path ─────────────────────────────────────────────────────────────
sys.path.insert(0, str(Path(__file__).parent))

load_dotenv()

# ── Imports ────────────────────────────────────────────────────────────────
from src.alerts.telegram_bot import TelegramAlerter
from src.backtesting.backtest_engine import BacktestConfig, BacktestEngine
from src.backtesting.metrics import BacktestMetrics
from src.backtesting.monte_carlo import format_mc_report, run_monte_carlo
from src.backtesting.walk_forward import WalkForwardTester
from src.behavioral.fear_greed import FearGreedSignal, fetch_fear_greed
from src.behavioral.funding_rate import FundingSignal, analyze_funding
from src.behavioral.liquidity_sweep import LiquiditySweepDetector
from src.confluence.mtf_filter import MTFFilter
from src.confluence.signal_scorer import ConfluenceScorer, ScoredSignal
from src.core.indicators import compute_all
from src.core.risk_manager import RiskManager
from src.data.binance_client import BinanceClient, WebSocketFeed
from src.paper_trading.paper_trader import PaperTrader
from src.strategies.day_strategy import DayStrategy
from src.strategies.scalp_strategy import ScalpStrategy
from src.strategies.swing_strategy import SwingStrategy


def load_config(path: str = "config.yaml") -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


def setup_logging(cfg: dict) -> None:
    log_cfg = cfg.get("logging", {})
    logger.remove()
    logger.add(
        sys.stderr,
        level=log_cfg.get("level", "INFO"),
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | {message}",
    )
    logger.add(
        log_cfg.get("file", "logs/btc_trader.log"),
        rotation=log_cfg.get("rotation", "50 MB"),
        retention=log_cfg.get("retention", "30 days"),
        level="DEBUG",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{line} | {message}",
    )


class TradingSystem:
    def __init__(self, config_path: str = "config.yaml") -> None:
        self.cfg = load_config(config_path)
        setup_logging(self.cfg)
        logger.info("=" * 60)
        logger.info("BTC Algorithmic Trading System — Starting")
        logger.info("=" * 60)

        self.binance = BinanceClient()
        self.data: Dict[str, pd.DataFrame] = {}   # {timeframe: df}
        self.symbol = self.cfg["binance"]["symbol"]
        self.timeframes = self.cfg["binance"]["timeframes"]
        self.lookback = self.cfg["binance"]["lookback_bars"]

        # Components
        stats_cfg = self.cfg["statistics"]
        structure_cfg = self.cfg["market_structure"]
        beh_cfg = self.cfg["behavioral"]
        bt_cfg = self.cfg["backtesting"]
        risk_cfg = self.cfg["risk"]
        alert_cfg = self.cfg["alerts"]

        self.scalp = ScalpStrategy(self.cfg["strategies"]["scalp"], stats_cfg, structure_cfg)
        self.day = DayStrategy(self.cfg["strategies"]["day"], stats_cfg, structure_cfg)
        self.swing = SwingStrategy(self.cfg["strategies"]["swing"], stats_cfg, structure_cfg)

        self.scorer = ConfluenceScorer(self.cfg["confluence"])
        self.mtf_filter = MTFFilter(stats_cfg)
        self.risk_manager = RiskManager(risk_cfg, initial_capital=bt_cfg["initial_capital"])
        self.alerter = TelegramAlerter(alert_cfg)
        self.paper_trader = PaperTrader(self.cfg["paper_trading"])
        self.sweep_detector = LiquiditySweepDetector(beh_cfg)

        # Backtest config
        self.bt_config = BacktestConfig(
            initial_capital=bt_cfg["initial_capital"],
            fee_rate=bt_cfg["fee_rate"],
            slippage_pct=bt_cfg["slippage_pct"],
            min_trades=bt_cfg["min_trades_valid"],
        )

        self._enabled_strategies: Dict[str, bool] = {}
        self._running = False

    # ── Phase 1: Data Loading ──────────────────────────────────────────────

    def load_historical_data(self) -> None:
        logger.info("Loading historical data for all timeframes...")
        bt_cfg = self.cfg["backtesting"]
        for tf in self.timeframes:
            logger.info(f"  Downloading {self.symbol} {tf}...")
            try:
                df = self.binance.get_klines_cached(
                    self.symbol,
                    tf,
                    bt_cfg["start_date"],
                    bt_cfg["end_date"],
                )
                # Compute all indicators
                df = compute_all(df, self.cfg["statistics"])
                self.data[tf] = df
                logger.info(f"  {tf}: {len(df)} candles ({df.index[0].date()} → {df.index[-1].date()})")
            except Exception as exc:
                logger.error(f"  Failed to load {tf}: {exc}")

    def load_live_data(self) -> None:
        """Load recent candles for live operation (last lookback_bars bars)."""
        for tf in self.timeframes:
            try:
                df = self.binance.get_klines(self.symbol, tf, limit=self.lookback)
                df = compute_all(df, self.cfg["statistics"])
                self.data[tf] = df
            except Exception as exc:
                logger.error(f"Failed to load live {tf}: {exc}")

    # ── Phase 2: Backtesting & Validation ─────────────────────────────────

    def validate_strategies(self) -> None:
        logger.info("=" * 50)
        logger.info("PHASE 2: BACKTESTING & VALIDATION")
        logger.info("=" * 50)
        engine = BacktestEngine(self.bt_config)
        wf_tester = WalkForwardTester(
            self.bt_config,
            n_splits=self.cfg["backtesting"]["walk_forward_n_splits"],
            train_pct=self.cfg["backtesting"]["walk_forward_train_pct"],
        )

        strategies_to_validate = []

        if self.cfg["strategies"]["scalp"]["enabled"] and "5m" in self.data:
            strategies_to_validate.append(("scalp", self.scalp.signal_fn, "5m"))
        if self.cfg["strategies"]["day"]["enabled"] and "1h" in self.data:
            strategies_to_validate.append(("day", self.day.signal_fn, "1h"))
        if self.cfg["strategies"]["swing"]["enabled"] and "4h" in self.data:
            strategies_to_validate.append(("swing", self.swing.signal_fn, "4h"))

        for name, signal_fn, tf in strategies_to_validate:
            df = self.data.get(tf)
            if df is None:
                logger.warning(f"No data for {name} strategy ({tf})")
                self._enabled_strategies[name] = False
                continue

            logger.info(f"\n── {name.upper()} Strategy [{tf}] ──────────────────────")

            # Backtest
            bt_metrics, trades = engine.run_with_trades(df, signal_fn)
            logger.info(f"Backtest: {bt_metrics.summary()}")

            # Walk-forward
            wf = wf_tester.run(df, signal_fn, name)
            logger.info(f"Walk-Forward: {wf.summary()}")

            # Monte Carlo
            if len(trades) >= 10:
                mc = run_monte_carlo(trades, self.bt_config.initial_capital,
                                     self.cfg["backtesting"]["monte_carlo_simulations"])
                logger.info(f"\n{format_mc_report(mc, self.bt_config.initial_capital)}")
            else:
                mc = None

            # Decision: enable strategy?
            enabled = bt_metrics.is_valid and wf.is_robust
            self._enabled_strategies[name] = enabled

            if enabled:
                logger.info(f"✅ {name.upper()} strategy ENABLED (passed validation)")
            else:
                notes = bt_metrics.notes if not bt_metrics.is_valid else "Walk-forward not robust"
                logger.warning(f"❌ {name.upper()} strategy DISABLED — {notes}")

        logger.info(f"\nEnabled strategies: {[k for k, v in self._enabled_strategies.items() if v]}")
        logger.info("=" * 50)

    # ── Phase 3: Live Feed ─────────────────────────────────────────────────

    async def on_candle(self, symbol: str, interval: str, candle: pd.Series) -> None:
        """Called on each closed candle from the WebSocket feed."""
        if interval not in self.data:
            return

        # Append new candle to rolling DataFrame
        df = self.data[interval]
        new_row = pd.DataFrame([candle]).set_index("open_time")
        df = pd.concat([df, new_row]).iloc[-self.lookback:]
        df = compute_all(df, self.cfg["statistics"])
        self.data[interval] = df

        # Update paper trading
        current_price = float(candle["close"])
        closed_ids = self.paper_trader.update_prices(current_price)
        for tid in closed_ids:
            logger.info(f"Paper trade auto-closed: {tid}")

        # Run strategies on relevant timeframes
        await self._run_strategy_pipeline(interval, current_price)

        # Periodic edge check
        if len(self.paper_trader.closed_trades) % 20 == 0 and self.paper_trader.closed_trades:
            degraded = self.paper_trader.flag_degraded_strategies()
            if degraded:
                await self.alerter.send_system_message(
                    f"⚠️ Edge degradation detected in: {', '.join(degraded)}. Review live performance."
                )

    async def _run_strategy_pipeline(self, closed_tf: str, price: float) -> None:
        """Run all applicable strategies when a candle of the given timeframe closes."""
        if self.risk_manager.is_paused():
            return

        # Fetch behavioral context
        try:
            funding_rate = self.binance.get_funding_rate(self.symbol)
            funding = analyze_funding(funding_rate, self.cfg["behavioral"]["funding_extreme_threshold"])
            fear_greed = fetch_fear_greed(self.cfg["behavioral"]["fear_greed_refresh_minutes"])
        except Exception:
            funding, fear_greed = None, None

        # ── Scalp (fires on 5m candle close) ─────────────────────────────────
        if closed_tf == "5m" and self._enabled_strategies.get("scalp", False):
            await self._process_strategy("scalp", self.scalp, "5m", funding, fear_greed)

        # ── Day (fires on 1h candle close) ────────────────────────────────────
        if closed_tf == "1h" and self._enabled_strategies.get("day", False):
            await self._process_strategy("day", self.day, "1h", funding, fear_greed)

        # ── Swing (fires on 4h candle close) ─────────────────────────────────
        if closed_tf == "4h" and self._enabled_strategies.get("swing", False):
            await self._process_strategy("swing", self.swing, "4h", funding, fear_greed)

    async def _process_strategy(self, name, strategy, tf, funding, fear_greed) -> None:
        try:
            # Generate raw signal
            raw_signal = strategy.generate_signal(self.data)
            if not raw_signal.is_valid():
                return

            # MTF filter
            mtf = self.mtf_filter.evaluate(
                tf, raw_signal.direction, self.data
            )
            htf_trend = mtf["htf_trend"]

            # Get latest sweep
            structure = raw_signal.structure
            if structure and "atr" in self.data[tf].columns:
                sweeps = self.sweep_detector.detect(
                    self.data[tf].tail(50),
                    structure.swing_highs[-30:] if structure.swing_highs else [],
                    structure.swing_lows[-30:] if structure.swing_lows else [],
                )
                latest_sweep = self.sweep_detector.latest_sweep(sweeps, max_bars_ago=3, current_bar=49)
            else:
                latest_sweep = None

            # Score confluence
            scored = self.scorer.score(
                raw_signal,
                htf_trend=htf_trend,
                funding=funding,
                fear_greed=fear_greed,
                latest_sweep=latest_sweep,
                bayesian_weight=strategy.bayesian_weight(),
                prepared_df=self.data[tf],
            )

            if not scored.fires:
                logger.debug(f"{name} signal rejected: score={scored.score:.0f} < {self.cfg['confluence']['min_score_fire']}")
                return

            # Build trade setup
            last = self.data[tf].iloc[-1]
            atr = float(last.get("atr", raw_signal.price * 0.01))
            atr_multiplier = self.cfg["strategies"][name]["atr_stop_multiplier"]

            setup = self.risk_manager.build_setup(
                direction=raw_signal.direction,
                entry=raw_signal.price,
                atr=atr,
                atr_multiplier=atr_multiplier,
                win_rate=strategy.bayesian_weight(),
            )

            # Send Telegram alert
            await self.alerter.send_alert(scored, setup, name)

            # Open paper trade
            if self.cfg["paper_trading"]["enabled"]:
                self.paper_trader.open_trade(scored, setup, name)

            logger.info(
                f"🔔 SIGNAL FIRED: {name.upper()} {raw_signal.direction.upper()} @ ${raw_signal.price:,.2f} | "
                f"Score={scored.score:.0f}/100 | SL=${setup.stop_loss:,.2f} | TP1=${setup.tp1:,.2f}"
            )

        except Exception as exc:
            logger.error(f"Strategy pipeline error [{name}]: {exc}", exc_info=True)

    # ── Main Entry Points ──────────────────────────────────────────────────

    async def run_live(self) -> None:
        """Full live trading pipeline."""
        self._running = True

        await self.alerter.send_system_message("BTC Trading System started — alerts mode active")

        # Load recent data
        self.load_live_data()
        logger.info(f"Live data loaded: {list(self.data.keys())}")

        # Start WebSocket
        ws = WebSocketFeed(
            symbol=self.symbol,
            timeframes=self.timeframes,
            on_candle=self.on_candle,
            reconnect_delay=self.cfg["binance"]["reconnect_delay"],
        )

        logger.info(f"Starting WebSocket feed for {self.symbol}...")
        await ws.run()

    def run_backtest_only(self) -> None:
        """Run backtesting and validation without going live."""
        self.load_historical_data()
        self.validate_strategies()
        logger.info("\nBacktest-only mode complete.")
        self._print_summary()

    def _print_summary(self) -> None:
        logger.info("\n" + "=" * 60)
        logger.info("STRATEGY VALIDATION SUMMARY")
        logger.info("=" * 60)
        for name, enabled in self._enabled_strategies.items():
            status = "✅ ENABLED" if enabled else "❌ DISABLED"
            logger.info(f"  {name.upper():10s}: {status}")
        dd = self.risk_manager.drawdown_info()
        logger.info(f"\nRisk Monitor: {dd}")
        logger.info("=" * 60)

    async def run_full(self) -> None:
        """Complete pipeline: backtest → validate → go live."""
        # Step 1: Backtest on historical data
        self.load_historical_data()
        self.validate_strategies()
        self._print_summary()

        # Step 2: Check if any strategy passed
        live_strategies = [k for k, v in self._enabled_strategies.items() if v]
        if not live_strategies:
            logger.error("No strategies passed validation! Not going live.")
            return

        # Step 3: Switch to live mode
        logger.info(f"\nGoing live with strategies: {live_strategies}")
        await self.run_live()


def handle_shutdown(sig, frame):
    logger.info(f"Received signal {sig}, shutting down...")
    sys.exit(0)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="BTC Algo Trading System")
    parser.add_argument(
        "--mode",
        choices=["backtest", "live", "full"],
        default="backtest",
        help="backtest: validate only | live: live feed only | full: validate then go live",
    )
    parser.add_argument("--config", default="config.yaml", help="Path to config file")
    args = parser.parse_args()

    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    # Change to btc_trader directory if running from elsewhere
    btc_dir = Path(__file__).parent
    os.chdir(btc_dir)

    system = TradingSystem(config_path=args.config)

    if args.mode == "backtest":
        system.run_backtest_only()
    elif args.mode == "live":
        asyncio.run(system.run_live())
    elif args.mode == "full":
        asyncio.run(system.run_full())
