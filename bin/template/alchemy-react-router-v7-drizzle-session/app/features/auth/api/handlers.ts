/**
 * Auth API Handlers
 *
 * 认证相关的业务逻辑处理，供路由层调用
 */

import type { DatabaseType } from "~/features/user/server/utils";
import { getUserByEmail, createUser, checkEmailExists } from "~/features/user";
import { verifyPassword } from "~/lib/crypto";
import {
  createSession,
  destroySession,
  getSessionFromRequest,
  createSessionHeaders,
  createLogoutHeaders,
} from "../lib/session";

/**
 * 登录输入
 */
export interface LoginInput {
  email: string;
  password: string;
}

/**
 * 注册输入
 */
export interface SignupInput {
  email: string;
  name: string;
  password: string;
}

/**
 * 处理登录
 */
export async function handleLogin(
  db: DatabaseType,
  sessionKV: KVNamespace,
  sessionExpiry: string,
  input: LoginInput
) {
  const { email, password } = input;

  // 验证必填字段
  if (!email || !password) {
    return {
      success: false,
      error: "邮箱和密码不能为空",
      code: "MISSING_FIELDS",
    };
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "邮箱格式不正确",
      code: "INVALID_EMAIL_FORMAT",
    };
  }

  try {
    // 查找用户（包含密码）
    const user = await getUserByEmail(db, email);
    if (!user) {
      return {
        success: false,
        error: "邮箱或密码错误",
        code: "INVALID_CREDENTIALS",
      };
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "邮箱或密码错误",
        code: "INVALID_CREDENTIALS",
      };
    }

    // 创建 session
    const sessionId = await createSession(sessionKV, sessionExpiry, {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 创建响应头（设置 Cookie）
    const headers = createSessionHeaders(sessionId, sessionExpiry);

    // 返回用户信息（不包含密码）
    const { password: _, ...publicUser } = user;

    return {
      success: true,
      data: {
        sessionId,
        user: publicUser,
      },
      headers,
    };
  } catch (error) {
    console.error("登录失败:", error);
    return {
      success: false,
      error: "登录失败，请稍后重试",
      code: "LOGIN_FAILED",
    };
  }
}

/**
 * 处理注册
 */
export async function handleSignup(
  db: DatabaseType,
  sessionKV: KVNamespace,
  sessionExpiry: string,
  input: SignupInput
) {
  const { email, name, password } = input;

  // 验证必填字段
  if (!email || !name || !password) {
    return {
      success: false,
      error: "所有字段都是必填的",
      code: "MISSING_FIELDS",
    };
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "邮箱格式不正确",
      code: "INVALID_EMAIL_FORMAT",
    };
  }

  // 验证密码长度
  if (password.length < 6) {
    return {
      success: false,
      error: "密码至少需要6个字符",
      code: "PASSWORD_TOO_SHORT",
    };
  }

  try {
    // 检查邮箱是否已存在
    const emailExists = await checkEmailExists(db, email);
    if (emailExists) {
      return {
        success: false,
        error: "该邮箱已被注册",
        code: "EMAIL_EXISTS",
      };
    }

    // 创建用户
    const user = await createUser(db, {
      email,
      name,
      password,
      role: "user",
    });

    // 创建 session
    const sessionId = await createSession(sessionKV, sessionExpiry, {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // 创建响应头（设置 Cookie）
    const headers = createSessionHeaders(sessionId, sessionExpiry);

    return {
      success: true,
      data: {
        sessionId,
        user,
      },
      message: "注册成功",
      headers,
    };
  } catch (error) {
    console.error("注册失败:", error);
    return {
      success: false,
      error: "注册失败，请稍后重试",
      code: "SIGNUP_FAILED",
    };
  }
}

/**
 * 处理登出
 */
export async function handleLogout(
  sessionKV: KVNamespace,
  request: Request
) {
  try {
    const sessionId = getSessionFromRequest(request);

    if (sessionId) {
      await destroySession(sessionKV, sessionId);
    }

    const headers = createLogoutHeaders();

    return {
      success: true,
      message: "登出成功",
      headers,
    };
  } catch (error) {
    console.error("登出失败:", error);
    return {
      success: false,
      error: "登出失败",
      code: "LOGOUT_FAILED",
    };
  }
}

/**
 * 处理验证 session
 */
export async function handleValidateSession(
  sessionKV: KVNamespace,
  request: Request
) {
  const { validateSessionDetailed, getSessionFromRequest } = await import("../lib/session");

  const sessionId = getSessionFromRequest(request);

  if (!sessionId) {
    return {
      success: false,
      error: "未登录",
      code: "NOT_AUTHENTICATED",
    };
  }

  const result = await validateSessionDetailed(sessionKV, sessionId);

  if (!result.isValid) {
    return {
      success: false,
      error: "Session 无效或已过期",
      code: "INVALID_SESSION",
      reason: result.reason,
    };
  }

  return {
    success: true,
    data: {
      userId: result.sessionData!.userId,
      email: result.sessionData!.email,
      role: result.sessionData!.role,
    },
  };
}

