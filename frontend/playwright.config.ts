import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const frontendRoot = __dirname;
const repoRoot = path.resolve(frontendRoot, "..");
const appPort = process.env.PLAYWRIGHT_APP_PORT ?? "3100";
const apiPort = process.env.PLAYWRIGHT_API_PORT ?? "3200";
const appBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${appPort}`;
const apiBaseUrl =
  process.env.PLAYWRIGHT_API_URL ?? `http://127.0.0.1:${apiPort}/api/v1`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ["list"],
    ["html", { open: "never" }],
  ],
  outputDir: "test-results",
  use: {
    baseURL: appBaseUrl,
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  globalSetup: "./tests/global.setup.ts",
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: [
    {
      command: "npm run dev",
      cwd: repoRoot,
      env: {
        ...process.env,
        PORT: apiPort,
        APP_URL: `http://127.0.0.1:${apiPort}`,
        CLIENT_URL: appBaseUrl,
        CORS_ORIGINS: appBaseUrl,
        RATE_LIMIT_MAX: "5000",
      },
      url: `${apiBaseUrl}/health`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: `npm run dev -- --hostname 127.0.0.1 --port ${appPort}`,
      cwd: frontendRoot,
      env: {
        ...process.env,
        NEXT_PUBLIC_API_URL: apiBaseUrl,
      },
      url: `${appBaseUrl}/login`,
      reuseExistingServer: false,
      timeout: 120_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
