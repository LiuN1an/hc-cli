import { redirect, type MiddlewareFunction } from "react-router";
import { authenticate, setUserContext } from "~/middleware/common";

/**
 * 管理后台页面专用鉴权中间件
 * 支持两种认证方式：
 * 1. Header认证（优先）- 使用 ADMIN_AUTH_HEADER 和 ADMIN_AUTH_SECRET
 * 2. Session认证（后备）- 使用Cookie中的session
 * 
 * 鉴权失败时重定向到 /unauthorized 页面
 */
export const adminAuthMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  // 执行通用认证逻辑
  const authResult = await authenticate(request, context);

  if (!authResult.success) {
    // 认证失败，重定向到无权限页面
    throw redirect("/unauthorized");
  }

  // 验证用户是否为管理员（Header认证自动是admin，session认证需要检查）
  if (authResult.user.role !== "admin") {
    // 非管理员用户，跳转到无权限页面
    throw redirect("/unauthorized");
  }

  // 认证成功，设置用户上下文
  setUserContext(context, authResult.user);
};
