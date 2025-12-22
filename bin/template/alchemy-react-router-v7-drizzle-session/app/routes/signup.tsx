import React, { useState, useEffect } from "react";
import { Link, useActionData, useSubmit, useNavigate } from "react-router";
import { toast } from "sonner";
import type { Route } from "./+types/signup";
import { EnvContext } from "~/context";
import { handleSignup } from "~/features/auth";
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
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">创建账户</CardTitle>
          <CardDescription>
            已有账户？{" "}
            <Link to="/signin" className="underline underline-offset-4">
              立即登录
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                姓名
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                placeholder="请输入姓名"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
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
                autoComplete="new-password"
                required
                placeholder="至少6个字符"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                确认密码
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="再次输入密码"
                value={formData.confirmPassword}
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
            {isLoading ? "注册中..." : "注册"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function meta() {
  return [
    { title: "注册" },
    { name: "description", content: "创建新账户" },
  ];
}
