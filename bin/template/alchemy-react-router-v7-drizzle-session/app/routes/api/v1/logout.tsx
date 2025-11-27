/**
 * 登出 API
 */
import type { Route } from "./+types/logout";
import { EnvContext } from "~/context";
import { handleLogout } from "~/features/auth";

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      {
        success: false,
        error: "HTTP method not supported",
        code: "METHOD_NOT_ALLOWED",
      },
      { status: 405 }
    );
  }

  const { sessionKV } = context.get(EnvContext);

  try {
    const result = await handleLogout(sessionKV, request);

    if (result.headers) {
      return Response.json(
        {
          success: result.success,
          message: result.message,
          error: result.error,
          code: result.code,
        },
        {
          status: result.success ? 200 : 500,
          headers: result.headers,
        }
      );
    }

    return Response.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Logout failed:", error);
    return Response.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
