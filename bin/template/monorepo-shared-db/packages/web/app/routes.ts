import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),

  // API routes (protected by admin auth)
  ...prefix("api/v1", [
    route("health", "routes/api/health.tsx"),
    route("users", "routes/api/users.tsx"),
  ]),
] satisfies RouteConfig;
