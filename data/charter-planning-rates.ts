export const charterPlanningRates = [
  ["Midsize", 6500],
  ["Super Midsize", 7500],
  ["Heavy", 8500],
  ["ULR", 9500],
  ["VIP", 13000],
] as const;

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatCharterPlanningRate(hourly: number) {
  return dollars.format(hourly);
}

export const charterPlanningRateNote =
  "Hourly planning figures in USD, not offers to book. Your written proposal confirms the complete trip price, including applicable taxes and fees.";
