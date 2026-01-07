import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { createContext, useContext } from 'react';
import type { PublicUser } from '@template/shared/database';

/**
 * Environment context - available throughout the app
 */
export interface EnvContext {
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

/**
 * User context - set by auth middleware
 */
export type UserContext = PublicUser | null;

/**
 * React context for router-level data
 */
export const RouterContext = createContext<{
  env: EnvContext;
  user: UserContext;
} | null>(null);

/**
 * Hook to access router context
 */
export function useRouterContext() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouterContext must be used within RouterContextProvider');
  }
  return context;
}

/**
 * Hook to access current user
 */
export function useUser() {
  const { user } = useRouterContext();
  return user;
}

/**
 * Hook to access environment
 */
export function useEnv() {
  const { env } = useRouterContext();
  return env;
}
