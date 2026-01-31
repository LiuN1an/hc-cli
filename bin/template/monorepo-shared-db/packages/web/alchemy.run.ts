/// <reference types="@types/node" />

import { config } from "dotenv";
import { existsSync } from "fs";
import alchemy from "alchemy";
import { ReactRouter, D1Database, KVNamespace } from "alchemy/cloudflare";
import { resolve } from "path";

// ============================================================================
// Environment Configuration
// ============================================================================

const alchemyEnv = process.env.ALCHEMY_ENV || "development";
const isProduction = alchemyEnv === "production";

// Load environment variables by priority
const envFiles = isProduction
  ? [".env.production", "../../.env.production", ".env", "../../.env"]
  : [
      ".env.local",
      ".env.development",
      ".env",
      "../../.env.local",
      "../../.env.development",
      "../../.env",
    ];

for (const envFile of envFiles) {
  if (existsSync(envFile)) {
    config({ path: envFile });
  }
}

// ============================================================================
// Alchemy App Setup
// ============================================================================

const app = await alchemy("web", {
  // Use project root for .alchemy directory (shared across all packages)
  rootDir: resolve(import.meta.dirname, "../.."),
});

// ============================================================================
// D1 Database (Primary - Creates the database)
// ============================================================================

const db = await D1Database("web-db", {
  // Migrations are auto-applied on dev startup
  migrationsDir: "./drizzle/migrations",
});

// ============================================================================
// KV Namespace (for sessions)
// ============================================================================

const sessionKV = await KVNamespace("web-session-kv", {
  title: "web-session-kv",
});

// ============================================================================
// React Router Worker
// ============================================================================

export const worker = await ReactRouter("website", {
  bindings: {
    DB: db,
    SESSION_KV: sessionKV,

    // Admin auth (header-based)
    AUTH_TOKEN_KEY: process.env.AUTH_TOKEN_KEY || "x-admin-token",
    AUTH_TOKEN_VALUE:
      process.env.AUTH_TOKEN_VALUE || "change-me-in-production",
  },
});

console.log({
  url: worker.url,
});

await app.finalize();
