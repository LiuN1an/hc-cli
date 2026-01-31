import { createContext } from "react-router";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@myapp/shared/database";

// ============================================================================
// Types
// ============================================================================

export interface EnvContextType {
  cloudflare: {
    env: Env;
    ctx: ExecutionContext;
  };
  db: DrizzleD1Database<typeof schema>;
  authTokenKey: string;
  authTokenValue: string;
}

// ============================================================================
// Context
// ============================================================================

export const EnvContext = createContext<EnvContextType>();

// ============================================================================
// Hook
// ============================================================================

export function useEnv(): EnvContextType {
  const ctx = EnvContext.use();
  if (!ctx) {
    throw new Error("useEnv must be used within EnvContext provider");
  }
  return ctx;
}
