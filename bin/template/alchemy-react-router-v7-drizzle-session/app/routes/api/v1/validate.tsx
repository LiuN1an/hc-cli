import type { Route } from "./+types/validate";
import { EnvContext } from "~/context";
import { getTokenFromRequest, verifyJWTToken } from "~/sessions.server";
import { getUserById } from "~/lib/db-utils";

// JWT验证 API (GET)
export async function loader({ request, context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);

  try {
    // 从请求中获取JWT token
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication token not provided",
          code: "MISSING_TOKEN",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 验证JWT token
    const payload = await verifyJWTToken(token);
    if (!payload) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid authentication token",
          code: "INVALID_TOKEN",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 检查token是否过期
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication token has expired",
          code: "TOKEN_EXPIRED",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 从数据库获取最新的用户信息
    const user = await getUserById(db, payload.userId);
    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "User not found",
          code: "USER_NOT_FOUND",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 返回验证成功的用户信息
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
          },
          token: {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
            iat: payload.iat,
            exp: payload.exp,
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("JWT验证失败:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
