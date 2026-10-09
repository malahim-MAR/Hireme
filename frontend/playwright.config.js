import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    browserName: "chromium",
    channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    { command: `"${process.execPath}" ../backend/tests/server-fixture.js`, url: "http://127.0.0.1:5001/api/auth/me", timeout: 180000, env: { NODE_ENV: "test", ADMIN_PASSWORD: "test-admin-password", SESSION_SECRET: "hireme-test-session-secret" }, reuseExistingServer: false },
    { command: `"${process.execPath}" node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5173 --strictPort`, url: "http://127.0.0.1:5173", timeout: 60000, reuseExistingServer: false },
  ],
});
