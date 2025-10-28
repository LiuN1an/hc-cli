import type { Route } from "./+types/logout";
import { EnvContext } from "~/context";
import { getSessionFromRequest, destroySession, createLogoutHeaders } from "~/lib/session";

// 登出 API (POST)
export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "HTTP method not supported",
        code: "METHOD_NOT_ALLOWED",
      }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const { sessionKV } = context.get(EnvContext);

  try {
    // 获取session ID
    const sessionId = getSessionFromRequest(request);
    
    // 如果有session ID，从KV中删除
    if (sessionId) {
      await destroySession(sessionKV, sessionId);
    }

    // 创建登出响应头（清除Cookie）
    const logoutHeaders = createLogoutHeaders();
    
    // 添加Content-Type到响应头
    logoutHeaders.set("Content-Type", "application/json");

    // 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        message: "Logout successful",
      }),
      {
        status: 200,
        headers: logoutHeaders,
      }
    );
  } catch (error) {
    console.error("Logout failed:", error);
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