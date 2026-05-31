"""
Technical indicators: ATR, ADX, RSI, MACD, Bollinger Bands, Stochastic, OBV.
All return pd.Series aligned to the input DataFrame index.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


# ─── ATR ──────────────────────────────────────────────────────────────────────

def atr(df: pd.DataFrame, window: int = 14) -> pd.Series:
    h, l, c = df["high"], df["low"], df["close"]
    prev_c = c.shift(1)
    tr = pd.concat([h - l, (h - prev_c).abs(), (l - prev_c).abs()], axis=1).max(axis=1)
    return tr.ewm(span=window, min_periods=window, adjust=False).mean()


def atr_pct(df: pd.DataFrame, window: int = 14) -> pd.Series:
    """ATR as percentage of close price."""
    return atr(df, window) / df["close"] * 100


# ─── ADX ──────────────────────────────────────────────────────────────────────

def adx(df: pd.DataFrame, window: int = 14) -> pd.DataFrame:
    """Returns DataFrame with columns: adx, plus_di, minus_di."""
    h, l, c = df["high"], df["low"], df["close"]
    prev_h = h.shift(1)
    prev_l = l.shift(1)
    prev_c = c.shift(1)

    up_move = h - prev_h
    down_move = prev_l - l

    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)

    tr_series = pd.concat([
        h - l, (h - prev_c).abs(), (l - prev_c).abs()
    ], axis=1).max(axis=1)

    atr_s = tr_series.ewm(span=window, min_periods=window, adjust=False).mean()
    plus_di_s = (
        pd.Series(plus_dm, index=df.index)
        .ewm(span=window, min_periods=window, adjust=False).mean()
        / atr_s * 100
    )
    minus_di_s = (
        pd.Series(minus_dm, index=df.index)
        .ewm(span=window, min_periods=window, adjust=False).mean()
        / atr_s * 100
    )

    dx = ((plus_di_s - minus_di_s).abs() / (plus_di_s + minus_di_s).replace(0, np.nan) * 100)
    adx_s = dx.ewm(span=window, min_periods=window, adjust=False).mean()

    return pd.DataFrame({"adx": adx_s, "plus_di": plus_di_s, "minus_di": minus_di_s})


# ─── RSI ──────────────────────────────────────────────────────────────────────

def rsi(series: pd.Series, window: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = (-delta).clip(lower=0)
    avg_gain = gain.ewm(com=window - 1, min_periods=window, adjust=False).mean()
    avg_loss = loss.ewm(com=window - 1, min_periods=window, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    return 100 - (100 / (1 + rs))


# ─── MACD ─────────────────────────────────────────────────────────────────────

def macd(series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> pd.DataFrame:
    ema_fast = series.ewm(span=fast, min_periods=fast, adjust=False).mean()
    ema_slow = series.ewm(span=slow, min_periods=slow, adjust=False).mean()
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, min_periods=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    return pd.DataFrame({"macd": macd_line, "signal": signal_line, "histogram": histogram})


# ─── Bollinger Bands ──────────────────────────────────────────────────────────

def bollinger_bands(series: pd.Series, window: int = 20, n_std: float = 2.0) -> pd.DataFrame:
    mean = series.rolling(window, min_periods=window // 2).mean()
    std = series.rolling(window, min_periods=window // 2).std()
    upper = mean + n_std * std
    lower = mean - n_std * std
    pct_b = (series - lower) / (upper - lower).replace(0, np.nan)
    bandwidth = (upper - lower) / mean.replace(0, np.nan)
    return pd.DataFrame({"upper": upper, "middle": mean, "lower": lower,
                          "pct_b": pct_b, "bandwidth": bandwidth})


# ─── Stochastic ───────────────────────────────────────────────────────────────

def stochastic(df: pd.DataFrame, k_window: int = 14, d_window: int = 3) -> pd.DataFrame:
    lowest_low = df["low"].rolling(k_window).min()
    highest_high = df["high"].rolling(k_window).max()
    denom = (highest_high - lowest_low).replace(0, np.nan)
    k = (df["close"] - lowest_low) / denom * 100
    d = k.rolling(d_window).mean()
    return pd.DataFrame({"k": k, "d": d})


# ─── OBV (On-Balance Volume) ──────────────────────────────────────────────────

def obv(df: pd.DataFrame) -> pd.Series:
    direction = np.sign(df["close"].diff()).fillna(0)
    return (direction * df["volume"]).cumsum()


# ─── Volume Ratio ─────────────────────────────────────────────────────────────

def volume_ratio(df: pd.DataFrame, window: int = 20) -> pd.Series:
    """Current volume / rolling average volume."""
    vol_ma = df["volume"].rolling(window).mean()
    return df["volume"] / vol_ma.replace(0, np.nan)


# ─── EMA / SMA ────────────────────────────────────────────────────────────────

def ema(series: pd.Series, window: int) -> pd.Series:
    return series.ewm(span=window, min_periods=window, adjust=False).mean()


def sma(series: pd.Series, window: int) -> pd.Series:
    return series.rolling(window, min_periods=window // 2).mean()


# ─── VWAP (session reset) ─────────────────────────────────────────────────────

def vwap(df: pd.DataFrame) -> pd.Series:
    """Cumulative VWAP from first bar in DataFrame."""
    typical = (df["high"] + df["low"] + df["close"]) / 3
    cum_tpv = (typical * df["volume"]).cumsum()
    cum_vol = df["volume"].cumsum().replace(0, np.nan)
    return cum_tpv / cum_vol


# ─── Compute all indicators at once ──────────────────────────────────────────

def compute_all(df: pd.DataFrame, cfg: dict) -> pd.DataFrame:
    """
    Attach all indicators to a copy of df.
    cfg keys: atr_window, adx_window, rsi_window, macd_fast/slow/signal,
              bb_window, bb_std, volume_ma_window.
    """
    out = df.copy()
    c = out["close"]

    atr_w = cfg.get("atr_window", 14)
    out["atr"] = atr(out, atr_w)
    out["atr_pct"] = atr_pct(out, atr_w)

    adx_df = adx(out, cfg.get("atr_window", 14))
    out["adx"] = adx_df["adx"]
    out["plus_di"] = adx_df["plus_di"]
    out["minus_di"] = adx_df["minus_di"]

    out["rsi"] = rsi(c, cfg.get("rsi_window", 14))

    macd_df = macd(c, cfg.get("macd_fast", 12), cfg.get("macd_slow", 26), cfg.get("macd_signal", 9))
    out["macd"] = macd_df["macd"]
    out["macd_signal"] = macd_df["signal"]
    out["macd_hist"] = macd_df["histogram"]

    bb_df = bollinger_bands(c, cfg.get("bb_window", 20), cfg.get("bb_std", 2.0))
    out["bb_upper"] = bb_df["upper"]
    out["bb_middle"] = bb_df["middle"]
    out["bb_lower"] = bb_df["lower"]
    out["bb_pct_b"] = bb_df["pct_b"]
    out["bb_bandwidth"] = bb_df["bandwidth"]

    stoch_df = stochastic(out)
    out["stoch_k"] = stoch_df["k"]
    out["stoch_d"] = stoch_df["d"]

    out["obv"] = obv(out)
    out["volume_ratio"] = volume_ratio(out, cfg.get("volume_ma_window", 20))

    out["ema_9"] = ema(c, 9)
    out["ema_21"] = ema(c, 21)
    out["ema_50"] = ema(c, 50)
    out["ema_200"] = ema(c, 200)

    out["vwap"] = vwap(out)

    return out
