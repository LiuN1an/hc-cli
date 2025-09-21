import type { DrizzleD1Database } from "drizzle-orm/d1";
import { createContext } from "react-router";
import * as schema from "@/schema";
import type { PublicUser } from "@/types";
import type { KVNamespace as CloudflareKVNamespace } from "@cloudflare/workers-types";

// 定义明确的Context类型
export interface EnvContextType {
  cloudflare: { env: Env; ctx: ExecutionContext };
  db: DrizzleD1Database<typeof schema>;
  sessionKV: CloudflareKVNamespace; // 明确使用 Cloudflare Workers 运行时类型
  sessionExpiry: string;
}

export const EnvContext = createContext<EnvContextType>();

export const UserContext = createContext<PublicUser | null>(null);

// 类型守卫函数，确保context不为空
export function getEnvContext(context: any): EnvContextType {
  const envContext = context.get(EnvContext);
  if (!envContext) {
    throw new Error("EnvContext not found in request context");
  }
  return envContext;
}
