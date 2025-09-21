import type { Route } from "./+types/user-permission";
import { users } from "@/schema";
import { eq } from "drizzle-orm";
import { EnvContext } from "~/context";

// 只允许GET请求
export async function loader({ request, context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);

  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  // 验证邮箱参数
  if (!email) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Email parameter is required",
        code: "MISSING_EMAIL",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 查询用户
    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.createdAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
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

    const userData = user[0];

    // 根据角色定义权限
    const permissions = getPermissionsByRole(userData.role);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            created_at: userData.created_at,
          },
          permissions,
          role_description: getRoleDescription(userData.role),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Query user permissions failed:", error);
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

// 根据角色获取权限列表
function getPermissionsByRole(role: string) {
  const permissionMap: Record<string, string[]> = {
    admin: [
      "user:create",
      "user:read",
      "user:update",
      "user:delete",
      "product:create",
      "product:read",
      "product:update",
      "product:delete",
      "order:read",
      "order:update",
      "order:delete",
      "category:create",
      "category:update",
      "category:delete",
      "system:manage",
    ],
    user: [
      "product:read",
      "order:create",
      "order:read",
      "profile:update",
    ],
  };

  return permissionMap[role] || [];
}

// 获取角色描述
function getRoleDescription(role: string) {
  const roleDescriptions: Record<string, string> = {
    admin: "Administrator - Full system access",
    user: "Regular User - Can browse products and manage orders",
  };

  return roleDescriptions[role] || "Unknown role";
}

// 不允许其他HTTP方法
export async function action({ request }: Route.ActionArgs) {
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
