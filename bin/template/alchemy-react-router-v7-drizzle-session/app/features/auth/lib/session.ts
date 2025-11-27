import { randomBytes } from "crypto";

/**
 * Session 数据接口
 */
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Session 验证结果接口
 */
export interface SessionValidationResult {
  isValid: boolean;
  sessionData?: SessionData;
  reason?: "not_found" | "expired" | "invalid";
}

/**
 * 生成随机的 session ID
 */
function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

/**
 * 创建 session ID，格式为 userId:randomId
 */
function createSessionKey(userId: string): string {
  const randomId = generateSessionId();
  return `${userId}:${randomId}`;
}

/**
 * 解析 cookie 中的 session ID
 */
function parseSessionFromCookie(
  cookieValue: string
): { userId: string; sessionId: string } | null {
  try {
    const parts = cookieValue.split(":");
    if (parts.length !== 2) return null;

    const userId = parts[0];
    if (!userId) return null;

    return {
      userId,
      sessionId: cookieValue,
    };
  } catch {
    return null;
  }
}

/**
 * 创建新的 session
 */
export async function createSession(
  sessionKV: KVNamespace,
  sessionExpiry: string,
  user: { id: string; email: string; role: string }
): Promise<string> {
  const sessionId = createSessionKey(user.id);
  const expirySeconds = parseInt(sessionExpiry);
  const now = Date.now();

  const sessionData: SessionData = {
    userId: user.id,
    email: user.email,
    role: user.role,
    createdAt: now,
    expiresAt: now + expirySeconds * 1000,
  };

  // 存储到 KV，设置过期时间
  await sessionKV.put(sessionId, JSON.stringify(sessionData), {
    expirationTtl: expirySeconds,
  });

  return sessionId;
}

/**
 * 验证 session - 增强版本，返回详细的验证结果
 */
export async function validateSessionDetailed(
  sessionKV: KVNamespace,
  sessionId: string
): Promise<SessionValidationResult> {
  try {
    const sessionDataStr = await sessionKV.get(sessionId);
    if (!sessionDataStr) {
      return {
        isValid: false,
        reason: "not_found",
      };
    }

    const sessionData: SessionData = JSON.parse(sessionDataStr);
    const now = Date.now();

    // 检查是否过期
    if (sessionData.expiresAt < now) {
      // 过期了，删除 KV 中的记录
      await sessionKV.delete(sessionId);
      return {
        isValid: false,
        reason: "expired",
        sessionData, // 返回过期的 session 数据，用于显示用户信息
      };
    }

    return {
      isValid: true,
      sessionData,
    };
  } catch (error) {
    console.error("验证 session 失败:", error);
    return {
      isValid: false,
      reason: "invalid",
    };
  }
}

/**
 * 验证 session - 简化版本
 */
export async function validateSession(
  sessionKV: KVNamespace,
  sessionId: string
): Promise<SessionData | null> {
  const result = await validateSessionDetailed(sessionKV, sessionId);
  return result.isValid ? result.sessionData! : null;
}

/**
 * 删除 session
 */
export async function destroySession(
  sessionKV: KVNamespace,
  sessionId: string
): Promise<void> {
  try {
    await sessionKV.delete(sessionId);
  } catch (error) {
    console.error("删除 session 失败:", error);
  }
}

/**
 * 从请求中获取 session ID
 */
export function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) {
    return null;
  }

  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((cookie) => {
      const [key, value] = cookie.trim().split("=");
      return [key, value];
    })
  );

  return cookies.session_id || null;
}

/**
 * 从请求中获取并解析 session 信息
 */
export function parseSessionFromRequest(
  request: Request
): { userId: string; sessionId: string } | null {
  const sessionId = getSessionFromRequest(request);
  if (!sessionId) {
    return null;
  }

  return parseSessionFromCookie(sessionId);
}

/**
 * 创建 session cookie 响应头
 */
export function createSessionHeaders(
  sessionId: string,
  sessionExpiry: string
): Headers {
  const headers = new Headers();
  const expirySeconds = parseInt(sessionExpiry);

  headers.set(
    "Set-Cookie",
    `session_id=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${expirySeconds}; Path=/`
  );

  return headers;
}

/**
 * 创建清除 session cookie 的响应头
 */
export function createLogoutHeaders(): Headers {
  const headers = new Headers();
  headers.set(
    "Set-Cookie",
    `session_id=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`
  );
  return headers;
}

/**
 * 从请求头获取指定 key 的 token
 */
export function getAuthTokenFromRequest(
  request: Request,
  tokenKey: string
): string | null {
  return request.headers.get(tokenKey);
}

/**
 * 认证结果类型
 */
export type AuthResult =
  | { type: "session"; sessionData: SessionData }
  | { type: "token"; isAdmin: true }
  | { type: "none"; reason: string };

/**
 * 统一认证函数 - 支持 session 和 auth_token 双重验证
 *
 * 优先级：auth_token > session
 * 当 auth_token 匹配时，直接授予管理员权限（用于数据库未初始化时）
 *
 * @param request - 请求对象
 * @param sessionKV - Session KV 存储
 * @param authTokenKey - Token 请求头 Key（如 x-admin-token）
 * @param authTokenValue - Token 值
 */
export async function authenticateRequest(
  request: Request,
  sessionKV: KVNamespace,
  authTokenKey: string,
  authTokenValue: string
): Promise<AuthResult> {
  // 1. 优先检查 auth_token 请求头
  const headerToken = getAuthTokenFromRequest(request, authTokenKey);
  if (headerToken && headerToken === authTokenValue) {
    return { type: "token", isAdmin: true };
  }

  // 2. 检查 session
  const sessionId = getSessionFromRequest(request);
  if (!sessionId) {
    return { type: "none", reason: "未提供认证信息" };
  }

  const sessionData = await validateSession(sessionKV, sessionId);
  if (!sessionData) {
    return { type: "none", reason: "会话已过期" };
  }

  return { type: "session", sessionData };
}

