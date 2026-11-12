import { expect, test } from "@playwright/test";
import path from "node:path";
import { PASSWORD, PDFS, SHOTS, anon, inboundReply, linkFrom, newAdminCtx, newCtx, tomorrow, noHScroll, outbox, runJobs, shot, watchLeaks, NEEDLES } from "./helpers";

/**
 * Real-API journey: real browser -> Next (proxy /v1) -> real FastAPI + exjet_e2e Postgres (reset on every run).
 * Providers are the API's fakes (billing, KYC vendor, mail, ADS-B, weather); data is SYNTHETIC.
 * 1440px: structured trip entry (no intake round trip). 390px: plain-language entry.
 */
test("real API: signup to flight view, operator secure link, entitlement checks", async ({ browser }, info) => {
  const tag = info.project.name.includes("mobile") ? "Mobile" : "Desktop";
  const stamp = Date.now();
  const email = `member-${tag.toLowerCase()}-${stamp}@example.com`;
  const holder = `SYNTHETIC Member ${tag}`;
  const errors: string[] = [];
  const leaks: string[] = [];
  const mobile = tag === "Mobile";

  const api = await anon(); // anonymous API client for dev endpoints
  const memberCtx = await newCtx(browser, info.project);
  const adminCtx = await newAdminCtx(browser, info.project);
  const member = await memberCtx.newPage();
  const admin = await adminCtx.newPage();
  const intakeCalls: string[] = [];
  member.on("request", (r) => r.url().includes("/v1/trips/intake") && intakeCalls.push(r.url()));

  // ---------- admin session (created once in global setup)
  await admin.goto("/company");
  await expect(admin.getByRole("link", { name: "Company" }).first()).toBeVisible();

  // ---------- admin loads FBOs through Data upload (the dev seed has none)
  await admin.goto("/company/data");
  await admin.getByLabel("Dataset").fill("airports_fbos");
  await admin.getByLabel("File (CSV)").setInputFiles(path.join(PDFS, "fbos.csv"));
  await admin.getByRole("button", { name: "Upload and ingest" }).click();
  await expect(admin.getByText(/Run .* finished/)).toBeVisible();
  await shot(admin, "00-company-data");

  // ---------- member signs up
  await member.goto("/signup");
  await member.getByLabel("Full name").fill(holder);
  await member.getByLabel("Email").fill(email);
  await member.getByLabel("Password").fill(PASSWORD);
  await member.getByLabel(/I accept the/).check();
  await shot(member, "01-signup");
  await member.getByRole("button", { name: "Create account" }).click();
  await expect(member.getByRole("heading", { name: "Verify your identity" })).toBeVisible();
  // Errors are collected once signed in (a visitor's GET /v1/me legitimately returns 401).
  member.on("console", (m) => m.type() === "error" && !/favicon/i.test(m.text()) && errors.push(m.text()));
  member.on("pageerror", (e) => errors.push(String(e)));

  // ---------- email verification link from the mail outbox (new browser context, no session yet)
  await runJobs(api); // the verification mail is sent by a queued job
  const verifyMail = (await outbox(api, { to: email, subject: "confirm your email" }))[0];
  expect(verifyMail, "a verification email was queued").toBeTruthy();
  const vl = linkFrom(verifyMail.body_text, "/verify-email");
  const vCtx = await newCtx(browser, info.project);
  const vPage = await vCtx.newPage();
  await vPage.goto(`/verify-email?token=bad-token-value-0123456789`);
  await expect(vPage.getByText(/invalid, expired or already used/i)).toBeVisible();
  await expect(vPage.getByRole("button", { name: "Send a new link" })).toBeVisible();
  await shot(vPage, "01b-verify-email-invalid");
  await vPage.goto(vl.url);
  await expect(vPage).toHaveURL(/\/onboarding/);
  const verified = await (await vPage.request.get("/v1/me")).json();
  expect(verified.user.email_verified).toBe(true);
  await vCtx.close();

  // ---------- KYC upload
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

  // ---------- membership: plans from the API; checkout through the test page /dev/checkout (no interception)
  await expect(member.getByRole("button", { name: "Choose Individual" })).toBeVisible({ timeout: 40_000 });
  await expect(member.getByText("$750")).toBeVisible();
  await expect(member.getByText("$1,000")).toBeVisible();
  await shot(member, "05-membership");
  await member.getByRole("button", { name: "Choose Individual" }).click();
  await expect(member.getByRole("heading", { name: "Test checkout" })).toBeVisible();
  await shot(member, "05b-dev-checkout");
  await member.getByRole("button", { name: "Complete test checkout" }).click();
  await expect(member.getByRole("heading", { name: "You are set" })).toBeVisible();

  // ---------- request a trip
  const date = tomorrow();
  await member.goto("/request");
  if (mobile) {
    await member.getByLabel("Trip description in plain language").fill("Teterboro to Van Nuys tomorrow 9am, 6 passengers, 4 checked bags and 2 golf bags");
    await member.getByRole("button", { name: "Fill the form" }).click();
    await expect(member.getByLabel("Passengers")).toHaveValue("6");
    await expect(member.getByLabel("From", { exact: true })).toHaveValue(/KTEB/);
    await expect(member.getByLabel("To", { exact: true })).toHaveValue(/KVNY/);
  } else {
    // structured entry: airport typeahead, date, time, counts. No call to /trips/intake.
    await member.getByLabel("From", { exact: true }).fill("Teterboro");
    await member.getByRole("option", { name: /KTEB/ }).click();
    await member.getByLabel("To", { exact: true }).fill("Van Nuys");
    await member.getByRole("option", { name: /KVNY/ }).click();
    await member.getByLabel("Departure date").fill(date);
    await member.getByLabel(/^Time/).fill("09:00");
    await member.getByLabel("Passengers").fill("6");
    await member.getByLabel("Checked bags").fill("4");
    await member.getByLabel("Golf bags").fill("2");
  }
  await shot(member, "06-request");
  await member.getByRole("button", { name: "Continue to aircraft" }).click();
  await expect(member.getByRole("heading", { name: "Aircraft" })).toBeVisible();
  const tripId = /\/trips\/([^/?#]+)/.exec(member.url())![1];
  const trip0 = await (await member.request.get(`/v1/trips/${tripId}`)).json();
  expect(trip0.legs[0].origin_timezone).toBe("America/New_York");
  expect(trip0.legs[0].depart_local).toMatch(/T09:00/);
  expect(trip0.legs[0].origin.name).toMatch(/Teterboro/i);
  if (!mobile) {
    expect(intakeCalls, "structured entry never calls /trips/intake").toEqual([]);
    expect(trip0.legs[0].depart_local.startsWith(date)).toBe(true);
  }
  await expect(member.getByText("Teterboro Airport").first()).toBeVisible(); // airport names in the route summary

  // ---------- match: the tail list renders directly beneath the selected type row
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
  if (mobile) {
    // The selection bar sits above the tab bar and does not cover it.
    const bar = member.locator(".rfq-bar");
    await bar.scrollIntoViewIfNeeded();
    const b = await bar.boundingBox();
    const tab = await member.locator(".tabbar").boundingBox();
    expect(b!.y + b!.height).toBeLessThanOrEqual(tab!.y + 1);
    await member.screenshot({ path: path.join(SHOTS, "api-mobile-07b-rfq-bar-viewport.png") });
  }
  await member.getByRole("button", { name: /Send RFQ/ }).click();
  await expect(member.locator("#rfq").getByText("EXJ-").first()).toBeVisible();

  // ---------- operator replies by email FROM a stored contact, jobs run, quote appears
  await runJobs(api); // rfq.dispatch
  const trip = await (await member.request.get(`/v1/trips/${tripId}`)).json();
  expect(trip.rfqs.length).toBe(picked);
  const rfq = trip.rfqs[0];
  const opEmail: string = rfq.listing.operator.contacts[0].email;
  await inboundReply(api, { from: opEmail, reference: rfq.reference });
  await member.reload();
  await expect(member.locator("#quotes").getByText("$45,200")).toBeVisible({ timeout: 30_000 });
  await expect(member.locator("#quotes").getByText("Q-TEST-0001")).toBeVisible();
  await expect(member.locator("#quotes").getByText("pay.example.com")).toBeVisible();
  await expect(member.locator("#quotes").getByText(/stated by each operator/)).toBeVisible();
  await expect(member.locator("#quotes").getByRole("link", { name: /Download quote PDF/ })).toBeVisible();
  await shot(member, "08-trip-quotes");

  // ---------- accept, contract, payment
  await member.locator("#quotes").getByRole("button", { name: "Accept" }).first().click();
  await member.locator("#quotes").getByRole("button", { name: "Confirm accept" }).click();
  await expect(member.locator("#contract").getByRole("link", { name: /Download contract PDF/ })).toBeVisible();
  await member.locator("#contract").getByLabel(/I have read the operator/).check();
  await member.locator("#contract").getByRole("button", { name: "Acknowledge contract" }).click();
  await expect(member.locator("#contract").getByText(/Acknowledged/)).toBeVisible();
  const payLink = member.locator("#payment").getByRole("link", { name: /Pay operator/ });
  await expect(payLink).toHaveAttribute("href", "https://pay.example.com/checkout/synthetic-123");
  await expect(payLink).toHaveAttribute("target", "_blank");
  await expect(member.locator("#payment").getByText("pay.example.com").first()).toBeVisible();
  await expect(member.locator("#payment").getByText(/EXJET does not process flight payments/)).toBeVisible();
  await expect(member.locator("#payment").getByText(/not approved|different from the one/)).toHaveCount(0);
  await shot(member, "09-trip-payment");
  await member.locator("#payment").getByRole("button", { name: "I have paid" }).click();
  await member.locator("#payment").getByRole("button", { name: /Confirm: I have paid/ }).click();

  // ---------- manifest: REAL ID; save draft, reload, submit without retyping IDs
  await expect(member.locator("#manifest").getByText("REAL ID").first()).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await member.locator(`#p${i}-n`).fill(`Synthetic Passenger${i + 1} Test`);
    await member.locator(`#p${i}-b`).fill("1980-01-15");
    await member.locator(`#p${i}-i`).fill(`SYN${1000 + i}`);
    await member.locator(`#p${i}-e`).fill("2031-01-01");
    await member.locator(`#p${i}-s`).fill("NJ");
  }
  await member.locator("#manifest").getByRole("button", { name: "Save draft" }).click();
  await expect(member.getByText(/Draft saved/)).toBeVisible();
  await member.reload();
  await expect(member.locator("#p0-n")).toHaveValue("Synthetic Passenger1 Test");
  await expect(member.locator("#p0-i")).toHaveAttribute("placeholder", "ending 1000");
  await expect(member.locator("#manifest").getByText("ID on file ending 1005")).toBeVisible();
  await shot(member, "10-trip-manifest");
  await member.locator("#manifest").getByRole("button", { name: "Submit manifest" }).click(); // IDs on file: nothing retyped
  await expect(member.locator("#manifest").getByText(/Submitted/).first()).toBeVisible();
  await expect(member.locator("#manifest").getByRole("button", { name: "Edit manifest" })).toBeVisible();

  // ---------- the operator's secure link: no session, no app shell
  await runJobs(api); // manifest.deliver
  const mm = (await outbox(api, { to: opEmail, subject: "manifest" })).at(-1);
  expect(mm, "the manifest email to the operator was sent").toBeTruthy();
  expect(mm!.body_text, "no passenger PII in the email").not.toMatch(/Synthetic Passenger1|SYN1000/);
  const ml = linkFrom(mm!.body_text, "/operator/manifest");
  const opCtx = await newCtx(browser, info.project);
  const op = await opCtx.newPage();
  await op.goto(ml.url);
  await expect(op.getByRole("heading", { name: "Passenger manifest" })).toBeVisible();
  await expect(op.getByText("Synthetic Passenger1 Test")).toBeVisible();
  await expect(op.getByText("SYN1000")).toBeVisible();
  await expect(op.getByText(rfq.reference)).toBeVisible();
  await expect(op.getByText(/Access to this page is logged/)).toBeVisible();
  expect(await op.locator(".side, .tabbar, .top").count(), "no app shell on the operator page").toBe(0);
  expect(await op.locator('meta[name="robots"]').getAttribute("content")).toMatch(/noindex/);
  await shot(op, "10b-operator-manifest");
  await noHScroll(op);
  await op.goto("/operator/manifest?token=not-a-real-token-0123456789");
  await expect(op.getByRole("heading", { name: "This link is invalid or has expired" })).toBeVisible();
  await opCtx.close();

  // ---------- flight / weather: schematic, no coordinates table
  await member.reload();
  await expect(member.locator("#flight").getByText("METAR").first()).toBeVisible();
  await expect(member.locator("#flight").getByRole("img", { name: /Leg 1: KTEB to KVNY/ })).toBeVisible();
  await expect(member.locator("#flight").getByRole("table")).toHaveCount(0);
  await shot(member, "11-trip-flight");
  await noHScroll(member);

  // ---------- ground transportation: FBO picker from GET /airports/{icao}/fbos
  const ground = member.locator("#ground");
  await ground.scrollIntoViewIfNeeded();
  await expect(ground.getByLabel("FBO")).toBeVisible();
  await ground.getByLabel("FBO").selectOption({ index: 1 });
  await ground.getByLabel("Details").fill("Two people, mid-size SUV, pickup at 09:30.");
  await ground.getByRole("button", { name: "Send request" }).click();
  await expect(ground.getByText(/Request sent/)).toBeVisible();
  await ground.getByRole("button", { name: "Send request" }).click();
  await expect(ground.getByText(/already sent/i)).toBeVisible(); // 409 duplicate_ground_rfq, friendly message

  await member.goto("/trips");
  await expect(member.getByText("KTEB – KVNY").first()).toBeVisible();
  await shot(member, "12-trips");
  await member.goto("/account");
  await expect(member.getByRole("heading", { name: "Account" })).toBeVisible();
  await expect(member.getByRole("heading", { name: "Password" })).toBeVisible();
  await shot(member, "13-account");

  // ---------- Company OS against the real API
  for (const [url, name, text] of [
    ["/company", "14-company-overview", "MRR"],
    ["/company/approvals", "15-company-approvals", "Approvals"],
    ["/company/operators", "16-company-operators", "SYNTHETIC Test Operator A"],
    ["/company/quotes", "17-company-quote-review", "Quote review"],
    ["/company/quarantined", "17b-company-quarantined", "Quarantined mail"],
    ["/company/suppressions", "17c-company-suppressions", "Suppressions"],
    ["/company/inquiries", "17d-company-inquiries", "Enterprise inquiries"],
    ["/company/data", "18-company-data", "Data upload"],
  ] as const) {
    await admin.goto(url);
    await expect(admin.getByText(text).first()).toBeVisible();
    await shot(admin, name);
  }
  await admin.goto("/company/operators");
  await admin.getByRole("button", { name: "SYNTHETIC Test Operator A" }).click();
  await expect(admin.getByLabel(/Approved payment hosts for/)).toHaveValue(/pay\.example\.com/);
  await admin.goto("/company/jobs");
  await expect(admin.getByRole("heading", { name: "Jobs" })).toBeVisible();

  // ---------- a second, NON-entitled member sees no operator, tail or contact (DOM or network)
  const otherCtx = await newCtx(browser, info.project);
  const other = await otherCtx.newPage();
  watchLeaks(other, leaks);
  const su = await otherCtx.request.post("/v1/auth/signup", { headers: { "X-Requested-With": "exjet", "Content-Type": "application/json" }, data: { email: `other-${tag.toLowerCase()}-${stamp}@example.com`, password: PASSWORD, full_name: "SYNTHETIC Other", account_type: "individual" } });
  expect(su.status()).toBe(201);
  const t2 = await (await otherCtx.request.post("/v1/trips", { headers: { "X-Requested-With": "exjet", "Content-Type": "application/json" }, data: { legs: [{ origin_icao: "KTEB", destination_icao: "KVNY", depart_at: `${date}T09:00` }], passengers: 4 } })).json();
  await other.goto(`/trips/${t2.id}`);
  await expect(other.locator(".typerow").first()).toBeVisible();
  await other.locator(".typerow").first().click();
  await expect(other.locator(".inline-list").getByText("Members only").first()).toBeVisible();
  await expect(other.getByRole("region", { name: "Membership required" }).first()).toBeVisible();
  await expect(other.getByRole("checkbox", { name: /^Select/ })).toHaveCount(0);
  await other.goto("/aircraft");
  await other.getByRole("button", { name: "Cessna Citation XLS+", exact: true }).click();
  await expect(other.getByText("Members only").first()).toBeVisible();
  // the public city filter works by city and ignores airport codes
  await other.getByLabel("Home city").fill("Teterboro");
  await other.getByRole("button", { name: "Filter" }).click();
  await expect(other.getByText("Members only").first()).toBeVisible();
  await other.goto("/empty-legs");
  await expect(other.getByText("Request via RFQ").first()).toBeVisible();
  await shot(other, "19-empty-legs-non-entitled");
  const otherHtml = await other.content();
  for (const n of NEEDLES) expect(otherHtml, `non-entitled DOM must not contain ${n}`).not.toMatch(n);
  for (const u of ["/v1/listings", "/v1/empty-legs", `/v1/trips/${t2.id}/listings`, "/v1/listings?home=KTEB", "/v1/listings?home=Teterboro"]) {
    const body = await (await otherCtx.request.get(u)).text();
    for (const n of NEEDLES) expect(body, `${u} for a non-entitled member must not contain ${n}`).not.toMatch(n);
  }
  const airportHome = await (await otherCtx.request.get("/v1/listings?home=KTEB")).json();
  const unfiltered = await (await otherCtx.request.get("/v1/listings")).json();
  expect(airportHome.length, "an airport code does not narrow listings for non-entitled viewers").toBe(unfiltered.length);
  const rfqTry = await otherCtx.request.post(`/v1/trips/${t2.id}/rfqs`, { headers: { "X-Requested-With": "exjet", "Content-Type": "application/json" }, data: { listing_ids: [] } });
  expect(rfqTry.status()).toBe(403);
  expect((await rfqTry.json()).error.code).toBe("not_entitled");

  // ---------- visitor
  const visitorCtx = await newCtx(browser, info.project);
  const visitor = await visitorCtx.newPage();
  watchLeaks(visitor, leaks);
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

  // ---------- password reset: link from the outbox, then sign in with the new password
  const fpCtx = await newCtx(browser, info.project);
  const fp = await fpCtx.newPage();
  await fp.goto("/forgot-password");
  await shot(fp, "21-forgot-password");
  await fp.getByLabel("Email").fill(email);
  await fp.getByRole("button", { name: "Send reset link" }).click();
  await expect(fp.getByText(/If that address is registered/)).toBeVisible();
  await runJobs(api);
  const resetMail = (await outbox(api, { to: email, subject: "reset" })).at(-1);
  expect(resetMail, "a reset email was sent").toBeTruthy();
  const rl = linkFrom(resetMail!.body_text, "/reset-password");
  await fp.goto(rl.url);
  await fp.getByLabel("New password").fill("another-long-passphrase-1");
  await fp.getByRole("button", { name: "Set new password" }).click();
  await expect(fp.getByText(/Password changed/)).toBeVisible();
  await fp.goto("/login");
  await fp.getByLabel("Email").fill(email);
  await fp.getByLabel("Password").fill("another-long-passphrase-1");
  await fp.getByRole("button", { name: "Sign in" }).click();
  await expect(fp).toHaveURL(/\/trips|\/onboarding/);
  // logout ended ALL sessions: the old member session is no longer valid after the reset
  expect((await member.request.get("/v1/me")).status()).toBe(401);

  expect(leaks, "no operator, tail or contact in any network response for non-entitled viewers").toEqual([]);
  // the only expected browser-reported failure is the deliberate duplicate ground request (409)
  expect(errors.filter((e) => !/status of 409/.test(e)), "no console errors on the member journey").toEqual([]);
  await Promise.all([memberCtx, adminCtx, otherCtx, visitorCtx, fpCtx].map((c) => c.close()));
  await api.dispose();
});
