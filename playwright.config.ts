import { defineConfig } from "@playwright/test";
if (!process.env.MONGODB_DB_NAME?.endsWith("_test"))
  throw new Error(
    "Run npm run test:e2e to use the isolated MongoDB test database.",
  );
export default defineConfig({
  testDir: "./tests",
  globalTeardown: "./tests/cleanup.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  use: {
    extraHTTPHeaders: { "X-NhaHoa-Request": "web" },
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5174",
    headless: true,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
  },
  reporter: "list",
});
