/** Shared intake validation. No contact details or credentials are stored here. */
export function calendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// Dates are airport-local calendar dates. Do not reject a customer's "today"
// simply because the server has already rolled over to tomorrow in UTC.
export function notPastAnywhere(value: string, now = Date.now()) {
  return calendarDate(value) && value >= new Date(now - 12 * 60 * 60_000).toISOString().slice(0, 10);
}

export function localDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export class IntakeError extends Error {
  readonly status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function readObject(request: Request, maxBytes = 24_000): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new IntakeError("Send a JSON request.", 415);
  }
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new IntakeError("Request origin is not allowed.", 403);
  const reader = request.body?.getReader();
  if (!reader) throw new IntakeError("Invalid request.", 400);
  const decoder = new TextDecoder();
  let text = "", size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new IntakeError("Request is too large.", 413); }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally { reader.releaseLock(); }
  let body: unknown;
  try { body = JSON.parse(text); } catch { throw new IntakeError("Invalid JSON request.", 400); }
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new IntakeError("Invalid request.", 400);
  return body as Record<string, unknown>;
}

export function intakeError(error: unknown) {
  return Response.json({ error: error instanceof IntakeError ? error.message : "Invalid request." }, {
    status: error instanceof IntakeError ? error.status : 400,
    headers: { "Cache-Control": "no-store" },
  });
}

// A bounded per-instance backstop, not a substitute for a shared production
// limiter or WAF. It prevents this function's memory growing indefinitely.
export function createRateLimit(max = 8, windowMs = 10 * 60_000) {
  const attempts = new Map<string, { count: number; expires: number }>();
  return (request: Request, now = Date.now()) => {
    for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
    const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 80) || "unknown";
    const value = attempts.get(key);
    if (value) { value.count += 1; return value.count > max; }
    if (attempts.size >= 5_000) return true;
    attempts.set(key, { count: 1, expires: now + windowMs });
    return false;
  };
}
