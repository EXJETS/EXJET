/** URL selections must resolve to an explicitly supplied, textual option. */
export function selectedLabel(options: Record<string, string>, key: string | null) {
  if (!key || !Object.hasOwn(options, key)) return "";
  return typeof options[key] === "string" ? options[key] : "";
}
