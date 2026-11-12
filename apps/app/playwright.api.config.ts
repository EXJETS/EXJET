import { defineConfig } from "@playwright/test";

/** Real-API suite: real browser, real API on :8000, exjet_e2e database (reset on every run). */
const CHROMIUM = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";
const launchOptions = { executablePath: CHROMIUM, args: ["--no-sandbox"] };
const PORT = 3002;

export default defineConfig({
  testDir: "./e2e/api",
  testMatch: /.*\.spec\.ts/,
  globalSetup: "./e2e/api/global-setup.ts",
  timeout: 240_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, trace: "off", screenshot: "off", video: "off", deviceScaleFactor: 2 },
  projects: [
    { name: "api-desktop-1440", use: { viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: "api-mobile-390", use: { viewport: { width: 390, height: 844 }, hasTouch: true, launchOptions } },
  ],
  webServer: [
    { command: "bash e2e/api/start-api.sh", url: "http://localhost:8000/v1/billing/plans", reuseExistingServer: false, timeout: 180_000, stdout: "ignore" },
    {
      // No NEXT_PUBLIC_API_MOCK here: this build can never use the mock.
      command: `NEXT_DIST_DIR=.next-api API_ORIGIN=http://localhost:8000 npx next build && NEXT_DIST_DIR=.next-api API_ORIGIN=http://localhost:8000 npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}/login`,
      reuseExistingServer: false,
      timeout: 240_000,
    },
  ],
});
