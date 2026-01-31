/// <reference types="@types/node" />

import { config } from "dotenv";
import { existsSync } from "fs";
import alchemy from "alchemy";
import { ReactRouter, D1Database } from "alchemy/cloudflare";
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

const app = await alchemy("api", {
  // Use project root for .alchemy directory (shared across all packages)
  rootDir: resolve(import.meta.dirname, "../.."),
});

// ============================================================================
// D1 Database (Adopts existing database from web package)
// ============================================================================

const db = await D1Database("api-db", {
  // IMPORTANT: Use the same database name as web package
  // Format: {alchemy-app-name}-{resource-name}-{profile}
  // In production, this will be something like: web-web-db-production
  name: "web-web-db-development", // Change this to match your web database name
  adopt: true, // Reuse existing database, don't create new one
});

// ============================================================================
// React Router Worker
// ============================================================================

export const worker = await ReactRouter("api-website", {
  bindings: {
    DB: db,

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
