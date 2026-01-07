import { drizzle } from 'drizzle-orm/d1';
import { createRequestHandler } from 'react-router';

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // Initialize database
    const db = drizzle(env.DB);

    // Create load context with all bindings
    const loadContext = {
      cloudflare: { env, ctx },
      db,
      sessionKV: env.SESSION_KV,
      sessionExpiry: env.SESSION_EXPIRY,
      authTokenKey: env.AUTH_TOKEN_KEY,
      authTokenValue: env.AUTH_TOKEN_VALUE,
      bucket: env.MEDIA_BUCKET,
      r2CustomDomain: env.R2_CUSTOM_DOMAIN
    };

    return requestHandler(request, loadContext);
  }
} satisfies ExportedHandler<Env>;
