import { expect, test } from "@playwright/test";
import path from "node:path";
import { NEEDLES, PASSWORD, PDFS, anon, apiApproveKyc, apiEntitledMember, apiSignup, linkFrom, newCtx, outbox, runJobs, shot, watchLeaks } from "./helpers";

/** Seats, real API: family office owner invites a person; the invitee accepts, does their OWN ID check, and is entitled only after admin approval. */
test("seat invitation, acceptance and per-person entitlement", async ({ browser }, info) => {
  const tag = info.project.name.includes("mobile") ? "mobile" : "desktop";
  const stamp = Date.now();
  const ownerEmail = `owner-${tag}-${stamp}@example.com`;
  const inviteeEmail = `invitee-${tag}-${stamp}@example.com`;
  const inviteeName = `SYNTHETIC Invitee ${tag}`;
  const leaks: string[] = [];
  const { ctx: ownerApi, admin } = await apiEntitledMember(ownerEmail, `SYNTHETIC Owner ${tag}`, "family_office");
  const jobs = await anon();

  // owner invites from the Account screen
  const ownerCtx = await newCtx(browser, info.project);
  const owner = await ownerCtx.newPage();
  await owner.goto("/login");
  await owner.getByLabel("Email").fill(ownerEmail);
  await owner.getByLabel("Password").fill(PASSWORD);
  await owner.getByRole("button", { name: "Sign in" }).click();
  await expect(owner).toHaveURL(/\/trips|\/onboarding/);
  await owner.goto("/account");
  await expect(owner.getByRole("heading", { name: "Seats" })).toBeVisible();
  await owner.getByLabel("Invite by email").fill(inviteeEmail);
  await owner.getByRole("button", { name: "Send invitation" }).click();
  await expect(owner.getByText(`Invitation queued for ${inviteeEmail}`)).toBeVisible();
  await expect(owner.getByText(inviteeEmail).first()).toBeVisible();
  await shot(owner, "40-seats-owner");
  await runJobs(jobs);
  const mail = (await outbox(jobs, { to: inviteeEmail })).at(-1);
  expect(mail, "an invitation email was sent").toBeTruthy();
  const link = linkFrom(mail!.body_text, "/account/seats/accept");

  // not signed in: the link routes through login and keeps the token
  const guestCtx = await newCtx(browser, info.project);
  const guest = await guestCtx.newPage();
  await guest.goto(link.url);
  await expect(guest).toHaveURL(/\/login\?next=/);
  expect(decodeURIComponent(guest.url())).toContain(link.token);
  await guestCtx.close();

  // the invitee signs up with the invited email, opens the link and accepts
  const inviteeCtx = await newCtx(browser, info.project);
  const invitee = await inviteeCtx.newPage();
  watchLeaks(invitee, leaks);
  await apiSignup(inviteeCtx.request, inviteeEmail, inviteeName);
  await invitee.goto(link.url);
  await expect(invitee.getByRole("heading", { name: "Join a membership" })).toBeVisible();
  await shot(invitee, "41-seat-accept");
  await invitee.getByRole("button", { name: "Accept seat" }).click();
  await expect(invitee).toHaveURL(/\/onboarding/);
  await expect(invitee.getByRole("heading", { name: "Verify your identity" })).toBeVisible();
  await expect(invitee.getByText(/individual identity check/i)).toBeVisible();
  await expect(invitee.getByRole("radio", { name: "Business" })).toBeHidden();
  await shot(invitee, "42-seat-invitee-kyc");

  let me = await (await inviteeCtx.request.get("/v1/me")).json();
  expect(me.member.is_owner).toBe(false);
  expect(me.entitled, "not entitled before their own ID is approved").toBe(false);
  expect(me.next_step).toBe("kyc");

  // not entitled: no operator, tail or contact in the DOM or the network
  await invitee.goto("/aircraft");
  await invitee.getByRole("button", { name: "Cessna Citation XLS+", exact: true }).click();
  await expect(invitee.getByText("Members only").first()).toBeVisible();
  const html = await invitee.content();
  for (const n of NEEDLES) expect(html, `invitee DOM before approval must not contain ${n}`).not.toMatch(n);
  expect(await (await inviteeCtx.request.get("/v1/listings")).text()).not.toMatch(/N00TST|SYNTHETIC Test Operator/);
  await invitee.goto("/account");
  await expect(invitee.getByText(/Billing is managed by the account owner/)).toBeVisible();
  await expect(invitee.getByRole("button", { name: "Manage billing" })).toHaveCount(0);

  expect(leaks, "no operator, tail or contact reached the invitee before approval").toEqual([]);
  invitee.removeAllListeners("response"); // from here on the invitee is entitled and may see operator data

  // the invitee's own ID check, approved by an admin
  await invitee.goto("/onboarding");
  await invitee.getByLabel("Full legal name").fill(inviteeName);
  await invitee.getByLabel(/Government ID/).setInputFiles(path.join(PDFS, "id.png"));
  await invitee.getByRole("button", { name: "Submit for verification" }).click();
  await expect(invitee.getByRole("heading", { name: "Verification in review" })).toBeVisible();
  me = await (await inviteeCtx.request.get("/v1/me")).json();
  expect(me.entitled).toBe(false);
  await apiApproveKyc(admin, jobs, inviteeName);
  await expect.poll(async () => (await (await inviteeCtx.request.get("/v1/me")).json()).entitled, { timeout: 20_000 }).toBe(true);

  // now entitled: operator and tail are visible
  await invitee.goto("/aircraft");
  await invitee.getByRole("button", { name: "Cessna Citation XLS+", exact: true }).click();
  await expect(invitee.getByText(/N00TST\d+/).first()).toBeVisible();
  await expect(invitee.getByText(/SYNTHETIC Test Operator/).first()).toBeVisible();
  await shot(invitee, "43-seat-invitee-entitled");

  // owner sees the new member; revoke is available for pending invitations only
  await owner.goto("/account");
  await expect(owner.getByText(inviteeEmail).first()).toBeVisible();
  await Promise.all([ownerCtx.close(), inviteeCtx.close()]);
  await Promise.all([ownerApi.dispose(), admin.dispose(), jobs.dispose()]);
});
