import { randomBytes } from "crypto";
import type { EnvContextType } from "../context";

/**
 * Session数据接口
 */
export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * 生成随机的session ID
 */
function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

/**
 * 创建session ID，格式为 userId:randomId
 */
function createSessionKey(userId: string): string {
  const randomId = generateSessionId();
  return `${userId}:${randomId}`;
}

/**
 * 解析cookie中的session ID
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
 * 创建新的session
 */
export async function createSession(
  sessionKV: EnvContextType["sessionKV"],
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

  // 存储到KV，设置过期时间
  await sessionKV.put(sessionId, JSON.stringify(sessionData), {
    expirationTtl: expirySeconds,
  });

  return sessionId;
}

/**
 * Session验证结果接口
 */
export interface SessionValidationResult {
  isValid: boolean;
  sessionData?: SessionData;
  reason?: "not_found" | "expired" | "invalid";
}

/**
 * 验证session - 增强版本，返回详细的验证结果
 */
export async function validateSessionDetailed(
  sessionKV: EnvContextType["sessionKV"],
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
      // 过期了，删除KV中的记录
      await sessionKV.delete(sessionId);
      return {
        isValid: false,
        reason: "expired",
        sessionData, // 返回过期的session数据，用于显示用户信息
      };
    }

    return {
      isValid: true,
      sessionData,
    };
  } catch (error) {
    console.error("验证session失败:", error);
    return {
      isValid: false,
      reason: "invalid",
    };
  }
}

/**
 * 验证session - 保持向后兼容
 */
export async function validateSession(
  sessionKV: EnvContextType["sessionKV"],
  sessionId: string
): Promise<SessionData | null> {
  const result = await validateSessionDetailed(sessionKV, sessionId);
  return result.isValid ? result.sessionData! : null;
}

/**
 * 删除session
 */
export async function destroySession(
  sessionKV: EnvContextType["sessionKV"],
  sessionId: string
): Promise<void> {
  try {
    await sessionKV.delete(sessionId);
  } catch (error) {
    console.error("删除session失败:", error);
  }
}

/**
 * 从请求中获取session ID
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
 * 从请求中获取并解析session信息
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
 * 创建session cookie响应头
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
 * 创建清除session cookie的响应头
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
 * 传统session兼容接口 - 保持向后兼容
 */
export async function getSession(request: Request) {
  const sessionId = getSessionFromRequest(request);

  return {
    get: (key: string) => {
      // 这个方法在新的实现中不再使用，因为session验证在middleware中完成
      console.warn(
        "getSession().get() 在新的session实现中已弃用，请使用context中的用户信息"
      );
      return null;
    },
    set: () => {
      console.warn(
        "getSession().set() 在新的session实现中已弃用，请使用createSession"
      );
    },
    destroy: () => {
      console.warn(
        "getSession().destroy() 在新的session实现中已弃用，请使用destroySession"
      );
    },
  };
}

// 保留原来的JWT相关导出以保持兼容性，但标记为已弃用
export function getTokenFromRequest(request: Request): string | null {
  console.warn("getTokenFromRequest 已弃用，请使用 getSessionFromRequest");
  return getSessionFromRequest(request);
}

export async function verifyJWTToken(token: string): Promise<any> {
  console.warn("verifyJWTToken 已弃用，请使用 validateSession");
  return null;
}

export async function createJWTToken(payload: any): Promise<string> {
  console.warn("createJWTToken 已弃用，请使用 createSession");
  return "";
}

export function createAuthHeaders(token: string): Headers {
  console.warn("createAuthHeaders 已弃用，请使用 createSessionHeaders");
  return new Headers();
}
