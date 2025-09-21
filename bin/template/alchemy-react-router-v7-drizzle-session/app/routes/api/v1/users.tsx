import type { Route } from "./+types/users";
import { users } from "@/schema";
import { eq } from "drizzle-orm";
import { EnvContext } from "~/context";
import { hashPassword } from "~/lib/crypto";
import {
  createUser,
  checkEmailExists,
  type CreateUserData,
} from "~/lib/db-utils";

// 获取所有用户 (GET)
export async function loader({ context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);
  try {
    // 查询所有用户，不返回密码字段
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        created_at: users.createdAt,
        updated_at: users.updatedAt,
      })
      .from(users);

    return new Response(
      JSON.stringify({
        success: true,
        data: allUsers,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to get user list:", error);
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

// 创建用户 (POST)
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);

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

  try {
    const data = (await request.json()) as any;
    const { email, name, password, role = "user" } = data;

    // 验证必填字段
    if (!email || !name || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "All fields are required",
          code: "MISSING_FIELDS",
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

    // 验证密码强度
    if (password.length < 6) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Password must be at least 6 characters",
          code: "WEAK_PASSWORD",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 验证角色
    const validRoles = ["user", "admin"];
    if (role && !validRoles.includes(role)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid user role",
          code: "INVALID_ROLE",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 检查邮箱是否已存在
    const emailExists = await checkEmailExists(db, email);
    if (emailExists) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email already registered",
          code: "EMAIL_EXISTS",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建用户数据
    const userData: CreateUserData = {
      email,
      name,
      password: hashedPassword,
      role: (role as "user" | "admin") || "user",
    };

    // 创建新用户
    const newUser = await createUser(db, userData);

    return new Response(
      JSON.stringify({
        success: true,
        data: newUser,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Failed to create user:", error);
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
