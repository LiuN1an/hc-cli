/**
 * Worker Package - Wrangler Native
 *
 * This worker demonstrates how to use Wrangler natively while sharing
 * the same D1 database with Alchemy-managed packages.
 *
 * Key integration points:
 * 1. Local dev: --persist-to=../../.alchemy/miniflare shares the database
 * 2. Production: Same database_id as web package's D1
 * 3. Schema: Imported from @myapp/shared/database
 */

import { drizzle } from "drizzle-orm/d1";
import * as schema from "@myapp/shared/database";

// ============================================================================
// Types
// ============================================================================

interface Env {
  DB: D1Database;
  WORKER_ENABLED: string;
}

// ============================================================================
// Request Handler
// ============================================================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize Drizzle with shared schema
    const db = drizzle(env.DB, { schema });

    // Route handling
    switch (path) {
      case "/health":
        return handleHealth(env);

      case "/trigger":
        return handleTrigger(db, env);

      case "/users":
        return handleUsers(db, env);

      default:
        return new Response(
          JSON.stringify({
            package: "@myapp/worker",
            message: "Wrangler Worker with shared D1 database",
            endpoints: ["/health", "/trigger", "/users"],
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
    }
  },

  // Optional: Scheduled handler for cron triggers
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`Scheduled event triggered at ${new Date().toISOString()}`);
    // Add your scheduled task logic here
  },
};

// ============================================================================
// Route Handlers
// ============================================================================

async function handleHealth(env: Env): Promise<Response> {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    package: "@myapp/worker",
    workerEnabled: env.WORKER_ENABLED === "true",
  });
}

async function handleTrigger(
  db: ReturnType<typeof drizzle>,
  env: Env
): Promise<Response> {
  // Example: Count users in shared database
  const result = await db
    .select({ count: schema.users.id })
    .from(schema.users)
    .all();

  return Response.json({
    success: true,
    message: "Trigger executed",
    userCount: result.length,
    timestamp: new Date().toISOString(),
  });
}

async function handleUsers(
  db: ReturnType<typeof drizzle>,
  env: Env
): Promise<Response> {
  // List all users from shared database
  const allUsers = await db.select().from(schema.users).all();

  return Response.json({
    success: true,
    data: allUsers,
    count: allUsers.length,
  });
}
