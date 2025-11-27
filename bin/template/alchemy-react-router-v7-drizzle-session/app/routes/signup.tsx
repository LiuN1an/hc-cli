import React, { useState, useEffect } from "react";
import { Link, useActionData, useSubmit, useNavigate } from "react-router";
import { toast } from "sonner";
import type { Route } from "./+types/signup";
import { EnvContext } from "~/context";
import { handleSignup } from "~/features/auth";

/**
 * 注册 Action
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
    const result = await handleSignup(db, sessionKV, sessionExpiry, data);

    // 如果有 headers（包含 Set-Cookie），使用 Response.json
    if (result.headers) {
      return Response.json(
        {
          success: result.success,
          data: result.data,
          message: result.message,
          error: result.error,
          code: result.code,
        },
        {
          status: result.success ? 201 : 400,
          headers: result.headers,
        }
      );
    }

    return result;
  } catch (error) {
    console.error("注册失败:", error);
    return {
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    };
  }
}

export default function SignupPage() {
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 根据 action 结果进行导航和提示
  useEffect(() => {
    if (actionData?.success) {
      toast.success("注册成功！", { duration: 3000 });
      setTimeout(() => navigate("/"), 500);
    } else if (actionData && !actionData.success) {
      toast.error(actionData.error || "注册失败", { duration: 4000 });
    }
  }, [actionData, navigate]);

  // 当 action 完成时重置 loading 状态
  useEffect(() => {
    if (actionData) setIsLoading(false);
  }, [actionData]);

  const handleSubmit = () => {
    // 前端验证：确认密码
    if (formData.password !== formData.confirmPassword) {
      toast.error("两次输入的密码不一致");
      return;
    }

    setIsLoading(true);
    submit(
      {
        email: formData.email,
        name: formData.name,
        password: formData.password,
      },
      {
        method: "post",
        encType: "application/json",
      }
    );
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
            创建账户
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            已有账户？{" "}
            <Link
              to="/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              立即登录
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                姓名
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="请输入姓名"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
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
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="至少6个字符"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                确认密码
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="再次输入密码"
                value={formData.confirmPassword}
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
            {isLoading ? "注册中..." : "注册"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "注册" },
    { name: "description", content: "创建新账户" },
  ];
}
