import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.SPARK_TEST_URL ?? "http://localhost:3014",
    viewport: { width: 1280, height: 800 },
    launchOptions: { channel: "chrome" },
    screenshot: "only-on-failure",
  },
});
