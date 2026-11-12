import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

/** Runs against NEXT_PUBLIC_API_MOCK=1 (SYNTHETIC data). Walks the member journey at 1440px and 390px. */
const SHOTS = path.join(__dirname, "screenshots");

async function shot(page: Page, name: string, fullPage = true) {
  const w = page.viewportSize()?.width === 390 ? "mobile" : "desktop";
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(SHOTS, `${w}-${name}.png`), fullPage });
}

async function noHorizontalScroll(page: Page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, "no horizontal page scroll").toBeLessThanOrEqual(1);
}

test("member journey: signup to flight view", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  // 1. signup
  await page.goto("/signup");
  await expect(page.getByText("MOCK DATA").first()).toBeVisible();
  await page.getByLabel("Full name").fill("SYNTHETIC Member");
  await page.getByLabel("Email").fill("member@example.com");
  await page.getByLabel("Password").fill("correct-horse-battery");
  await page.getByLabel(/I accept the/).check();
  await shot(page, "01-signup");
  await page.getByRole("button", { name: "Create account" }).click();

  // 2. KYC
  await expect(page.getByRole("heading", { name: "Verify your identity" })).toBeVisible();
  await page.getByLabel("Full legal name").fill("SYNTHETIC Member");
  await page.getByLabel(/Government ID/).setInputFiles({ name: "synthetic-passport.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 synthetic") });
  await shot(page, "02-kyc");
  await page.getByRole("button", { name: "Submit for verification" }).click();
  await expect(page.getByText("Verification in review")).toBeVisible();
  await shot(page, "03-kyc-pending");

  // 3. membership (mock reviewer approves after a few seconds)
  await expect(page.getByText("Choose an Individual membership", { exact: false }).or(page.getByRole("button", { name: "Choose Individual" }))).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText("$750")).toBeVisible();
  await shot(page, "04-membership");
  await page.getByRole("button", { name: "Choose Individual" }).click();
  await expect(page.getByRole("button", { name: "Complete test checkout" })).toBeVisible();
  await page.getByRole("button", { name: "Complete test checkout" }).click();
  await expect(page.getByRole("heading", { name: "You are set" })).toBeVisible();

  // 4. request a trip from plain language
  await page.goto("/request");
  await page.getByLabel("Trip description in plain language").fill("Teterboro to Van Nuys next Friday 9am, 6 passengers, 4 checked bags, 2 golf bags");
  await page.getByRole("button", { name: "Fill the form" }).click();
  await expect(page.getByLabel("Passengers")).toHaveValue("6");
  await expect(page.getByLabel("From")).toHaveValue(/KTEB/);
  await shot(page, "05-request");
  await page.getByRole("button", { name: "Continue to aircraft" }).click();

  // 5. trip workspace: select aircraft, send RFQ
  await expect(page.getByRole("heading", { name: "Aircraft" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Challenger 350|Phenom 300E|Citation/ }).first()).toBeVisible();
  await page.locator(".typerow").first().click();
  await expect(page.getByRole("checkbox", { name: /^Select/ }).first()).toBeVisible();
  await shot(page, "06-trip-aircraft");
  const boxes = page.getByRole("checkbox", { name: /^Select/ });
  await boxes.nth(0).check();
  await boxes.nth(1).check();
  await page.getByRole("button", { name: /Send RFQ/ }).click();
  await expect(page.locator("#rfq").getByText("EXJ-").first()).toBeVisible();

  // 6. mock quote arrives
  await expect(page.locator("#quotes").getByText("SYN-Q-0001")).toBeVisible({ timeout: 30_000 });
  await expect(page.locator("#quotes").getByText(/stated by each operator/)).toBeVisible();
  await shot(page, "07-trip-quotes");
  await page.locator("#quotes").getByRole("button", { name: "Accept" }).first().click();
  await page.locator("#quotes").getByRole("button", { name: "Confirm accept" }).click();

  // 7. contract + payment
  await expect(page.locator("#contract").getByRole("link", { name: /Download contract PDF/ })).toBeVisible();
  await page.locator("#contract").getByLabel(/I have read the operator/).check();
  await page.locator("#contract").getByRole("button", { name: "Acknowledge contract" }).click();
  await expect(page.locator("#contract").getByText(/Acknowledged/)).toBeVisible();
  await expect(page.locator("#payment").getByText("pay.example.com").first()).toBeVisible();
  await expect(page.locator("#payment").getByText(/EXJET does not process flight payments/)).toBeVisible();
  await shot(page, "08-trip-payment");
  await page.locator("#payment").getByRole("button", { name: "I have paid" }).click();
  await page.locator("#payment").getByRole("button", { name: /Confirm: I have paid/ }).click();

  // 8. manifest
  await expect(page.locator("#manifest").getByText("Required ID")).toBeVisible();
  for (let i = 0; i < 6; i++) {
    await page.locator(`#p${i}-n`).fill(`Synthetic Passenger${i + 1} Test`);
    await page.locator(`#p${i}-b`).fill("1980-01-15");
    await page.locator(`#p${i}-i`).fill(`SYN${1000 + i}`);
    await page.locator(`#p${i}-e`).fill("2031-01-01");
    await page.locator(`#p${i}-s`).fill("TX");
  }
  await shot(page, "09-trip-manifest");
  await page.locator("#manifest").getByRole("button", { name: "Submit manifest" }).click();

  // 9. flight view
  await expect(page.locator("#flight").getByText("METAR").first()).toBeVisible();
  await expect(page.locator("#flight").getByText("Live status")).toBeVisible();
  await shot(page, "10-trip-flight");
  await noHorizontalScroll(page);

  // trips list + account
  await page.goto("/trips");
  await expect(page.getByRole("heading", { name: "Trips" })).toBeVisible();
  await expect(page.getByText("KTEB – KVNY").first()).toBeVisible();
  await shot(page, "11-trips");
  await noHorizontalScroll(page);
  await page.goto("/account");
  await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();
  await shot(page, "12-account");

  expect(errors.filter((e) => !/favicon/i.test(e)), "no console errors").toEqual([]);
});

test("visitor gate and company OS", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));

  // visitor browses aircraft without operator or tail
  await page.goto("/aircraft");
  await page.getByRole("button", { name: /Show aircraft/ }).first().click();
  await expect(page.getByText("Members only").first()).toBeVisible();
  await expect(page.getByText(/N00TST/)).toHaveCount(0);
  await shot(page, "13-aircraft-visitor");
  await page.goto("/empty-legs");
  await expect(page.getByText("Request via RFQ").first()).toBeVisible();
  await shot(page, "14-empty-legs");

  // switch to admin in the mock switcher
  await page.getByRole("button", { name: /^MOCK/ }).click();
  await page.getByRole("button", { name: "Admin" }).click();
  await page.waitForLoadState();
  await page.goto("/company");
  await expect(page.getByText("MRR")).toBeVisible();
  await expect(page.getByText("Median operator response")).toBeVisible();
  await shot(page, "15-company-overview");
  await page.goto("/company/approvals");
  await page.getByRole("button", { name: "kyc final" }).click();
  await shot(page, "16-company-approvals");
  await page.goto("/company/kyc");
  await page.getByRole("link", { name: "SYNTHETIC Applicant One" }).first().click();
  await expect(page.getByRole("heading", { name: "Vendor result" })).toBeVisible();
  await shot(page, "17-company-kyc-detail");
  await page.goto("/company/operators");
  await expect(page.getByText("SYNTHETIC Test Operator C")).toBeVisible();
  await shot(page, "18-company-operators");
  await page.goto("/company/data");
  await page.getByLabel("File (CSV)").setInputFiles({ name: "operators.csv", mimeType: "text/csv", buffer: Buffer.from("name,cert\nSYNTHETIC Test Operator D,Part 135\nNetJets,Part 135\n") });
  await page.getByRole("button", { name: "Upload and ingest" }).click();
  await expect(page.getByText(/1 loaded, 1 rejected/)).toBeVisible();
  await shot(page, "19-company-data");
  await noHorizontalScroll(page);
  await page.goto("/company/jobs");
  await expect(page.getByText("flight.watch")).toBeVisible();
  expect(errors.filter((e) => !/favicon/i.test(e)), "no console errors").toEqual([]);
});
