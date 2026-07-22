import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"],
    env: {
      AUTH_SECRET: "test-only-secret-do-not-use-in-real-envs",
      DATABASE_URL: "postgresql://test:test@localhost:5433/test_unused",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
