import { redirect } from "react-router";
import type { MiddlewareFunction } from "react-router";

// 用于在 header 中检测的鉴权 key
const AUTH_HEADER_KEY = "x-auth-token";

/**
 * 认证中间件
 * 检查请求头中是否存在 x-auth-token
 * 如果不存在则重定向到首页
 */
export const authMiddleware: MiddlewareFunction = async ({ request }, next) => {
  const authToken = request.headers.get(AUTH_HEADER_KEY);

  if (!authToken) {
    // 未授权，重定向到首页
    throw redirect("/");
  }

  // 可以在这里进行 token 验证逻辑
  // 例如验证 token 是否有效，是否过期等

  return next();
};

/**
 * 示例：简单的 token 验证中间件
 * 支持自定义验证逻辑
 */
export function createAuthMiddleware(options?: {
  headerKey?: string;
  redirectTo?: string;
  validate?: (token: string) => boolean | Promise<boolean>;
}): MiddlewareFunction {
  const {
    headerKey = AUTH_HEADER_KEY,
    redirectTo = "/",
    validate = () => true,
  } = options || {};

  return async ({ request }, next) => {
    const token = request.headers.get(headerKey);

    if (!token) {
      throw redirect(redirectTo);
    }

    const isValid = await validate(token);
    if (!isValid) {
      throw redirect(redirectTo);
    }

    return next();
  };
}
