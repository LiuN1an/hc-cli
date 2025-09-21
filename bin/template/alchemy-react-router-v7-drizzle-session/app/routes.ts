import { type RouteConfig, index, route } from "@react-router/dev/routes";

// 页面路由
const pageRoutes = [
  index("routes/home.tsx"),
  route("users", "routes/users.tsx"),
  route("auth-demo", "routes/auth-demo.tsx"),
  route("signup", "routes/signup.tsx"),
  route("signin", "routes/signin.tsx"),
];

// Admin路由 - 管理后台相关路由
const adminRoutes = [
  route("admin", "routes/admin.tsx"),
  route("admin/product", "routes/admin.product.tsx"),
  // 未来可以添加更多admin路由
  // route("admin/users", "routes/admin.users.tsx"),
  // route("admin/orders", "routes/admin.orders.tsx"),
  // route("admin/categories", "routes/admin.categories.tsx"),
];

// API路由辅助函数 - 简化API路由定义
function apiV1Route(endpoint: string) {
  return route(`api/v1/${endpoint}`, `routes/api/v1/${endpoint}.tsx`);
}

// API路由 - 集中管理，使用文件夹结构
const apiRoutes = [
  apiV1Route("user-permission"),
  apiV1Route("users"),
  apiV1Route("logout"),
  apiV1Route("validate"),
  // 未来可以轻松添加更多API路由
  // apiV1Route("products"),
  // apiV1Route("orders"),
];

// 系统路由
const systemRoutes = [
  route("*", "routes/$.tsx"), // 通配符路由，处理所有未匹配的路径
];

export default [
  ...pageRoutes,
  ...adminRoutes,
  ...apiRoutes,
  ...systemRoutes,
] satisfies RouteConfig;
