import { UserContext, EnvContext } from "~/context";
import {
  getSessionFromRequest,
  validateSessionDetailed,
} from "~/lib/session";
import { getUserById } from "~/lib/db-utils";
import type { RouterContextProvider } from "react-router";

/**
 * 认证结果类型
 */
export interface AuthResult {
  success: boolean;
  user?: any;
  error?: {
    message: string;
    code: string;
  };
}

/**
 * 通用认证逻辑
 * 支持两种认证方式：
 * 1. Header认证（优先）- 使用 ADMIN_AUTH_HEADER 和 ADMIN_AUTH_SECRET
 * 2. Session认证（后备）- 使用Cookie中的session
 */
export const authenticate = async (
  request: Request<unknown, CfProperties<unknown>>,
  context: Readonly<RouterContextProvider>
): Promise<AuthResult> => {
  const { db, sessionKV, cloudflare } = context.get(EnvContext);

  // 从环境变量获取管理员认证配置
  const ADMIN_AUTH_HEADER = cloudflare.env.ADMIN_AUTH_HEADER;
  const ADMIN_AUTH_SECRET = cloudflare.env.ADMIN_AUTH_SECRET;

  // 方式1：检查请求头中的管理员认证密钥
  const authAdminHeader = request.headers.get(ADMIN_AUTH_HEADER);
  if (authAdminHeader === ADMIN_AUTH_SECRET) {
    // Header 验证通过，创建一个虚拟的管理员用户对象
    const virtualAdminUser = {
      id: "00000000-0000-0000-0000-000000000000", // 虚拟UUID
      email: "admin@header.auth",
      name: "Header Admin",
      role: "admin" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      success: true,
      user: virtualAdminUser,
    };
  }

  // 方式2：使用原有的 session 验证逻辑
  // 从请求中获取session ID
  const sessionId = getSessionFromRequest(request);

  if (!sessionId) {
    return {
      success: false,
      error: {
        message: "Unauthorized: No session token",
        code: "UNAUTHORIZED",
      },
    };
  }

  // 验证session，使用增强版本获取详细结果
  const validationResult = await validateSessionDetailed(
    sessionKV as any,
    sessionId
  );

  if (!validationResult.isValid) {
    // 根据失败原因返回不同的错误信息
    const reason = validationResult.reason;
    let errorMessage = "Unauthorized: Invalid session";
    let errorCode = "UNAUTHORIZED";

    if (reason === "expired") {
      errorMessage = "Unauthorized: Session expired";
      errorCode = "SESSION_EXPIRED";
    } else if (reason === "not_found") {
      errorMessage = "Unauthorized: Session not found";
      errorCode = "SESSION_NOT_FOUND";
    } else if (reason === "invalid") {
      errorMessage = "Unauthorized: Invalid session";
      errorCode = "SESSION_INVALID";
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        code: errorCode,
      },
    };
  }

  // 从数据库获取最新的用户信息
  const user = await getUserById(db, validationResult.sessionData!.userId);
  if (!user) {
    // 用户不存在，清除session
    await sessionKV.delete(sessionId);
    return {
      success: false,
      error: {
        message: "Unauthorized: User not found",
        code: "USER_NOT_FOUND",
      },
    };
  }

  return {
    success: true,
    user,
  };
};

/**
 * 设置用户上下文的辅助函数
 */
export function setUserContext(
  context: Readonly<RouterContextProvider>,
  user: any
): void {
  context.set(UserContext, user);
}
