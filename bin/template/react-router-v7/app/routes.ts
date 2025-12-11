import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // 布局路由
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),
    route("table", "routes/table.tsx"),
    route("form", "routes/form.tsx"),
    route("protected", "routes/protected.tsx"),
  ]),

] satisfies RouteConfig;

