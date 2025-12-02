/**
 * Admin 路由组布局
 * 
 * Admin 后台管理布局:
 * - 独立的暗色主题
 * - 侧边栏导航
 * - 需要鉴权（在 middleware 中处理）
 * 
 * 注意: 这个布局是客户端组件，因为需要使用 hooks
 */

"use client";

import { Link, usePathname } from "@/i18n/request";
import { cn } from "@/lib/utils";
import { Home, Settings, Users, FileText } from "lucide-react";
import { ToastProvider } from "@/components/providers/toast-provider";

// 导航菜单配置
const menuItems = [
  { title: "Dashboard", url: "/admin", icon: Home },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Content", url: "/admin/content", icon: FileText },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.url;
          return (
            <Link
              key={item.url}
              href={item.url}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6">
        {children}
      </main>
      <ToastProvider />
    </div>
  );
}

