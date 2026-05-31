"""
Statistical core: Z-score, Hurst exponent, Bayesian signal weighting,
cointegration/spread (BTC/ETH), fractional Kelly, Monte Carlo simulation.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional, Tuple

import numpy as np
import pandas as pd
from loguru import logger
from scipy import stats
from statsmodels.tsa.stattools import adfuller, coint


# ─── Z-Score ─────────────────────────────────────────────────────────────────

def zscore(series: pd.Series, window: int = 20) -> pd.Series:
    """Rolling z-score: (price - mean) / std. Positive = above mean."""
    mean = series.rolling(window, min_periods=window // 2).mean()
    std = series.rolling(window, min_periods=window // 2).std()
    return (series - mean) / std.replace(0, np.nan)


def zscore_signal(series: pd.Series, window: int = 20, threshold: float = 2.0) -> pd.Series:
    """
    Returns signal column: +1 mean-reversion LONG (z < -threshold),
    -1 mean-reversion SHORT (z > +threshold), 0 neutral.
    """
    z = zscore(series, window)
    sig = pd.Series(0, index=series.index)
    sig[z < -threshold] = 1
    sig[z > threshold] = -1
    return sig


# ─── Hurst Exponent ──────────────────────────────────────────────────────────

def hurst_exponent(series: pd.Series, min_lag: int = 2, max_lag: int = 20) -> float:
    """
    R/S analysis Hurst exponent.
      H < 0.45 → mean-reverting (range market)
      H ≈ 0.50 → random walk
      H > 0.55 → trending (persistent)
    Returns 0.5 if insufficient data.
    """
    s = series.dropna().values
    if len(s) < max_lag * 2:
        return 0.5

    lags = range(min_lag, max_lag)
    rs_values: List[float] = []
    valid_lags: List[int] = []

    for lag in lags:
        segments = [s[i: i + lag] for i in range(0, len(s) - lag, lag)]
        rs_seg: List[float] = []
        for seg in segments:
            if len(seg) < 2:
                continue
            mean = seg.mean()
            deviation = np.cumsum(seg - mean)
            r = deviation.max() - deviation.min()
            std = seg.std(ddof=1)
            if std > 0:
                rs_seg.append(r / std)
        if rs_seg:
            rs_values.append(np.mean(rs_seg))
            valid_lags.append(lag)

    if len(valid_lags) < 2:
        return 0.5

    poly = np.polyfit(np.log(valid_lags), np.log(rs_values), 1)
    return float(np.clip(poly[0], 0.0, 1.0))


def classify_regime_hurst(h: float, trending_thresh: float = 0.55, ranging_thresh: float = 0.45) -> str:
    if h > trending_thresh:
        return "trending"
    if h < ranging_thresh:
        return "ranging"
    return "choppy"


# ─── Bayesian Signal Weighter ────────────────────────────────────────────────

@dataclass
class BayesianSignalWeighter:
    """
    Beta-distribution Bayesian model for signal quality.
    Updated after each resolved trade. Provides posterior win-rate estimate
    with conservative (lower) credible interval for position sizing.
    """
    name: str
    alpha: float = 1.0   # prior successes (Laplace smoothing)
    beta: float = 1.0    # prior failures

    def update(self, success: bool) -> None:
        if success:
            self.alpha += 1.0
        else:
            self.beta += 1.0

    @property
    def n_trades(self) -> int:
        return int(self.alpha + self.beta) - 2  # subtract prior

    @property
    def posterior_mean(self) -> float:
        return self.alpha / (self.alpha + self.beta)

    @property
    def lower_credible_interval(self) -> float:
        """95% lower credible bound — use as conservative win-rate estimate."""
        if self.n_trades < 5:
            return 0.40  # not enough data, use conservative default
        n = self.n_trades
        p = self.posterior_mean
        z = 1.96
        # Wilson score lower bound
        lower = (
            p + z**2 / (2 * n) - z * np.sqrt((p * (1 - p) + z**2 / (4 * n)) / n)
        ) / (1 + z**2 / n)
        return float(np.clip(lower, 0.0, 1.0))

    def weight(self) -> float:
        """Confidence-adjusted weight: 0.0–1.0. High when accuracy proven."""
        if self.n_trades < 5:
            return 0.5
        return self.lower_credible_interval

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "alpha": self.alpha,
            "beta": self.beta,
            "n_trades": self.n_trades,
            "win_rate": round(self.posterior_mean, 3),
            "lower_ci": round(self.lower_credible_interval, 3),
        }


# ─── Cointegration & Spread (BTC/ETH) ───────────────────────────────────────

def test_cointegration(s1: pd.Series, s2: pd.Series, pvalue_threshold: float = 0.05) -> dict:
    """Engle-Granger cointegration test between two price series."""
    aligned = pd.concat([s1, s2], axis=1).dropna()
    if len(aligned) < 50:
        return {"cointegrated": False, "pvalue": 1.0, "hedge_ratio": 1.0}

    score, pvalue, _ = coint(aligned.iloc[:, 0], aligned.iloc[:, 1])
    cointegrated = pvalue < pvalue_threshold

    # OLS hedge ratio
    from numpy.linalg import lstsq
    x = aligned.iloc[:, 1].values.reshape(-1, 1)
    y = aligned.iloc[:, 0].values
    hedge_ratio, _, _, _ = lstsq(np.hstack([x, np.ones_like(x)]), y, rcond=None)

    return {
        "cointegrated": cointegrated,
        "pvalue": float(pvalue),
        "hedge_ratio": float(hedge_ratio[0]),
    }


def calculate_spread(s1: pd.Series, s2: pd.Series, hedge_ratio: float) -> pd.Series:
    """Normalized spread: s1 - hedge_ratio * s2."""
    spread = s1 - hedge_ratio * s2
    mean = spread.mean()
    std = spread.std()
    return (spread - mean) / (std if std > 0 else 1.0)


def spread_signal(s1: pd.Series, s2: pd.Series, window: int = 60, threshold: float = 2.0) -> pd.Series:
    """
    Rolling cointegration-based spread signal.
    +1 = s1 undervalued (buy s1, sell s2), -1 = s1 overvalued.
    """
    spread = s1 - s2  # simplified; use calculate_spread for proper hedge
    z = zscore(spread, window)
    sig = pd.Series(0, index=s1.index)
    sig[z < -threshold] = 1
    sig[z > threshold] = -1
    return sig


# ─── Fractional Kelly Criterion ──────────────────────────────────────────────

def fractional_kelly(
    win_rate: float,
    avg_win_pct: float,
    avg_loss_pct: float,
    fraction: float = 0.25,
    max_position: float = 0.10,
) -> float:
    """
    Kelly f* = (p*b - q) / b  where b = win/loss ratio.
    Returns fractional Kelly as a fraction of capital (0.0–max_position).
    """
    if avg_loss_pct <= 0 or win_rate <= 0:
        return 0.0
    b = avg_win_pct / avg_loss_pct
    q = 1.0 - win_rate
    kelly = (win_rate * b - q) / b
    position_size = max(0.0, kelly * fraction)
    return min(position_size, max_position)


def kelly_from_weighter(
    weighter: BayesianSignalWeighter,
    avg_win_pct: float,
    avg_loss_pct: float,
    fraction: float = 0.25,
) -> float:
    """Use Bayesian lower-CI win rate for conservative Kelly sizing."""
    win_rate = weighter.lower_credible_interval
    return fractional_kelly(win_rate, avg_win_pct, avg_loss_pct, fraction)


# ─── Monte Carlo Simulation ──────────────────────────────────────────────────

@dataclass
class MonteCarloResult:
    n_simulations: int
    median_final_equity: float
    p5_final_equity: float     # 5th percentile (bad case)
    p95_final_equity: float    # 95th percentile (good case)
    median_max_drawdown: float
    p95_max_drawdown: float    # 95th percentile worst drawdown
    prob_ruin: float           # P(equity < 50% of start)


def monte_carlo_equity(
    trade_returns: List[float],
    initial_capital: float = 10000.0,
    n_simulations: int = 1000,
    n_trades: Optional[int] = None,
) -> MonteCarloResult:
    """
    Bootstrap equity curve simulation by resampling historical trade returns.
    Returns distribution statistics for drawdown risk analysis.
    """
    if len(trade_returns) < 10:
        logger.warning("Monte Carlo: insufficient trades, returning defaults")
        return MonteCarloResult(0, initial_capital, initial_capital, initial_capital, 0.0, 0.0, 0.0)

    returns = np.array(trade_returns)
    n = n_trades or len(returns)
    rng = np.random.default_rng(seed=42)

    final_equities: List[float] = []
    max_drawdowns: List[float] = []

    for _ in range(n_simulations):
        sampled = rng.choice(returns, size=n, replace=True)
        equity = initial_capital * np.cumprod(1.0 + sampled)
        running_max = np.maximum.accumulate(equity)
        drawdowns = (equity - running_max) / running_max
        final_equities.append(equity[-1])
        max_drawdowns.append(float(drawdowns.min()))

    fe = np.array(final_equities)
    dd = np.array(max_drawdowns)

    return MonteCarloResult(
        n_simulations=n_simulations,
        median_final_equity=float(np.median(fe)),
        p5_final_equity=float(np.percentile(fe, 5)),
        p95_final_equity=float(np.percentile(fe, 95)),
        median_max_drawdown=float(np.median(dd)),
        p95_max_drawdown=float(np.percentile(dd, 95)),
        prob_ruin=float(np.mean(fe < initial_capital * 0.5)),
    )


# ─── Augmented Dickey-Fuller stationarity test ────────────────────────────────

def is_stationary(series: pd.Series, pvalue_threshold: float = 0.05) -> bool:
    """ADF test: True if series is stationary (mean-reverting)."""
    clean = series.dropna()
    if len(clean) < 20:
        return False
    result = adfuller(clean, maxlags=1, autolag=None)
    return float(result[1]) < pvalue_threshold
