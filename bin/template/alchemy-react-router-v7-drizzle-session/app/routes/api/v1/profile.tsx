/**
 * 当前用户 Profile API
 *
 * GET /api/v1/profile - 获取当前登录用户信息
 *
 * 支持两种认证方式：
 * 1. Session Cookie (session_id)
 * 2. 请求头 auth_token
 */
import type { Route } from "./+types/profile";
import { EnvContext } from "~/context";
import { authenticateRequest } from "~/features/auth";
import { getUserById } from "~/features/user/server/utils";
import type { PublicUser } from "~/features/user/database/types";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { db, sessionKV, authTokenKey, authTokenValue } = context.get(EnvContext);

  // 统一认证（支持 session 和 auth_token）
  const authResult = await authenticateRequest(
    request,
    sessionKV,
    authTokenKey,
    authTokenValue
  );

  // Token 认证 - 返回 Token Admin 信息
  if (authResult.type === "token") {
    const tokenAdmin: PublicUser = {
      id: "token-admin",
      email: "admin@token",
      name: "Token Admin",
      role: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return Response.json({
      success: true,
      data: tokenAdmin,
      authType: "token",
    });
  }

  // 未认证
  if (authResult.type === "none") {
    return Response.json(
      {
        success: false,
        error: authResult.reason,
        code: "UNAUTHORIZED",
      },
      { status: 401 }
    );
  }

  // Session 认证 - 获取用户详情
  const user = await getUserById(db, authResult.sessionData.userId);
  if (!user) {
    return Response.json(
      {
        success: false,
        error: "用户不存在",
        code: "USER_NOT_FOUND",
      },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    data: user,
    authType: "session",
  });
}
