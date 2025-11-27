/**
 * 认证中间件
 *
 * 用于保护需要登录的路由
 */

import { redirect, type MiddlewareFunction } from "react-router";
import { EnvContext, UserContext } from "~/context";
import { getUserById } from "~/features/user";
import { getSessionFromRequest, validateSessionDetailed } from "../lib/session";

/**
 * 认证中间件
 *
 * 验证用户 session，如果有效则将用户信息设置到 UserContext
 * 如果无效则重定向到登录页，并通过 query 参数传递错误原因
 */
export const authMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  const { db, sessionKV } = context.get(EnvContext);

  // 获取 session ID
  const sessionId = getSessionFromRequest(request);

  if (!sessionId) {
    throw redirect("/signin?auth_error=not_found");
  }

  // 验证 session
  const validationResult = await validateSessionDetailed(sessionKV, sessionId);

  if (!validationResult.isValid) {
    const errorParam = validationResult.reason || "invalid";
    throw redirect(`/signin?auth_error=${errorParam}`);
  }

  // 从数据库获取最新的用户信息
  const user = await getUserById(db, validationResult.sessionData!.userId);

  if (!user) {
    throw redirect("/signin?auth_error=not_found");
  }

  // 设置用户信息到 context
  context.set(UserContext, user);
};

/**
 * Admin 认证中间件
 *
 * 在基础认证的基础上，额外检查用户是否为 admin 角色
 */
export const adminAuthMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  // 先执行基础认证
  await authMiddleware({ request, context } as any);

  // 检查角色
  const user = context.get(UserContext);

  if (!user || user.role !== "admin") {
    throw redirect("/?error=forbidden");
  }
};

