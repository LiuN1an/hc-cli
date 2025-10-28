import React, { useState, useEffect } from "react";
import { Link, useActionData, useSubmit, useNavigate } from "react-router";
import toast from "sonner";
import type { Route } from "./+types/signup";
import { EnvContext } from "~/context";
import { createUser, checkEmailExists } from "~/lib/db-utils";
import { hashPassword } from "~/lib/crypto";
import { createSession, createSessionHeaders } from "~/lib/session";

// 注册 Action (POST)
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
    const data = await request.json() as any;
    const { email, password, name, role } = data;

    // 验证必填字段
    if (!email || !password || !name) {
      return {
        success: false,
        error: "Email, password and name are required",
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

    // 验证密码长度
    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
        code: "PASSWORD_TOO_SHORT",
      };
    }

    // 验证角色（如果提供）
    const validRoles = ['user', 'admin'];
    if (role && !validRoles.includes(role)) {
      return {
        success: false,
        error: "Invalid role type",
        code: "INVALID_ROLE",
      };
    }

    // 检查邮箱是否已存在
    const emailExists = await checkEmailExists(db, email);
    if (emailExists) {
      return {
        success: false,
        error: "This email is already registered",
        code: "EMAIL_EXISTS",
      };
    }

    // 哈希密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const newUser = await createUser(db, {
      email,
      name,
      password: hashedPassword,
      role: (role as 'user' | 'admin') || 'user',
    });

    // 创建session
    const sessionId = await createSession(sessionKV, sessionExpiry, {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // 创建响应头（设置Cookie）
    const sessionHeaders = createSessionHeaders(sessionId, sessionExpiry);

    // 返回成功响应数据，让组件处理导航
    return Response.json(
      {
        success: true,
        data: {
          sessionId,
          user: newUser,
        },
      },
      {
        status: 200,
        headers: sessionHeaders,
      }
    );
  } catch (error) {
    console.error("注册失败:", error);
    return {
      success: false,
      error: "Internal server error, please try again later",
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
    password: "",
    name: "",
    role: "user" as "user" | "admin",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 根据action结果进行导航和提示
  useEffect(() => {
    if (actionData?.success) {
      toast.success("Registration successful! Welcome to our platform", {
        duration: 3000,
      });
      // 稍微延迟导航，让用户看到toast提示
      setTimeout(() => {
        navigate("/users");
      }, 500);
    } else if (actionData && !actionData.success) {
      // 显示错误toast
      toast.error(actionData.error || "Registration failed, please try again", {
        duration: 4000,
      });
    }
  }, [actionData, navigate]);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    // 使用 useSubmit 提交数据到当前路由的 action
    submit(formData, {
      method: "post",
      encType: "application/json"
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              already have an account? Sign in
            </Link>
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Enter password (at least 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="user">Regular User</option>
                <option value="admin">Administrator</option>
              </select>
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
              {isLoading ? "Signing up..." : "Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Meta信息
export function meta() {
  return [
    { title: "Sign Up - Multi-Vendor Marketplace" },
    { name: "description", content: "Create a new account" },
  ];
}
