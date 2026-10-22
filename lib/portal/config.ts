export function portalConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY && process.env.EXJET_PORTAL_ENABLED === "true");
}

export function portalOrigin() {
  const configured = process.env.EXJET_APP_ORIGIN;
  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== "https:" && !(process.env.NODE_ENV === "development" && url.hostname === "localhost")) throw new Error("Invalid application origin");
    return url.origin;
  }
  return "https://www.exjet.com";
}

export const portalReturnPaths = ["/app/", "/app/trips/", "/app/locations/", "/app/messages/", "/app/settings/", "/app/alerts/"];
export function safeReturnPath(value: unknown) {
  return typeof value === "string" && portalReturnPaths.includes(value) ? value : "/app/";
}
