/// <reference types="@react-router/cloudflare" />
/// <reference types="vite/client" />

import type { DrizzleD1Database } from 'drizzle-orm/d1';

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
    db: DrizzleD1Database;
    sessionKV: KVNamespace;
    sessionExpiry: string;
    authTokenKey: string;
    authTokenValue: string;
    bucket: R2Bucket;
    r2CustomDomain: string;
  }
}

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  MEDIA_BUCKET: R2Bucket;
  SESSION_EXPIRY: string;
  AUTH_TOKEN_KEY: string;
  AUTH_TOKEN_VALUE: string;
  R2_CUSTOM_DOMAIN: string;
}
