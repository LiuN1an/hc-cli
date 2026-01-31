import { defineConfig } from "drizzle-kit";
import { existsSync, readdirSync } from "fs";
import { resolve } from "path";

// ============================================================================
// Environment Detection
// ============================================================================

const isDevelopment =
  process.env.NODE_ENV !== "production" &&
  (process.env.NODE_ENV === "development" ||
    !process.env.NODE_ENV ||
    process.env.CF_PAGES !== "1");

// ============================================================================
// Find Alchemy's Local D1 Database
// ============================================================================

function findLocalD1Database(): string | null {
  // Look for .alchemy directory in project root
  const d1Dir = resolve(
    __dirname,
    "../../.alchemy/miniflare/v3/d1/miniflare-D1DatabaseObject/"
  );

  if (!existsSync(d1Dir)) {
    return null;
  }

  const files = readdirSync(d1Dir);
  const sqliteFile = files.find(
    (file) =>
      file.endsWith(".sqlite") &&
      !file.endsWith(".sqlite-shm") &&
      !file.endsWith(".sqlite-wal")
  );

  if (sqliteFile) {
    return resolve(d1Dir, sqliteFile);
  }

  return null;
}

// ============================================================================
// Drizzle Config
// ============================================================================

const baseConfig = {
  // Schema is in shared package
  schema: "../shared/dist/src/database/index.js",
  out: "./drizzle/migrations",
  dialect: "sqlite" as const,
};

const developmentConfig = {
  ...baseConfig,
  dbCredentials: {
    url: findLocalD1Database() || ":memory:",
  },
};

const productionConfig = {
  ...baseConfig,
  // Production uses Cloudflare D1 binding, no dbCredentials needed
};

export default defineConfig(isDevelopment ? developmentConfig : productionConfig);
