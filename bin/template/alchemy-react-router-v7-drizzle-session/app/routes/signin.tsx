import React, { useState, useEffect } from "react";
import {
  Link,
  useActionData,
  useSubmit,
  useNavigate,
} from "react-router";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import type { Route } from "./+types/signin";
import { EnvContext } from "~/context";
import { getUserByEmailWithPassword } from "~/lib/db-utils";
import { verifyPassword } from "~/lib/crypto";
import { createSession, createSessionHeaders } from "~/lib/session";

// 登录 Action (POST)
export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return {
      success: false,
      error: "HTTP method not supported",
      code: "METHOD_NOT_ALLOWED",
    };
  }

  const { db, sessionKV, sessionExpiry } = context.get(EnvContext);

  try {
    const data = (await request.json()) as any;
    const { email, password } = data;

    // 验证必填字段
    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
        code: "MISSING_FIELDS",
      };
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT",
      };
    }

    // 查找用户（包含密码）
    const user = await getUserByEmailWithPassword(db, email);
    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      };
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      };
    }

    // 创建session
    const sessionId = await createSession(sessionKV, sessionExpiry, {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 创建响应头（设置Cookie）
    const sessionHeaders = createSessionHeaders(sessionId, sessionExpiry);

    // 返回成功响应数据，让组件处理导航
    return Response.json(
      {
        success: true,
        data: {
          sessionId,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      },
      {
        status: 200,
        headers: sessionHeaders,
      }
    );
  } catch (error) {
    console.error("登录失败:", error);
    return {
      success: false,
      error: "Internal server error, please try again later",
      code: "INTERNAL_ERROR",
    };
  }
}

export default function SigninPage() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigate = useNavigate();

  // 使用nuqs管理auth_error查询参数
  const [authError, setAuthError] = useQueryState("auth_error");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 检测认证错误状态并显示相应提示
  useEffect(() => {
    if (authError) {
      let message = "";
      let icon = "";
      
      switch (authError) {
        case "expired":
          message = "Session expired, please sign in again";
          icon = "⏰";
          break;
        case "not_found":
          message = "Session not found, please sign in again";
          icon = "🔍";
          break;
        case "invalid":
          message = "Invalid session, please sign in again";
          icon = "⚠️";
          break;
        default:
          message = "Authentication failed, please sign in again";
          icon = "🔐";
      }
      
      toast.error(message, {
        duration: 5000,
        icon,
      });
      
      // 清理URL参数，避免刷新时重复显示
      setAuthError(null);
    }
  }, [authError, setAuthError]);

  // 根据action结果进行导航和提示
  useEffect(() => {
    if (actionData?.success) {
      toast.success("Sign in successful! Welcome back", {
        duration: 3000,
      });
      // 稍微延迟导航，让用户看到toast提示
      setTimeout(() => {
        navigate("/users");
      }, 500);
    } else if (actionData && !actionData.success) {
      // 显示错误toast
      toast.error(actionData.error || "Sign in failed, please try again", {
        duration: 4000,
      });
    }
  }, [actionData, navigate]);

  const handleSubmit = async () => {
    setIsLoading(true);

    // 使用 useSubmit 提交数据到当前路由的 action
    submit(formData, {
      method: "post",
      encType: "application/json",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 当 action 完成时重置 loading 状态
  React.useEffect(() => {
    if (actionData) {
      setIsLoading(false);
    }
  }, [actionData]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              don't have an account? Sign up now
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {actionData && !actionData.success && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{actionData.error}</div>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">Test Account:</p>
            <p className="text-xs text-gray-500 mt-1">
              Email: test@example.com | Password: 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Meta信息
export function meta() {
  return [
    { title: "Sign In - Multi-Vendor Marketplace" },
    { name: "description", content: "Sign in to your account" },
  ];
}
