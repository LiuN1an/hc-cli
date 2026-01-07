import { drizzle } from 'drizzle-orm/d1';

/**
 * Environment bindings
 */
interface Env {
  DB: D1Database;
  WORKER_ENABLED: string;
}

/**
 * Cloudflare Worker with scheduled trigger support
 */
export default {
  /**
   * Handle HTTP requests (optional - for testing/debugging)
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        enabled: env.WORKER_ENABLED === 'true',
        timestamp: new Date().toISOString()
      });
    }

    // Manual trigger endpoint (protected in production)
    if (url.pathname === '/trigger') {
      if (env.WORKER_ENABLED !== 'true') {
        return Response.json({ error: 'Worker is disabled' }, { status: 503 });
      }

      ctx.waitUntil(runScheduledTask(env));
      return Response.json({ message: 'Task triggered' });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },

  /**
   * Handle scheduled triggers (cron)
   */
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`Scheduled event triggered at ${new Date(event.scheduledTime).toISOString()}`);

    if (env.WORKER_ENABLED !== 'true') {
      console.log('Worker is disabled, skipping...');
      return;
    }

    ctx.waitUntil(runScheduledTask(env));
  }
} satisfies ExportedHandler<Env>;

/**
 * Main scheduled task logic
 */
async function runScheduledTask(env: Env): Promise<void> {
  console.log('Starting scheduled task...');

  try {
    const db = drizzle(env.DB);

    // Example: Query the database
    // const users = await db.select().from(users).limit(10);
    // console.log(`Found ${users.length} users`);

    // Add your scheduled task logic here
    // - Data processing
    // - External API calls
    // - Database maintenance
    // - Report generation
    // - etc.

    console.log('Scheduled task completed successfully');
  } catch (error) {
    console.error('Scheduled task failed:', error);
    throw error;
  }
}
