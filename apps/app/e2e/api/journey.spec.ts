import { expect, test, request as pwRequest, type APIRequestContext, type Browser, type BrowserContext, type Page, type Response } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

/**
 * Real-API journey: real browser -> Next (proxy /v1) -> real FastAPI + exjet_e2e Postgres (reset on every run).
 * Providers are the API's fakes (billing, KYC vendor, mail, ADS-B, weather); data is SYNTHETIC.
 */
const SHOTS = path.join(__dirname, "..", "screenshots");
const PDFS = path.join(__dirname, ".tmp");
const APP = "http://localhost:3002";
const H = { "X-Requested-With": "exjet", "Content-Type": "application/json" };
const NEEDLES = [/SYNTHETIC Test Operator/i, /N00TST/i, /ops-[a-z]@example\.com/i, /Test Contact/i];

const wide = (page: Page) => page.viewportSize()?.width !== 390;

async function shot(page: Page, name: string, fullPage = true) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, `api-${wide(page) ? "desktop" : "mobile"}-${name}.png`), fullPage });
}
async function noHScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, "no horizontal page scroll").toBeLessThanOrEqual(1);
}
async function runJobs(api: APIRequestContext) {
  const r = await api.post("/v1/dev/run-jobs", { headers: H, data: {} });
  expect(r.ok()).toBeTruthy();
}
async function newCtx(browser: Browser, project: { use: { viewport?: { width: number; height: number } | null; hasTouch?: boolean } }) {
  return browser.newContext({ baseURL: APP, viewport: project.use.viewport ?? undefined, hasTouch: project.use.hasTouch, deviceScaleFactor: 2 });
}

test("real API: signup to flight view, with entitlement checks", async ({ browser }, info) => {
  const tag = info.project.name.includes("mobile") ? "Mobile" : "Desktop";
  const stamp = Date.now();
  const email = `member-${tag.toLowerCase()}-${stamp}@example.com`;
  const holder = `SYNTHETIC Member ${tag}`;
  const errors: string[] = [];
  const leaks: string[] = [];

  const api = await pwRequest.newContext({ baseURL: APP }); // anonymous API client for dev endpoints
  const memberCtx = await newCtx(browser, info.project);
  const adminCtx = await newCtx(browser, info.project);
  const member = await memberCtx.newPage();
  const admin = await adminCtx.newPage();

  // ---------- admin signs in through the UI
  await admin.goto("/login");
  await admin.getByLabel("Email").fill("admin@example.com");
  await admin.getByLabel("Password").fill("dev-admin-password-1");
  await admin.getByRole("button", { name: "Sign in" }).click();
  await expect(admin.getByRole("link", { name: "Company" }).first()).toBeVisible();

  // ---------- member signs up
  await member.goto("/signup");
  await member.getByLabel("Full name").fill(holder);
  await member.getByLabel("Email").fill(email);
  await member.getByLabel("Password").fill("correct-horse-battery");
  await member.getByLabel(/I accept the/).check();
  await shot(member, "01-signup");
  await member.getByRole("button", { name: "Create account" }).click();

  // Errors are collected once signed in (a visitor's GET /v1/me legitimately returns 401).
  member.on("console", (m) => m.type() === "error" && !/favicon/i.test(m.text()) && errors.push(m.text()));
  member.on("pageerror", (e) => errors.push(String(e)));

  // ---------- KYC upload
  await expect(member.getByRole("heading", { name: "Verify your identity" })).toBeVisible();
  await member.getByLabel("Full legal name").fill(holder);
  await member.getByLabel(/Government ID/).setInputFiles(path.join(PDFS, "id.png"));
  await shot(member, "02-kyc");
  await member.getByRole("button", { name: "Submit for verification" }).click();
  await expect(member.getByRole("heading", { name: "Verification in review" })).toBeVisible();
  await shot(member, "03-kyc-pending");
  await runJobs(api); // vendor check job queues the final approval

  // ---------- admin approves the KYC in Company OS
  await admin.goto("/company/kyc");
  await admin.getByRole("link", { name: holder }).first().click();
  await expect(admin.getByRole("heading", { name: "Vendor result" })).toBeVisible();
  await expect(admin.getByLabel("Decision note (required)")).toBeVisible();
  await shot(admin, "04-company-kyc-detail");
  await admin.getByLabel("Decision note (required)").fill("Documents verified (synthetic).");
  await admin.getByRole("button", { name: "Approve" }).click();
  await expect(admin.getByText("Decision", { exact: true }).first()).toBeVisible();

  // ---------- membership: plans come from the API; checkout is the fake provider
  await expect(member.getByRole("button", { name: "Choose Individual" })).toBeVisible({ timeout: 40_000 });
  await expect(member.getByText("$750")).toBeVisible();
  await expect(member.getByText("$1,000")).toBeVisible();
  await shot(member, "05-membership");
  await member.route(/fake-checkout/, (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<p>fake checkout</p>" }));
  const checkoutReq = member.waitForRequest(/fake-checkout/);
  await member.getByRole("button", { name: "Choose Individual" }).click();
  await checkoutReq; // the app redirected to the provider's checkout_url
  const me = await (await member.request.get("/v1/me")).json();
  expect(me.next_step).toBe("billing");
  const done = await api.post("/v1/dev/complete-checkout", { headers: H, data: { account_id: me.account.id, plan: "individual" } });
  expect(done.ok()).toBeTruthy();
  await member.goto("/onboarding");
  await expect(member.getByRole("heading", { name: "You are set" })).toBeVisible();

  // ---------- request a trip from plain language
  await member.goto("/request");
  await member.getByLabel("Trip description in plain language").fill("Teterboro to Van Nuys next Friday 9am, 6 passengers, 4 checked bags and 2 golf bags");
  await member.getByRole("button", { name: "Fill the form" }).click();
  await expect(member.getByLabel("Passengers")).toHaveValue("6");
  await expect(member.getByLabel("From", { exact: true })).toHaveValue(/KTEB/);
  await expect(member.getByLabel("To", { exact: true })).toHaveValue(/KVNY/);
  await expect(member.getByText(/Interpreted/)).toBeVisible();
  await shot(member, "06-request");
  await member.getByRole("button", { name: "Continue to aircraft" }).click();

  // ---------- match: types, then the tail list renders directly beneath the selected type row
  await expect(member.getByRole("heading", { name: "Aircraft" })).toBeVisible();
  const tripId = /\/trips\/([^/?#]+)/.exec(member.url())![1];
  const rows = member.locator(".typerow");
  await expect(rows.first()).toBeVisible();
  let picked = 0;
  for (let i = 0; i < (await rows.count()) && picked === 0; i++) {
    await rows.nth(i).click();
    await expect(member.locator(".typerow[aria-expanded='true'] + .inline-list")).toBeVisible();
    const boxes = member.locator(".inline-list").getByRole("checkbox", { name: /^Select/ });
    await member.waitForTimeout(500);
    const n = await boxes.count();
    if (n > 0) {
      await expect(member.locator(".inline-list").getByText(/N00TST\d+/).first()).toBeVisible();
      await boxes.nth(0).check();
      if (n > 1) await boxes.nth(1).check();
      picked = Math.min(n, 2);
    }
  }
  expect(picked, "a type with matching tails").toBeGreaterThan(0);
  await shot(member, "07-trip-aircraft");

  // On a 390px viewport the selection bar must sit above the tab bar and not hide the list top.
  if (!wide(member)) {
    const bar = member.locator(".rfq-bar");
    await bar.scrollIntoViewIfNeeded();
    const b = await bar.boundingBox();
    const tab = await member.locator(".tabbar").boundingBox();
    expect(b!.y + b!.height).toBeLessThanOrEqual(tab!.y + 1);
    await member.screenshot({ path: path.join(SHOTS, "api-mobile-07b-rfq-bar-viewport.png") });
  }
  await member.getByRole("button", { name: /Send RFQ/ }).click();
  await expect(member.locator("#rfq").getByText("EXJ-").first()).toBeVisible();

  // ---------- operator replies by email (dev endpoint), jobs run, quote appears
  await runJobs(api); // rfq.dispatch
  const trip = await (await member.request.get(`/v1/trips/${tripId}`)).json();
  expect(trip.rfqs.length).toBe(picked);
  const rfq = trip.rfqs[0];
  const opEmail: string = rfq.listing.operator.contacts[0].email;
  const b64 = (f: string) => fs.readFileSync(path.join(PDFS, f)).toString("base64");
  const reply = await api.post("/v1/dev/inbound-email", {
    headers: H,
    data: {
      from_address: opEmail,
      subject: `Re: [${rfq.reference}] Charter request: KTEB to KVNY`,
      body: "Please find our quote and agreement attached.",
      attachments: [
        { filename: "quote.pdf", content_type: "application/pdf", content_base64: b64("quote.pdf") },
        { filename: "agreement.pdf", content_type: "application/pdf", content_base64: b64("contract.pdf") },
      ],
    },
  });
  expect(reply.status()).toBe(202);
  await runJobs(api); // mail.poll_inbox -> quote.ingest
  await member.reload();
  await expect(member.locator("#quotes").getByText("$45,200")).toBeVisible({ timeout: 30_000 });
  await expect(member.locator("#quotes").getByText("Q-TEST-0001")).toBeVisible();
  await expect(member.locator("#quotes").getByText(/stated by each operator/)).toBeVisible();
  await shot(member, "08-trip-quotes");

  // ---------- accept, contract, payment
  await member.locator("#quotes").getByRole("button", { name: "Accept" }).first().click();
  await member.locator("#quotes").getByRole("button", { name: "Confirm accept" }).click();
  await expect(member.locator("#contract").getByRole("link", { name: /View contract PDF/ })).toBeVisible();
  await member.locator("#contract").getByLabel(/I have read the operator/).check();
  await member.locator("#contract").getByRole("button", { name: "Acknowledge contract" }).click();
  await expect(member.locator("#contract").getByText(/Acknowledged/)).toBeVisible();
  const payLink = member.locator("#payment").getByRole("link", { name: /Pay operator/ });
  await expect(payLink).toHaveAttribute("href", "https://pay.example.com/checkout/synthetic-123");
  await expect(payLink).toHaveAttribute("target", "_blank");
  await expect(member.locator("#payment").getByText("pay.example.com").first()).toBeVisible();
  await expect(member.locator("#payment").getByText(/EXJET does not process flight payments/)).toBeVisible();
  await shot(member, "09-trip-payment");
  await member.locator("#payment").getByRole("button", { name: "I have paid" }).click();
  await member.locator("#payment").getByRole("button", { name: /Confirm: I have paid/ }).click();

  // ---------- manifest: REAL ID for a domestic trip
  await expect(member.locator("#manifest").getByText("REAL ID").first()).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await member.locator(`#p${i}-n`).fill(`Synthetic Passenger${i + 1} Test`);
    await member.locator(`#p${i}-b`).fill("1980-01-15");
    await member.locator(`#p${i}-i`).fill(`SYN${1000 + i}`);
    await member.locator(`#p${i}-e`).fill("2031-01-01");
    await member.locator(`#p${i}-s`).fill("NJ");
  }
  await shot(member, "10-trip-manifest");
  await member.locator("#manifest").getByRole("button", { name: "Submit manifest" }).click();

  // ---------- flight / weather
  await expect(member.locator("#flight").getByText("METAR").first()).toBeVisible();
  await expect(member.locator("#flight").getByText("Live status")).toBeVisible();
  await shot(member, "11-trip-flight");
  await noHScroll(member);
  await member.goto("/trips");
  await expect(member.getByText("KTEB – KVNY").first()).toBeVisible();
  await shot(member, "12-trips");
  await member.goto("/account");
  await expect(member.getByRole("heading", { name: "Account" })).toBeVisible();
  await shot(member, "13-account");

  // ---------- Company OS against the real API
  for (const [url, name, text] of [
    ["/company", "14-company-overview", "MRR"],
    ["/company/approvals", "15-company-approvals", "Approvals"],
    ["/company/operators", "16-company-operators", "SYNTHETIC Test Operator A"],
    ["/company/quotes", "17-company-quote-review", "Quote review"],
    ["/company/data", "18-company-data", "Data upload"],
  ] as const) {
    await admin.goto(url);
    await expect(admin.getByText(text).first()).toBeVisible();
    await shot(admin, name);
  }
  await admin.goto("/company/jobs");
  await expect(admin.getByRole("heading", { name: "Jobs" })).toBeVisible();

  // ---------- a second, NON-entitled member sees no operator, tail or contact (DOM or network)
  const otherCtx = await newCtx(browser, info.project);
  const other = await otherCtx.newPage();
  const watch = (p: Page) =>
    p.on("response", async (res: Response) => {
      if (!res.url().includes("/v1/")) return;
      try {
        const body = await res.text();
        for (const n of NEEDLES) if (n.test(body)) leaks.push(`${res.url()} matches ${n}`);
      } catch {
        /* redirects / empty bodies */
      }
    });
  watch(other);
  const su = await otherCtx.request.post("/v1/auth/signup", { headers: H, data: { email: `other-${tag.toLowerCase()}-${stamp}@example.com`, password: "correct-horse-battery", full_name: "SYNTHETIC Other", account_type: "individual" } });
  expect(su.status()).toBe(201);
  const draft = await (await otherCtx.request.post("/v1/trips/intake", { headers: H, data: { text: "Teterboro to Van Nuys next Friday 9am, 4 passengers" } })).json();
  const t2 = await (await otherCtx.request.post("/v1/trips", { headers: H, data: draft })).json();
  await other.goto(`/trips/${t2.id}`);
  await expect(other.locator(".typerow").first()).toBeVisible();
  await other.locator(".typerow").first().click();
  await expect(other.locator(".inline-list").getByText("Members only").first()).toBeVisible();
  await expect(other.getByRole("region", { name: "Membership required" }).first()).toBeVisible();
  await expect(other.getByRole("checkbox", { name: /^Select/ })).toHaveCount(0);
  await other.goto("/aircraft");
  await other.getByRole("button", { name: "Cessna Citation XLS+", exact: true }).click();
  await expect(other.getByText("Members only").first()).toBeVisible();
  await other.goto("/empty-legs");
  await expect(other.getByText("Request via RFQ").first()).toBeVisible();
  await shot(other, "19-empty-legs-non-entitled");
  const otherHtml = await other.content();
  for (const n of NEEDLES) expect(otherHtml, `non-entitled DOM must not contain ${n}`).not.toMatch(n);
  // direct API probes for the same viewer
  for (const u of ["/v1/listings", "/v1/empty-legs", `/v1/trips/${t2.id}/listings`]) {
    const body = await (await otherCtx.request.get(u)).text();
    for (const n of NEEDLES) expect(body, `${u} for a non-entitled member must not contain ${n}`).not.toMatch(n);
  }
  const rfqTry = await otherCtx.request.post(`/v1/trips/${t2.id}/rfqs`, { headers: H, data: { listing_ids: [] } });
  expect(rfqTry.status()).toBe(403);
  expect((await rfqTry.json()).error.code).toBe("not_entitled");

  // ---------- visitor
  const visitorCtx = await newCtx(browser, info.project);
  const visitor = await visitorCtx.newPage();
  watch(visitor);
  await visitor.goto("/aircraft");
  await visitor.getByRole("button", { name: "Cessna Citation XLS+", exact: true }).click();
  await expect(visitor.getByText("Members only").first()).toBeVisible();
  await shot(visitor, "20-aircraft-visitor");
  await visitor.goto("/empty-legs");
  await expect(visitor.getByText("Request via RFQ").first()).toBeVisible();
  const visitorHtml = await visitor.content();
  for (const n of NEEDLES) expect(visitorHtml, `visitor DOM must not contain ${n}`).not.toMatch(n);
  await visitor.goto("/trips");
  await expect(visitor).toHaveURL(/\/login/); // 401 -> central redirect

  expect(leaks, "no operator, tail or contact in any network response for non-entitled viewers").toEqual([]);
  expect(errors, "no console errors on the member journey").toEqual([]);
  await closeAll([memberCtx, adminCtx, otherCtx, visitorCtx], api);
});

async function closeAll(ctxs: BrowserContext[], api: APIRequestContext) {
  for (const c of ctxs) await c.close();
  await api.dispose();
}
