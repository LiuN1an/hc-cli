import React, { useState, useEffect } from "react";
import { Link, useActionData, useSubmit, useNavigate } from "react-router";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import type { Route } from "./+types/signin";
import { EnvContext } from "~/context";
import { handleLogin } from "~/features/auth";

/**
 * 登录 Action
 *
 * 路由层只负责：
 * 1. 提取请求数据
 * 2. 调用业务处理函数
 * 3. 返回标准化响应
 */
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
    const data = await request.json();
    const result = await handleLogin(db, sessionKV, sessionExpiry, data);

    // 如果有 headers（包含 Set-Cookie），使用 Response.json
    if (result.headers) {
      return Response.json(
        {
          success: result.success,
          data: result.data,
          error: result.error,
          code: result.code,
        },
        {
          status: result.success ? 200 : 400,
          headers: result.headers,
        }
      );
    }

    return result;
  } catch (error) {
    console.error("登录失败:", error);
    return {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
  }
}

export default function SigninPage() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigate = useNavigate();

  // 使用 nuqs 管理 auth_error 查询参数
  const [authError, setAuthError] = useQueryState("auth_error");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 检测认证错误状态并显示相应提示
  useEffect(() => {
    if (authError) {
      const messages: Record<string, { message: string; icon: string }> = {
        expired: { message: "Session 已过期，请重新登录", icon: "⏰" },
        not_found: { message: "请先登录", icon: "🔍" },
        invalid: { message: "Session 无效，请重新登录", icon: "⚠️" },
      };

      const { message, icon } = messages[authError] || {
        message: "认证失败，请重新登录",
        icon: "🔐",
      };

      toast.error(message, { duration: 5000, icon });
      setAuthError(null);
    }
  }, [authError, setAuthError]);

  // 根据 action 结果进行导航和提示
  useEffect(() => {
    if (actionData?.success) {
      toast.success("登录成功！", { duration: 3000 });
      setTimeout(() => navigate("/"), 500);
    } else if (actionData && !actionData.success) {
      toast.error(actionData.error || "登录失败", { duration: 4000 });
    }
  }, [actionData, navigate]);

  // 当 action 完成时重置 loading 状态
  useEffect(() => {
    if (actionData) setIsLoading(false);
  }, [actionData]);

  const handleSubmit = () => {
    setIsLoading(true);
    submit(formData, {
      method: "post",
      encType: "application/json",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            登录账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            还没有账户？{" "}
            <Link
              to="/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              立即注册
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
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="请输入邮箱"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="请输入密码"
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

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "登录中..." : "登录"}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">测试账户:</p>
            <p className="text-xs text-gray-500 mt-1">
              邮箱: test@example.com | 密码: 123456
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "登录" },
    { name: "description", content: "登录您的账户" },
  ];
}
