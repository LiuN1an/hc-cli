import type { Route } from "./+types/home";
import { Link } from "react-router";
import { UserContext } from "~/context";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Alchemy Template" },
    { name: "description", content: "Alchemy + React Router v7 + Drizzle + Session" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  // 获取当前用户（如果已认证）
  let user = null;
  try {
    user = context.get(UserContext);
  } catch (e) {
    // 用户未认证
  }

  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-4xl font-bold text-white">
          🚀 Alchemy Template
        </h1>
        <p className="text-slate-400 text-lg">
          React Router v7 + Drizzle + Session
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-green-400">
              欢迎回来，{user.name}!
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/admin">管理后台</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/api/v1/users">查看用户 API</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link to="/signin">登录</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/signup">注册</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
