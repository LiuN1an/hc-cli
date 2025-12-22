import React, { useState, useEffect } from "react";
import { Link, useActionData, useSubmit, useNavigate } from "react-router";
import { toast } from "sonner";
import { useQueryState } from "nuqs";
import type { Route } from "./+types/signin";
import { EnvContext } from "~/context";
import { handleLogin } from "~/features/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">登录账户</CardTitle>
          <CardDescription>
            还没有账户？{" "}
            <Link to="/signup" className="underline underline-offset-4">
              立即注册
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                邮箱地址
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="请输入邮箱"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                密码
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="请输入密码"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          {actionData && !actionData.success && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4">
              <div className="text-sm text-destructive">{actionData.error}</div>
            </div>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "登录中..." : "登录"}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            <p>测试账户: test@example.com / 123456</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function meta() {
  return [
    { title: "登录" },
    { name: "description", content: "登录您的账户" },
  ];
}
