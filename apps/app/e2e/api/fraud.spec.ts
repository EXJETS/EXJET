import { expect, test } from "@playwright/test";
import { PASSWORD, apiEntitledMember, apiTripWithRfq, inboundReply, newAdminCtx, newCtx, outbox, shot } from "./helpers";

/**
 * Fraud path, real API. Replies that fail the inbound checks never become member-visible quotes; a quote whose payment host is not
 * approved is held (needs_review) until an admin approves the host in Company OS, then it shows with a clear warning.
 */
test("inbound fraud checks and payment host approval", async ({ browser }, info) => {
  const tag = info.project.name.includes("mobile") ? "mobile" : "desktop";
  const stamp = Date.now();
  const otherHost = `pay.other-${tag}.example.com`;
  const email = `fraud-${tag}-${stamp}@example.com`;
  const { ctx: memberApi, admin: adminApi } = await apiEntitledMember(email, `SYNTHETIC Fraud ${tag}`);
  const { tripId, rfq, contactEmail, jobs } = await apiTripWithRfq(memberApi);
  const quotes = async () => (await (await memberApi.get(`/v1/trips/${tripId}/quotes`)).json()) as { id: string; status: string; total_amount_cents: number | null; payment_link: { host: string; host_approved: boolean; changed_since_first: boolean } | null }[];

  // 1. a reply from an address that is not a stored contact of this operator
  const attacker = `attacker-${tag}-${stamp}@example.net`;
  await inboundReply(jobs, { from: attacker, reference: rfq.reference });
  expect(await quotes(), "non-contact sender: no member-visible quote").toEqual([]);

  // 2. a reply from a real contact whose DMARC verdict is a fail
  await inboundReply(jobs, { from: contactEmail, reference: rfq.reference, dmarc: false });
  expect(await quotes(), "failed DMARC: no member-visible quote").toEqual([]);

  const q = await (await adminApi.get("/v1/admin/inbound/quarantined")).json() as { from_address: string; dmarc_pass: boolean | null; approval_id: string | null; reason: string | null }[];
  // A sender that is not a stored contact is quarantined for admin review; it never becomes a member-visible quote.
  expect(q.some((m) => m.from_address.includes(attacker) && m.reason === "sender_not_contact" && m.approval_id !== null)).toBe(true);


  expect(q.some((m) => m.from_address.includes(contactEmail.split("@")[0]) && m.dmarc_pass === false)).toBe(true);
  const reviews = await (await adminApi.get("/v1/admin/approvals", { params: { status: "pending", kind: "inbound_review" } })).json() as unknown[];
  expect(reviews.length).toBeGreaterThanOrEqual(1);

  // The member UI shows no quote; the admin UI lists both held messages and the approvals.
  const memberCtx = await newCtx(browser, info.project);
  const member = await memberCtx.newPage();
  await member.goto("/login");
  await member.getByLabel("Email").fill(email);
  await member.getByLabel("Password").fill(PASSWORD);
  await member.getByRole("button", { name: "Sign in" }).click();
  await expect(member).toHaveURL(/\/trips|\/onboarding/);
  await member.goto(`/trips/${tripId}`);
  await expect(member.locator("#quotes").getByText("No quotes yet")).toBeVisible();
  await expect(member.getByRole("link", { name: /Pay operator/ })).toHaveCount(0);

  const adminCtx = await newAdminCtx(browser, info.project);
  const admin = await adminCtx.newPage();
  await admin.goto("/company");
  await expect(admin.getByRole("link", { name: "Company" }).first()).toBeVisible();
  await admin.goto("/company/quarantined");
  await expect(admin.getByText("dmarc not passed").first()).toBeVisible();
  await expect(admin.getByText("fail", { exact: true }).first()).toBeVisible();
  await shot(admin, "30-fraud-quarantined");
  await expect(admin.getByText("sender not contact").first()).toBeVisible();
  await admin.goto("/company/approvals");
  await admin.getByRole("button", { name: "inbound review" }).first().click();
  await expect(admin.getByText(/held: the sender|inbound email was held/i).first()).toBeVisible();
  await shot(admin, "31-fraud-approvals-inbound-review");

  // 3. a valid reply from the contact: visible quote, host pay.example.com
  await inboundReply(jobs, { from: contactEmail, reference: rfq.reference });
  const afterValid = await quotes();
  expect(afterValid).toHaveLength(1);
  expect(afterValid[0].payment_link!.host).toBe("pay.example.com");
  expect(afterValid[0].payment_link!.host_approved).toBe(true);

  // 4. a later reply with a DIFFERENT payment host is held; the member still sees only the first quote
  await inboundReply(jobs, { from: contactEmail, reference: rfq.reference, quote: `quote_other_host_${tag}.pdf` });
  expect(await quotes(), "held quote is not member-visible").toHaveLength(1);
  await member.reload();
  await expect(member.locator("#quotes").getByText(otherHost)).toHaveCount(0);

  const held = await (await adminApi.get("/v1/admin/quotes", { params: { status: "needs_review" } })).json() as { id: string; payment_host: string | null; payment_host_approved: boolean | null; flags: string[]; pdf_url: string | null; payment_host_approval_id: string | null }[];
  const other = held.find((h) => h.payment_host === otherHost);
  expect(other, "the held quote is listed for admin review").toBeTruthy();
  expect(other!.payment_host_approved).toBe(false);
  expect(other!.pdf_url).toBeTruthy();

  // admin approves the host in Company OS (quote review screen)
  await admin.goto("/company/quotes");
  const card = admin.locator("section.card", { hasText: tripId });
  await expect(card.getByText(otherHost).first()).toBeVisible();
  await expect(card.getByText("Not approved").first()).toBeVisible();
  await expect(card.getByRole("link", { name: /Download quote PDF/ })).toBeVisible();
  await shot(admin, "32-fraud-quote-review-host");
  await card.getByLabel("Decision note (required)").fill("Host belongs to the operator (synthetic).");
  await card.getByRole("button", { name: "Approve" }).click();
  // The host is now approved, but the quote still differs from the earlier one (and its contract party differs), so the admin
  // confirms the total as printed in the operator PDF before the member can see it.
  await expect(card.getByText("Approved", { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  await card.getByLabel(/Total stated in the operator document/).fill("45,200.00");
  await shot(admin, "32b-fraud-quote-review-resolve");
  await card.getByRole("button", { name: "Confirm total" }).click();
  await expect(card).toHaveCount(0, { timeout: 20_000 });

  // 5. now visible, with the host flagged as changed since the first quote
  await expect.poll(async () => (await quotes()).length, { timeout: 20_000 }).toBe(2);
  const second = (await quotes()).find((x) => x.payment_link?.host === otherHost)!;
  expect(second.payment_link!.host_approved).toBe(true);
  expect(second.payment_link!.changed_since_first).toBe(true);
  await member.reload();
  await expect(member.locator("#quotes").getByText(/Payment site changed since the first quote/)).toBeVisible();
  await member.locator("#quotes tr", { hasText: otherHost }).getByRole("button", { name: "Accept" }).click();
  await member.locator("#quotes").getByRole("button", { name: "Confirm accept" }).click();
  await member.locator("#contract").getByLabel(/I have read the operator/).check();
  await member.locator("#contract").getByRole("button", { name: "Acknowledge contract" }).click();
  await expect(member.locator("#payment").getByText(/different from the one in the operator/)).toBeVisible();
  await expect(member.locator("#payment").getByText(otherHost).first()).toBeVisible();
  await expect(member.locator("#payment").getByRole("link", { name: /Pay operator/ })).toHaveAttribute("href", /pay\.other-(desktop|mobile)\.example\.com/);
  await shot(member, "33-payment-host-warning");
  await memberCtx.close();
  await adminCtx.close();
  await Promise.all([memberApi.dispose(), adminApi.dispose(), jobs.dispose()]);
  void outbox;
});
