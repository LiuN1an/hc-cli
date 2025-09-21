import React from "react";
import { Outlet, Link, useLocation } from "react-router";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarTrigger,
  SidebarRail,
} from "~/components/ui/sidebar";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  SettingsIcon,
  PackageIcon,
  BarChart3Icon,
  TagIcon,
  ImageIcon,
  LogOutIcon
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { UserProfile } from "~/components/UserProfile";

// 侧边栏菜单配置
const adminMenuItems = [
  {
    title: "仪表盘",
    icon: HomeIcon,
    url: "/admin",
  },
  {
    title: "商品管理",
    icon: PackageIcon,
    url: "/admin/product",
  },
  {
    title: "用户管理", 
    icon: UsersIcon,
    url: "/admin/users",
  },
  {
    title: "订单管理",
    icon: ShoppingBagIcon,
    url: "/admin/orders",
  },
  {
    title: "类目管理",
    icon: TagIcon,
    url: "/admin/categories",
  },
  {
    title: "横幅管理",
    icon: ImageIcon,
    url: "/admin/banners",
  },
  {
    title: "统计报表",
    icon: BarChart3Icon,
    url: "/admin/statistics",
  },
  {
    title: "系统设置",
    icon: SettingsIcon,
    url: "/admin/settings",
  },
];

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar variant="inset" className="border-r">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2 py-4">
              <PackageIcon className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <span className="font-semibold text-lg">多商户平台</span>
                <span className="text-sm text-muted-foreground">管理后台</span>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>管理功能</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.url;
                    
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.title}
                        >
                          <Link to={item.url}>
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t">
            <div className="p-2">
              <UserProfile />
              <Separator className="my-2" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link to="/">
                  <HomeIcon className="h-4 w-4 mr-2" />
                  返回前台
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                asChild
              >
                <Link to="/api/v1/logout">
                  <LogOutIcon className="h-4 w-4 mr-2" />
                  退出登录
                </Link>
              </Button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">
                {adminMenuItems.find(item => item.url === location.pathname)?.title || "管理后台"}
              </h1>
            </div>
          </header>

          <main className="flex-1 p-6">
            {children || <Outlet />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
