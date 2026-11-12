import type { ApiErrorEnvelope } from "./types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

/** Mock mode exists only when NEXT_PUBLIC_API_MOCK=1 is set at build/dev time. */
export function isMock(): boolean {
  return process.env.NEXT_PUBLIC_API_MOCK === "1";
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
  get isNotEntitled() {
    return this.status === 403 && this.code === "not_entitled";
  }
  get isUnauthorized() {
    return this.status === 401;
  }
}

type Handlers = { onUnauthorized: (path: string) => void };
const handlers: Handlers = {
  onUnauthorized(path) {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/signup")) return;
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    void path;
    window.location.href = `/login?next=${next}`;
  },
};
export function setApiHandlers(h: Partial<Handlers>) {
  Object.assign(handlers, h);
}

export interface RequestOptions {
  body?: unknown;
  form?: FormData;
  query?: Record<string, string | number | undefined | null>;
  /** Do not trigger the central 401 redirect (used for GET /me and auth forms). */
  quiet401?: boolean;
}

const STATE_CHANGING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return `${API_BASE}/v1${path}${s ? `?${s}` : ""}`;
}

/** Resolve a document/PDF URL returned by the API (may be relative to the API origin). */
export function apiUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/mock/")) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
}

async function transport(method: string, path: string, opts: RequestOptions): Promise<{ status: number; data: unknown }> {
  if (isMock()) {
    const { mockRequest } = await import("./mock");
    return mockRequest(method, path, opts);
  }
  const headers: Record<string, string> = {};
  if (STATE_CHANGING.has(method)) headers["X-Requested-With"] = "exjet";
  let body: BodyInit | undefined;
  if (opts.form) {
    body = opts.form;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  let res: Response;
  try {
    res = await fetch(buildUrl(path, opts.query), { method, headers, body, credentials: "include" });
  } catch {
    throw new ApiError(0, "network_error", "Could not reach the EXJET service. Check your connection and try again.");
  }
  if (res.status === 204) return { status: 204, data: null };
  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  return { status: res.status, data };
}

export async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const { status, data } = await transport(method, path, opts);
  if (status >= 200 && status < 300) return data as T;
  const env = data as Partial<ApiErrorEnvelope> | null;
  const code = env?.error?.code ?? (status === 401 ? "unauthenticated" : status === 403 ? "forbidden" : "http_error");
  const message = env?.error?.message ?? `Request failed (${status}).`;
  const err = new ApiError(status, code, message);
  if (status === 401 && !opts.quiet401) handlers.onUnauthorized(path);
  throw err;
}

export const get = <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts);
export const post = <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST", path, { ...opts, body });
export const put = <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PUT", path, { ...opts, body });
export const patch = <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PATCH", path, { ...opts, body });
