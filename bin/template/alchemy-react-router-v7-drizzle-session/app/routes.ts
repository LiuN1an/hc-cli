import { type RouteConfig, index, route } from "@react-router/dev/routes";

// 页面路由
const pageRoutes = [
  route("/", "routes/layout.tsx", [
    index("routes/home.tsx"),
    route("table", "routes/table.tsx"),
    route("form", "routes/form.tsx"),
    route("protected", "routes/protected.tsx"),
  ]),
  route("signup", "routes/signup.tsx"),
  route("signin", "routes/signin.tsx"),
  route("admin", "routes/admin.tsx"),
];

// API路由辅助函数 - 简化API路由定义
function apiV1Route(endpoint: string) {
  return route(`api/v1/${endpoint}`, `routes/api/v1/${endpoint}.tsx`);
}

// API路由 - 集中管理，使用文件夹结构
const apiRoutes = [
  apiV1Route("users"),
  apiV1Route("logout"),
  apiV1Route("profile"),
];

// 系统路由
const systemRoutes = [
  route("*", "routes/$.tsx"), // 通配符路由，处理所有未匹配的路径
];

export default [
  ...pageRoutes,
  ...apiRoutes,
  ...systemRoutes,
] satisfies RouteConfig;
