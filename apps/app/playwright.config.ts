import { defineConfig } from "@playwright/test";

const CHROMIUM = process.env.PW_CHROMIUM ?? "/opt/pw-browsers/chromium";
const launchOptions = { executablePath: CHROMIUM, args: ["--no-sandbox"] };

export default defineConfig({
  testDir: "./e2e",
  testIgnore: /api\//,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:3001", trace: "off", screenshot: "off", video: "off", deviceScaleFactor: 2 },
  projects: [
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 }, launchOptions } },
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, hasTouch: true, launchOptions } },
  ],
  // Mock mode is enabled only for this server, via the env var.
  webServer: {
    command: "NEXT_PUBLIC_API_MOCK=1 npx next build && NEXT_PUBLIC_API_MOCK=1 npx next start -p 3001",
    url: "http://localhost:3001/login",
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
