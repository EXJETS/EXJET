/** Charter search links that prefill the quote form. ICAO codes only. */
export function charterHref(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return query ? `/charter/?${query}` : "/charter/";
}
