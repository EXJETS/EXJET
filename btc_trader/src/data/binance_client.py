"""
Binance data client — REST historical data + async WebSocket live feed.
Auto-reconnects on drop, logs everything, caches historical candles to disk.
"""

from __future__ import annotations

import asyncio
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Dict, List, Optional

import aiohttp
import pandas as pd
import requests
from dotenv import load_dotenv
from loguru import logger

load_dotenv()

BINANCE_REST_BASE = "https://api.binance.com"
BINANCE_FUTURES_REST_BASE = "https://fapi.binance.com"
BINANCE_WS_BASE = "wss://stream.binance.com:9443/stream"

INTERVAL_MAP = {
    "1m": "1m", "3m": "3m", "5m": "5m", "15m": "15m", "30m": "30m",
    "1h": "1h", "2h": "2h", "4h": "4h", "6h": "6h", "8h": "8h", "12h": "12h",
    "1d": "1d", "3d": "3d", "1w": "1w", "1M": "1M",
}

CACHE_DIR = Path(__file__).parent.parent.parent / "data" / "cache"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _parse_klines(raw: list) -> pd.DataFrame:
    df = pd.DataFrame(raw, columns=[
        "open_time", "open", "high", "low", "close", "volume",
        "close_time", "quote_volume", "trades", "taker_base_vol",
        "taker_quote_vol", "ignore",
    ])
    df["open_time"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)
    df["close_time"] = pd.to_datetime(df["close_time"], unit="ms", utc=True)
    for col in ["open", "high", "low", "close", "volume", "quote_volume"]:
        df[col] = df[col].astype(float)
    df["trades"] = df["trades"].astype(int)
    return df.set_index("open_time").sort_index()


class BinanceClient:
    """Thread-safe REST client for historical data fetching."""

    def __init__(self) -> None:
        self.api_key = os.getenv("BINANCE_API_KEY", "")
        self.api_secret = os.getenv("BINANCE_API_SECRET", "")
        self._session: Optional[requests.Session] = None

    @property
    def session(self) -> requests.Session:
        if self._session is None:
            self._session = requests.Session()
            self._session.headers.update({
                "X-MBX-APIKEY": self.api_key,
                "Content-Type": "application/json",
            })
        return self._session

    def _get(self, url: str, params: dict = None, retries: int = 4) -> dict | list:
        delay = 2
        for attempt in range(retries):
            try:
                resp = self.session.get(url, params=params, timeout=10)
                resp.raise_for_status()
                return resp.json()
            except Exception as exc:
                logger.warning(f"REST request failed (attempt {attempt+1}/{retries}): {exc}")
                if attempt < retries - 1:
                    time.sleep(delay)
                    delay *= 2
        raise RuntimeError(f"REST request failed after {retries} attempts: {url}")

    def get_klines(
        self,
        symbol: str,
        interval: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 500,
    ) -> pd.DataFrame:
        """Fetch historical OHLCV candles. Automatically pages for large requests."""
        params: dict = {"symbol": symbol, "interval": interval, "limit": 1000}
        if start_time:
            params["startTime"] = int(start_time.timestamp() * 1000)
        if end_time:
            params["endTime"] = int(end_time.timestamp() * 1000)

        url = f"{BINANCE_REST_BASE}/api/v3/klines"
        all_rows: list = []

        while True:
            rows = self._get(url, params)
            if not rows:
                break
            all_rows.extend(rows)
            logger.debug(f"Fetched {len(rows)} candles for {symbol} {interval}, total={len(all_rows)}")

            if len(rows) < 1000 or (limit and len(all_rows) >= limit):
                break

            # advance start_time past last candle
            params["startTime"] = rows[-1][0] + 1

        df = _parse_klines(all_rows)
        if limit:
            df = df.iloc[-limit:]
        return df

    def get_klines_cached(
        self,
        symbol: str,
        interval: str,
        start_date: str,
        end_date: str,
    ) -> pd.DataFrame:
        """Fetch with disk caching — re-downloads only if cache is stale."""
        cache_file = CACHE_DIR / f"{symbol}_{interval}_{start_date}_{end_date}.parquet"

        if cache_file.exists():
            age_hours = (time.time() - cache_file.stat().st_mtime) / 3600
            if age_hours < 1:  # cache valid for 1 hour
                logger.info(f"Cache hit: {cache_file.name}")
                return pd.read_parquet(cache_file)

        logger.info(f"Downloading {symbol} {interval} from {start_date} to {end_date}")
        start_dt = datetime.fromisoformat(start_date).replace(tzinfo=timezone.utc)
        end_dt = datetime.fromisoformat(end_date).replace(tzinfo=timezone.utc)
        df = self.get_klines(symbol, interval, start_time=start_dt, end_time=end_dt, limit=0)
        df.to_parquet(cache_file)
        logger.info(f"Cached {len(df)} candles → {cache_file.name}")
        return df

    def get_ticker_price(self, symbol: str) -> float:
        data = self._get(f"{BINANCE_REST_BASE}/api/v3/ticker/price", {"symbol": symbol})
        return float(data["price"])

    def get_funding_rate(self, symbol: str) -> float:
        """Latest perpetual funding rate from Binance Futures."""
        try:
            data = self._get(
                f"{BINANCE_FUTURES_REST_BASE}/fapi/v1/premiumIndex",
                {"symbol": symbol},
            )
            return float(data.get("lastFundingRate", 0.0))
        except Exception as exc:
            logger.warning(f"Could not fetch funding rate: {exc}")
            return 0.0

    def get_open_interest(self, symbol: str) -> float:
        try:
            data = self._get(
                f"{BINANCE_FUTURES_REST_BASE}/fapi/v1/openInterest",
                {"symbol": symbol},
            )
            return float(data.get("openInterest", 0.0))
        except Exception as exc:
            logger.warning(f"Could not fetch open interest: {exc}")
            return 0.0


class WebSocketFeed:
    """
    Async WebSocket feed subscribing to multiple kline streams.
    Calls `on_candle(symbol, interval, candle_df_row)` on each closed candle.
    Auto-reconnects with exponential backoff.
    """

    def __init__(
        self,
        symbol: str,
        timeframes: List[str],
        on_candle: Callable,
        reconnect_delay: int = 5,
    ) -> None:
        self.symbol = symbol.lower()
        self.timeframes = timeframes
        self.on_candle = on_candle
        self.reconnect_delay = reconnect_delay
        self._running = False

    def _build_streams_url(self) -> str:
        streams = "/".join(f"{self.symbol}@kline_{tf}" for tf in self.timeframes)
        return f"{BINANCE_WS_BASE}?streams={streams}"

    async def _handle_message(self, msg: str) -> None:
        data = json.loads(msg)
        stream_data = data.get("data", {})
        kline = stream_data.get("k", {})

        if not kline.get("x"):  # x = candle closed
            return

        candle = pd.Series({
            "open_time": pd.Timestamp(kline["t"], unit="ms", tz="UTC"),
            "open": float(kline["o"]),
            "high": float(kline["h"]),
            "low": float(kline["l"]),
            "close": float(kline["c"]),
            "volume": float(kline["v"]),
            "quote_volume": float(kline["q"]),
            "trades": int(kline["n"]),
        })
        interval = kline["i"]
        logger.debug(f"Closed candle {self.symbol.upper()} {interval} | close={candle['close']:.2f}")

        try:
            await self.on_candle(self.symbol.upper(), interval, candle)
        except Exception as exc:
            logger.error(f"on_candle callback error: {exc}")

    async def run(self) -> None:
        self._running = True
        url = self._build_streams_url()
        delay = self.reconnect_delay

        while self._running:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.ws_connect(url, heartbeat=30) as ws:
                        logger.info(f"WebSocket connected: {self.symbol.upper()} × {self.timeframes}")
                        delay = self.reconnect_delay  # reset on successful connect
                        async for msg in ws:
                            if msg.type == aiohttp.WSMsgType.TEXT:
                                await self._handle_message(msg.data)
                            elif msg.type in (aiohttp.WSMsgType.CLOSED, aiohttp.WSMsgType.ERROR):
                                logger.warning(f"WebSocket {msg.type.name}, reconnecting...")
                                break
            except Exception as exc:
                logger.error(f"WebSocket error: {exc}")

            if self._running:
                logger.info(f"Reconnecting in {delay}s...")
                await asyncio.sleep(delay)
                delay = min(delay * 2, 60)

    def stop(self) -> None:
        self._running = False
