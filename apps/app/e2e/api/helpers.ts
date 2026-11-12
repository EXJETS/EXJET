import { expect, request as pwRequest, type APIRequestContext, type Browser, type BrowserContext, type Page, type Response } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const APP = "http://localhost:3002";
export const SHOTS = path.join(__dirname, "..", "screenshots");
export const PDFS = path.join(__dirname, ".tmp");
export const H = { "X-Requested-With": "exjet", "Content-Type": "application/json" };
export const PASSWORD = "correct-horse-battery";
export const ADMIN = { email: "admin@example.com", password: "dev-admin-password-1" };
/** Anything that identifies an operator, a tail or an operator contact. Must never reach a non-entitled viewer. */
export const NEEDLES = [/SYNTHETIC Test Operator/i, /N00TST/i, /ops-[a-z]@example\.com/i, /Test Contact/i];

type Project = { use: { viewport?: { width: number; height: number } | null; hasTouch?: boolean } };

export const isMobile = (page: Page) => page.viewportSize()?.width === 390;

export async function shot(page: Page, name: string, fullPage = true) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, `api-${isMobile(page) ? "mobile" : "desktop"}-${name}.png`), fullPage });
}
export async function noHScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, "no horizontal page scroll").toBeLessThanOrEqual(1);
}
export async function newCtx(browser: Browser, project: Project): Promise<BrowserContext> {
  return browser.newContext({ baseURL: APP, viewport: project.use.viewport ?? undefined, hasTouch: project.use.hasTouch, deviceScaleFactor: 2 });
}
export const anon = () => pwRequest.newContext({ baseURL: APP });
const ADMIN_STATE = path.join(PDFS, "admin-state.json");
/** Browser context already signed in as the admin (session created once in global setup; logins are rate limited). */
export async function newAdminCtx(browser: Browser, project: Project): Promise<BrowserContext> {
  return browser.newContext({ baseURL: APP, viewport: project.use.viewport ?? undefined, hasTouch: project.use.hasTouch, deviceScaleFactor: 2, storageState: ADMIN_STATE });
}

export async function runJobs(api: APIRequestContext) {
  const r = await api.post("/v1/dev/run-jobs", { headers: H, data: {} });
  expect(r.ok()).toBeTruthy();
}
export type Mail = { to: string[]; subject: string; body_text: string };
export async function outbox(api: APIRequestContext, q: { to?: string; subject?: string } = {}): Promise<Mail[]> {
  const r = await api.get("/v1/e2e/outbox", { params: q as Record<string, string> });
  expect(r.ok(), "e2e outbox shim is running").toBeTruthy();
  return (await r.json()) as Mail[];
}
/** `https://host/path?token=abc` in a mail body -> {path, token}. */
export function linkFrom(body: string, pathPart: string): { url: string; token: string } {
  const m = new RegExp(`https?://[^\\s]+${pathPart.replace(/[/]/g, "\\/")}\\?token=([A-Za-z0-9_\\-]+)`).exec(body);
  if (!m) throw new Error(`no ${pathPart} link in mail`);
  return { url: m[0].replace(/^https?:\/\/[^/]+/, ""), token: m[1] };
}
export const pdf = (f: string) => fs.readFileSync(path.join(PDFS, f)).toString("base64");

/** Watches `/v1` responses for operator/tail/contact leaks. */
export function watchLeaks(page: Page, leaks: string[]) {
  page.on("response", async (res: Response) => {
    if (!res.url().includes("/v1/")) return;
    try {
      const body = await res.text();
      for (const n of NEEDLES) if (n.test(body)) leaks.push(`${res.url()} matches ${n}`);
    } catch {
      /* redirects / empty bodies */
    }
  });
}

export async function loginAdminApi(): Promise<APIRequestContext> {
  const ctx = await pwRequest.newContext({ baseURL: APP, storageState: ADMIN_STATE });
  expect((await ctx.get("/v1/me")).ok(), "admin session from global setup").toBeTruthy();
  return ctx;
}

/** Signs a user up through the API (dev env: 201 and a session cookie on `ctx`). */
export async function apiSignup(ctx: APIRequestContext, email: string, name: string, type: "individual" | "family_office" = "individual") {
  const r = await ctx.post("/v1/auth/signup", { headers: H, data: { email, password: PASSWORD, full_name: name, account_type: type } });
  expect(r.status(), "signup creates a session in dev").toBe(201);
  return (await r.json()) as { user: { id: string; email: string; email_verified: boolean }; account: { id: string }; entitled: boolean; next_step: string };
}
export async function apiSubmitKyc(ctx: APIRequestContext, holder: string) {
  const fd = new FormData();
  fd.append("kind", "individual");
  fd.append("holder_name", holder);
  fd.append("doc_types", "passport");
  fd.append("files", new Blob([fs.readFileSync(path.join(PDFS, "id.png"))], { type: "image/png" }), "id.png");
  const r = await ctx.post("/v1/kyc/submissions", { headers: { "X-Requested-With": "exjet" }, multipart: fd });
  expect(r.status()).toBe(201);
}
/** Admin decides the kyc_final approval for `holder` (what Company OS does through its UI). */
export async function apiApproveKyc(admin: APIRequestContext, jobs: APIRequestContext, holder: string) {
  await runJobs(jobs);
  const list = await (await admin.get("/v1/admin/approvals", { params: { status: "pending", kind: "kyc_final" } })).json();
  for (const a of list as { id: string; subject_id: string }[]) {
    const sub = await (await admin.get(`/v1/admin/kyc/submissions/${a.subject_id}`)).json();
    if (sub.holder_name === holder) {
      const d = await admin.post(`/v1/admin/approvals/${a.id}/decide`, { headers: H, data: { decision: "approved", note: "Documents verified (synthetic)." } });
      expect(d.ok()).toBeTruthy();
      return;
    }
  }
  throw new Error(`no pending kyc_final approval for ${holder}`);
}
export async function apiCheckout(ctx: APIRequestContext, accountId: string, plan: "individual" | "family_office") {
  const r = await ctx.post("/v1/dev/complete-checkout", { headers: H, data: { account_id: accountId, plan } });
  expect(r.ok()).toBeTruthy();
}
/** A fully entitled member created through the API only (fast setup for the fraud and seats specs). */
export async function apiEntitledMember(email: string, name: string, type: "individual" | "family_office" = "individual") {
  const ctx = await anon();
  const me = await apiSignup(ctx, email, name, type);
  await apiSubmitKyc(ctx, name);
  const admin = await loginAdminApi();
  await apiApproveKyc(admin, ctx, name);
  await apiCheckout(ctx, me.account.id, type);
  const after = await (await ctx.get("/v1/me")).json();
  expect(after.entitled).toBe(true);
  return { ctx, admin, me };
}

export function nextFriday(): string {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7) + 7); // a Friday at least a week out, so the manifest is not past due
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Creates a KTEB to KVNY trip and sends an RFQ to the first operator-live tail; returns ids and the RFQ operator contact. */
export async function apiTripWithRfq(ctx: APIRequestContext) {
  const date = nextFriday();
  const t = await (await ctx.post("/v1/trips", { headers: H, data: { trip_type: "one_way", legs: [{ origin_icao: "KTEB", destination_icao: "KVNY", depart_at: `${date}T09:00` }], passengers: 4, checked_bags: 2 } })).json();
  expect(t.id).toBeTruthy();
  const match = await (await ctx.get(`/v1/trips/${t.id}/match`)).json();
  let listing: { listing_id: string } | undefined;
  for (const c of match.categories) for (const ty of c.types) {
    if (listing || !ty.listing_count) continue;
    const ls = await (await ctx.get(`/v1/trips/${t.id}/listings`, { params: { type_slug: ty.slug } })).json();
    if (ls.length) listing = ls[0];
  }
  expect(listing, "a matching tail").toBeTruthy();
  const rfqs = await (await ctx.post(`/v1/trips/${t.id}/rfqs`, { headers: H, data: { listing_ids: [listing!.listing_id] } })).json();
  const jobs = await anon();
  await runJobs(jobs);
  const trip = await (await ctx.get(`/v1/trips/${t.id}`)).json();
  const rfq = trip.rfqs.find((r: { id: string }) => r.id === rfqs[0].id);
  return { tripId: t.id as string, rfq, contactEmail: rfq.listing.operator.contacts[0].email as string, jobs };
}
export async function inboundReply(api: APIRequestContext, o: { from: string; reference: string; quote?: string; dmarc?: boolean }) {
  const r = await api.post("/v1/dev/inbound-email", {
    headers: H,
    data: {
      from_address: o.from,
      subject: `Re: [${o.reference}] Charter request: KTEB to KVNY`,
      body: "Please find our quote and agreement attached.",
      dmarc_pass: o.dmarc ?? true,
      spf: o.dmarc === false ? "fail" : "pass",
      dkim: o.dmarc === false ? "none" : "pass",
      attachments: [
        { filename: "quote.pdf", content_type: "application/pdf", content_base64: pdf(o.quote ?? "quote.pdf") },
        { filename: "agreement.pdf", content_type: "application/pdf", content_base64: pdf("contract.pdf") },
      ],
    },
  });
  expect(r.status()).toBe(202);
  await runJobs(api);
}

/** Tomorrow's date (local). Weather is only available within 36 hours of a departure, so the journey flies tomorrow. */
export function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
