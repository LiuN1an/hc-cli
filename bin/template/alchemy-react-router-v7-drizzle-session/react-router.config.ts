import type { Config } from "@react-router/dev/config";
import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

// ============================================
// 路由定义辅助函数
// ============================================

/**
 * API v1 路由辅助函数
 * 自动生成 /api/v1/{endpoint} 的 URL 和对应的文件路径
 * 
 * @example
 * apiV1Route("users")           → URL: /api/v1/users, File: routes/api/v1/users.tsx
 * apiV1Route("users/:id")       → URL: /api/v1/users/:id, File: routes/api/v1/users.$id.tsx
 * apiV1Route("admin/products")  → URL: /api/v1/admin/products, File: routes/api/v1/admin.products.tsx
 */
function apiV1Route(endpoint: string) {
  const urlPath = `api/v1/${endpoint}`;
  const filePath = `routes/api/v1/${endpoint
    .replace(/:/g, "$")
    .replace(/\//g, ".")}.tsx`;
  return route(urlPath, filePath);
}

/**
 * Admin 页面路由辅助函数
 * 用于创建管理后台相关页面路由
 * 
 * @example
 * adminRoute("dashboard")       → URL: /admin/dashboard, File: routes/admin.dashboard.tsx
 * adminRoute("users/:id")       → URL: /admin/users/:id, File: routes/admin.users.$id.tsx
 */
function adminRoute(path: string) {
  const urlPath = `admin/${path}`;
  const filePath = `routes/admin.${path.replace(/:/g, "$").replace(/\//g, ".")}.tsx`;
  return route(urlPath, filePath);
}

// ============================================
// 路由配置
// ============================================

/**
 * 页面路由
 */
const pageRoutes: RouteConfig = [
  index("routes/home.tsx"),
  route("signin", "routes/signin.tsx"),
  route("signup", "routes/signup.tsx"),
  // 添加更多页面路由...
];

/**
 * 管理后台路由（示例）
 */
const adminRoutes: RouteConfig = [
  // adminRoute("dashboard"),
  // adminRoute("users"),
  // adminRoute("users/:id"),
];

/**
 * API v1 路由
 */
const apiRoutes: RouteConfig = [
  // 用户相关
  apiV1Route("users"),
  apiV1Route("user-permission"),
  
  // 认证相关
  apiV1Route("validate"),
  apiV1Route("logout"),
  
  // 添加更多 API 路由...
  // apiV1Route("products"),
  // apiV1Route("products/:id"),
  // apiV1Route("orders"),
];

/**
 * 系统路由（404、错误页等）
 */
const systemRoutes: RouteConfig = [
  route("*", "routes/$.tsx"), // 404 页面
];

// ============================================
// 导出配置
// ============================================

export default {
  ssr: true,
  future: {
    unstable_viteEnvironmentApi: true,
    v8_middleware: true,
  },
  // 如果需要使用 routes 配置，取消下面的注释
  // routes: [
  //   ...pageRoutes,
  //   ...adminRoutes,
  //   ...apiRoutes,
  //   ...systemRoutes,
  // ] satisfies RouteConfig,
} satisfies Config;

// 导出辅助函数供其他地方使用
export { apiV1Route, adminRoute };
