"""
Monte Carlo simulation for equity curve risk analysis.
Resamples historical trade returns to estimate distribution of outcomes.
Reports: median/P5/P95 equity, P95 max drawdown, probability of ruin.
"""

from __future__ import annotations

from typing import List

import numpy as np
import pandas as pd
from loguru import logger

from src.backtesting.metrics import Trade
from src.core.statistics import MonteCarloResult, monte_carlo_equity


def run_monte_carlo(
    trades: List[Trade],
    initial_capital: float = 10000.0,
    n_simulations: int = 1000,
) -> MonteCarloResult:
    """
    Run Monte Carlo on actual backtest trades.
    Returns distribution statistics for drawdown and return.
    """
    if len(trades) < 10:
        logger.warning("Monte Carlo: too few trades for meaningful simulation")
        return MonteCarloResult(0, initial_capital, initial_capital, initial_capital, 0, 0, 0)

    returns = [t.net_return for t in trades]
    result = monte_carlo_equity(returns, initial_capital, n_simulations)

    logger.info(
        f"Monte Carlo ({n_simulations} sims): "
        f"MedianReturn={result.median_final_equity/initial_capital-1:.1%} | "
        f"P5Return={result.p5_final_equity/initial_capital-1:.1%} | "
        f"P95MaxDD={result.p95_max_drawdown:.1%} | "
        f"P(ruin)={result.prob_ruin:.1%}"
    )
    return result


def format_mc_report(result: MonteCarloResult, initial_capital: float) -> str:
    return (
        f"Monte Carlo ({result.n_simulations} simulations)\n"
        f"  Median final equity : ${result.median_final_equity:,.2f} "
        f"({(result.median_final_equity/initial_capital-1)*100:.1f}%)\n"
        f"  5th pct  (bad case) : ${result.p5_final_equity:,.2f} "
        f"({(result.p5_final_equity/initial_capital-1)*100:.1f}%)\n"
        f"  95th pct (good case): ${result.p95_final_equity:,.2f} "
        f"({(result.p95_final_equity/initial_capital-1)*100:.1f}%)\n"
        f"  Median max drawdown : {result.median_max_drawdown*100:.1f}%\n"
        f"  95th pct max DD     : {result.p95_max_drawdown*100:.1f}%\n"
        f"  Probability of ruin : {result.prob_ruin*100:.1f}%"
    )
