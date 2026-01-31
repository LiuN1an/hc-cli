#!/usr/bin/env node

import { existsSync, readdirSync } from "fs";
import { resolve } from "path";
import { spawn, exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ============================================================================
// Environment Check
// ============================================================================

function checkEnvironment() {
  const isDevelopment =
    process.env.NODE_ENV !== "production" &&
    (process.env.NODE_ENV === "development" ||
      !process.env.NODE_ENV ||
      process.env.CF_PAGES !== "1");

  if (!isDevelopment) {
    console.log(`  Current env is not development, db tools only work in dev`);
    console.log(`   NODE_ENV = ${process.env.NODE_ENV || "undefined"}`);
    process.exit(1);
  }
}

// ============================================================================
// Find Local D1 Database
// ============================================================================

function findLocalD1Database() {
  // Look for .alchemy directory in project root
  const d1Dir = resolve(
    import.meta.dirname,
    "../../../.alchemy/miniflare/v3/d1/miniflare-D1DatabaseObject/"
  );

  if (!existsSync(d1Dir)) {
    console.log(`  Database directory not found: ${d1Dir}`);
    console.log(`   Please run 'pnpm dev' first to create the database`);
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
    const dbPath = resolve(d1Dir, sqliteFile);
    console.log(`Found local database: ${sqliteFile}`);
    return dbPath;
  }

  console.log(`  No database file found`);
  return null;
}

// ============================================================================
// Command Helpers
// ============================================================================

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: "inherit",
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    proc.on("error", reject);
  });
}

async function runSqlCommand(dbPath, sql) {
  try {
    const command = `sqlite3 "${dbPath}" "${sql}"`;
    const { stdout } = await execAsync(command);
    console.log(stdout);
  } catch (error) {
    console.error(`  SQL execution failed:`, error.message);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const action = process.argv[2] || "help";

  // Check environment for critical operations
  if (["studio", "studio-open", "inspect", "query", "clear"].includes(action)) {
    checkEnvironment();
  }

  const dbPath = findLocalD1Database();

  switch (action) {
    case "studio":
      if (dbPath) {
        console.log(`Starting Drizzle Studio (local access)...`);
        console.log(`   URL: http://localhost:4983`);
        await runCommand("drizzle-kit", ["studio"]);
      }
      break;

    case "studio-open":
      if (dbPath) {
        console.log(`Starting Drizzle Studio (network access)...`);
        console.log(`   Local: http://localhost:4983`);
        console.log(`   Network: http://0.0.0.0:4983`);
        await runCommand("drizzle-kit", ["studio", "--host", "0.0.0.0"]);
      }
      break;

    case "inspect":
      if (dbPath) {
        console.log(`Inspecting database tables:`);
        await runSqlCommand(dbPath, ".tables");
      }
      break;

    case "query":
      if (dbPath) {
        const query =
          process.argv[3] ||
          'SELECT name FROM sqlite_master WHERE type="table";';
        console.log(`Executing query: ${query}`);
        await runSqlCommand(dbPath, query);
      }
      break;

    case "clear":
      if (dbPath) {
        const table = process.argv[3];
        if (!table) {
          console.log(`  Please specify table name: pnpm db:clear <table>`);
        } else {
          console.log(`Clearing table ${table}...`);
          await runSqlCommand(dbPath, `DELETE FROM ${table};`);
          console.log(`  Data cleared`);
        }
      }
      break;

    case "path":
      if (dbPath) {
        console.log(dbPath);
      }
      break;

    default:
      console.log(`Database Development Tools (dev only):
  pnpm db:studio       # Start Drizzle Studio (local)
  pnpm db:inspect      # Inspect database structure
  pnpm db:query <sql>  # Execute SQL query
  pnpm db:path         # Output database path
      `);
  }
}

main().catch(console.error);
