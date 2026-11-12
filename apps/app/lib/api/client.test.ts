import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, request, setApiHandlers, buildUrl } from "./client";

function res(status: number, body: unknown) {
  return Promise.resolve(new Response(body === null ? null : JSON.stringify(body), { status }));
}

afterEach(() => vi.unstubAllGlobals());

describe("api client", () => {
  it("returns parsed JSON on success and sends credentials", async () => {
    const f = vi.fn(() => res(200, { ok: true }));
    vi.stubGlobal("fetch", f);
    await expect(request("GET", "/me")).resolves.toEqual({ ok: true });
    const init = (f.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect(init.credentials).toBe("include");
    expect((init.headers as Record<string, string>)["X-Requested-With"]).toBeUndefined();
  });

  it("adds the CSRF header on state-changing requests", async () => {
    const f = vi.fn(() => res(201, { id: "1" }));
    vi.stubGlobal("fetch", f);
    await request("POST", "/trips", { body: { a: 1 } });
    const init = (f.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>)["X-Requested-With"]).toBe("exjet");
  });

  it("parses the error envelope", async () => {
    vi.stubGlobal("fetch", vi.fn(() => res(409, { error: { code: "invalid_state", message: "Trip is not in draft." } })));
    const err = (await request("PATCH", "/trips/1").catch((e) => e)) as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(409);
    expect(err.code).toBe("invalid_state");
    expect(err.message).toBe("Trip is not in draft.");
  });

  it("calls the unauthorized handler on 401 and not when quiet", async () => {
    const onUnauthorized = vi.fn();
    setApiHandlers({ onUnauthorized });
    vi.stubGlobal("fetch", vi.fn(() => res(401, { error: { code: "unauthenticated", message: "Sign in." } })));
    await expect(request("GET", "/trips")).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    await expect(request("GET", "/me", { quiet401: true })).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it("flags 403 not_entitled", async () => {
    vi.stubGlobal("fetch", vi.fn(() => res(403, { error: { code: "not_entitled", message: "Membership required." } })));
    const err = (await request("POST", "/trips/1/rfqs", { body: {} }).catch((e) => e)) as ApiError;
    expect(err.isNotEntitled).toBe(true);
  });

  it("maps a network failure and a non-JSON error body", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("fail"))));
    await expect(request("GET", "/x")).rejects.toMatchObject({ code: "network_error", status: 0 });
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("<html>", { status: 502 }))));
    await expect(request("GET", "/x")).rejects.toMatchObject({ code: "http_error", status: 502 });
  });

  it("handles 204", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))));
    await expect(request("POST", "/auth/logout")).resolves.toBeNull();
  });

  it("builds query strings and skips empty values", () => {
    expect(buildUrl("/airports", { q: "tet", x: "" })).toMatch(/\/v1\/airports\?q=tet$/);
  });
});
