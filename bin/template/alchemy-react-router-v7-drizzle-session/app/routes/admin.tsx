import type { Route } from "./+types/admin";
import { EnvContext, UserContext, getEnvContext } from "~/context";
import { adminAuthMiddleware } from "~/middleware/admin-auth";
import { AdminLayout } from "~/components/AdminLayout";
import { 
  UsersIcon, 
  PackageIcon, 
  ShoppingCartIcon, 
  TrendingUpIcon,
  DollarSignIcon,
  ClockIcon
} from "lucide-react";
import { orders, products, users } from "@/schema";
import type { PublicUser, Order } from "@/types";
import { count, sql, eq } from "drizzle-orm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "管理后台 - 多商户平台" },
    { name: "description", content: "管理后台仪表盘" },
  ];
}

export const middleware: Route.MiddlewareFunction[] = [
  adminAuthMiddleware as Route.MiddlewareFunction,
];

// 从 count() 查询推断统计数据类型
type StatsQueryResult = { count: number }[];

// 从数据库查询推断最近订单类型
type RecentOrderQueryResult = {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  userId: string;
}[];

// 定义Loader返回类型（匹配实际查询结果）
type LoaderData = {
  currentUser: PublicUser;
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    onlineProducts: number;
    pendingOrders: number;
  };
  recentOrders: RecentOrderQueryResult;
};

export async function loader({ context }: Route.LoaderArgs): Promise<LoaderData> {
  // middleware已经确保用户已认证且为管理员
  const user = context.get(UserContext)!; // 非空断言，因为middleware保证用户存在
  const { db } = context.get(EnvContext);
  
  // 获取统计数据
  const [
    totalUsersResult,
    totalProductsResult,
    totalOrdersResult,
    onlineProductsResult,
    pendingOrdersResult,
    recentOrdersResult
  ] = await Promise.all([
    // 总用户数
    db.select({ count: count() }).from(users),
    
    // 总商品数
    db.select({ count: count() }).from(products).where(eq(products.isDeleted, false)),
    
    // 总订单数
    db.select({ count: count() }).from(orders),
    
    // 在线商品数
    db.select({ count: count() })
      .from(products)
      .where(eq(products.isOnline, true)),
    
    // 待处理订单数
    db.select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "pending")),
    
    // 最近订单
    db.select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      status: orders.status,
      createdAt: orders.createdAt,
      userId: orders.userId
    })
    .from(orders)
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(5)
  ]);

  return {
    currentUser: user,
    stats: {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalProducts: totalProductsResult[0]?.count || 0,
      totalOrders: totalOrdersResult[0]?.count || 0,
      onlineProducts: onlineProductsResult[0]?.count || 0,
      pendingOrders: pendingOrdersResult[0]?.count || 0,
    },
    recentOrders: recentOrdersResult
  } as const;
}

export default function AdminDashboard({ loaderData }: { loaderData: LoaderData }) {
  const { stats, recentOrders } = loaderData;

  const statCards = [
    {
      title: "总用户数",
      value: stats.totalUsers,
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "总商品数",
      value: stats.totalProducts,
      icon: PackageIcon,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "在线商品",
      value: stats.onlineProducts,
      icon: TrendingUpIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "总订单数",
      value: stats.totalOrders,
      icon: ShoppingCartIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
    {
      title: "待处理订单",
      value: stats.pendingOrders,
      icon: ClockIcon,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 欢迎信息 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
          <p className="text-muted-foreground">
            欢迎回来，这里是平台数据概览和快速操作入口
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className={`rounded-full p-2 ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 最近订单 */}
        <div className="rounded-lg border bg-card">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">最近订单</h3>
              <a
                href="/admin/orders"
                className="text-sm text-primary hover:underline"
              >
                查看全部
              </a>
            </div>
          </div>
          
          <div className="border-t">
            {recentOrders.length > 0 ? (
              <div className="divide-y">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <p className="font-medium">订单 #{order.id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        用户 ID: {order.userId}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">¥{order.totalAmount}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            order.status === "pending"
                              ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
                              : order.status === "paid"
                              ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                              : order.status === "shipped"
                              ? "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                              : order.status === "delivered"
                              ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {order.status === "pending" && "待支付"}
                          {order.status === "paid" && "已支付"}
                          {order.status === "shipped" && "已发货"}
                          {order.status === "delivered" && "已送达"}
                          {order.status === "cancelled" && "已取消"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                暂无订单数据
              </div>
            )}
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/product"
            className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-50 p-3 dark:bg-blue-950">
                <PackageIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">商品管理</h4>
                <p className="text-sm text-muted-foreground">
                  添加、编辑和管理商品信息
                </p>
              </div>
            </div>
          </a>

          <a
            href="/admin/users"
            className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-50 p-3 dark:bg-green-950">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold">用户管理</h4>
                <p className="text-sm text-muted-foreground">
                  管理平台用户和权限
                </p>
              </div>
            </div>
          </a>

          <a
            href="/admin/orders"
            className="rounded-lg border bg-card p-6 shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-50 p-3 dark:bg-orange-950">
                <ShoppingCartIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold">订单管理</h4>
                <p className="text-sm text-muted-foreground">
                  处理订单和发货管理
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
