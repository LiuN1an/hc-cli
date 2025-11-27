/**
 * React Router Contexts
 *
 * 在 workers/app.ts 中设置，在路由中通过 context.get() 获取
 */

import type { DrizzleD1Database } from "drizzle-orm/d1";
import { createContext } from "react-router";
import * as schema from "@/schema";
import type { PublicUser } from "@/types";

/**
 * 环境上下文类型
 */
export interface EnvContextType {
  cloudflare: { env: Env; ctx: ExecutionContext };
  db: DrizzleD1Database<typeof schema>;
  sessionKV: KVNamespace;
  sessionExpiry: string;
  authTokenKey: string;
  authTokenValue: string;
}

/**
 * 环境上下文 - 包含数据库、KV 等运行时资源
 */
export const EnvContext = createContext<EnvContextType>();

/**
 * 用户上下文 - 在认证中间件中设置
 */
export const UserContext = createContext<PublicUser | null>(null);

/**
 * 获取环境上下文（带类型守卫）
 */
export function getEnvContext(context: any): EnvContextType {
  const envContext = context.get(EnvContext);
  if (!envContext) {
    throw new Error("EnvContext not found");
  }
  return envContext;
}

/**
 * 获取用户上下文
 */
export function getUserContext(context: any): PublicUser | null {
  return context.get(UserContext) || null;
}

/**
 * 获取用户上下文（必须登录）
 */
export function requireUserContext(context: any): PublicUser {
  const user = context.get(UserContext);
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user;
}
