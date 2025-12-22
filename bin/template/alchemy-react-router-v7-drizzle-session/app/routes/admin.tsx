/**
 * 管理后台页面
 */
import type { Route } from "./+types/admin";
import { Link } from "react-router";
import { EnvContext } from "~/context";
import { Button } from "~/components/ui/button";
import { authenticateRequest } from "~/features/auth";
import { getUserById } from "~/features/user/server/utils";
import type { PublicUser } from "~/features/user/database/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "管理后台 - Admin" },
    { name: "description", content: "管理后台" },
  ];
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const { db, sessionKV, authTokenKey, authTokenValue } = context.get(EnvContext);

  // 统一认证（支持 session 和 auth_token）
  const authResult = await authenticateRequest(
    request,
    sessionKV,
    authTokenKey,
    authTokenValue
  );

  // Token 认证 - 管理员直接通过
  if (authResult.type === "token") {
    return {
      user: {
        id: "token-admin",
        email: "admin@token",
        name: "Token Admin",
        role: "admin" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies PublicUser,
      error: null,
      authType: "token" as const,
    };
  }

  // 未认证
  if (authResult.type === "none") {
    return { user: null, error: "unauthorized", authType: null };
  }

  // Session 认证 - 获取用户详情
  const user = await getUserById(db, authResult.sessionData.userId);
  if (!user) {
    return { user: null, error: "user_not_found", authType: null };
  }

  // 检查是否为管理员
  if (user.role !== "admin") {
    return { user, error: "forbidden", authType: "session" as const };
  }

  return { user, error: null, authType: "session" as const };
}

export default function Admin({ loaderData }: Route.ComponentProps) {
  const { user, error, authType } = loaderData;

  // 未登录
  if (error === "unauthorized") {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 rounded-2xl border border-border/70 bg-card/80 p-8 shadow-[0_2px_0_rgba(30,30,30,0.08),0_12px_30px_rgba(30,30,30,0.08)]">
          <h1 className="text-2xl font-bold">需要登录</h1>
          <p className="text-muted-foreground">请先登录后再访问管理后台</p>
          <p className="text-muted-foreground text-sm">
            或在请求头中携带 auth_token 进行验证
          </p>
          <Button asChild>
            <Link to="/signin">去登录</Link>
          </Button>
        </div>
      </main>
    );
  }

  // 没有权限
  if (error === "forbidden") {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 rounded-2xl border border-border/70 bg-card/80 p-8 shadow-[0_2px_0_rgba(30,30,30,0.08),0_12px_30px_rgba(30,30,30,0.08)]">
          <h1 className="text-2xl font-bold text-destructive">没有权限</h1>
          <p className="text-muted-foreground">
            你没有访问管理后台的权限，当前角色：{user?.role}
          </p>
          <Button asChild variant="outline">
            <Link to="/">返回首页</Link>
          </Button>
        </div>
      </main>
    );
  }

  // 管理后台主界面
  return (
    <main className="min-h-screen">
      <header className="border-b border-border/60 bg-card/70 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">🔧 管理后台</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">
              {user?.name} ({user?.role})
              {authType === "token" && (
                <span className="ml-2 text-xs text-amber-600">[Token]</span>
              )}
            </span>
            <Button asChild variant="outline" size="sm">
              <Link to="/">返回前台</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 用户管理卡片 */}
          <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-[0_2px_0_rgba(30,30,30,0.08),0_12px_30px_rgba(30,30,30,0.08)]">
            <h2 className="text-lg font-semibold mb-2">👥 用户管理</h2>
            <p className="text-muted-foreground text-sm mb-4">
              管理系统用户，查看用户列表
            </p>
            <Button asChild variant="secondary" size="sm">
              <Link to="/api/v1/users">查看用户 API</Link>
            </Button>
          </div>

          {/* 系统信息卡片 */}
          <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-[0_2px_0_rgba(30,30,30,0.08),0_12px_30px_rgba(30,30,30,0.08)]">
            <h2 className="text-lg font-semibold mb-2">📊 系统信息</h2>
            <p className="text-muted-foreground text-sm mb-4">
              查看系统运行状态
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>用户 ID: {user?.id}</p>
              <p>邮箱: {user?.email}</p>
              <p>角色: {user?.role}</p>
              <p>认证方式: {authType === "token" ? "Token" : "Session"}</p>
            </div>
          </div>

          {/* 快捷操作卡片 */}
          <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-[0_2px_0_rgba(30,30,30,0.08),0_12px_30px_rgba(30,30,30,0.08)]">
            <h2 className="text-lg font-semibold mb-2">⚡ 快捷操作</h2>
            <p className="text-muted-foreground text-sm mb-4">
              常用功能入口
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/api/v1/profile">查看 Profile API</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
