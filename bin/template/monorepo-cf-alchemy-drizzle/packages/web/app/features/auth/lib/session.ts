import type { PublicUser } from '@template/shared/database';
import { generateId } from '@template/shared/utils';

/**
 * Session data stored in KV
 */
export interface SessionData {
  userId: number;
  email: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * Session cookie name
 */
export const SESSION_COOKIE_NAME = 'session_id';

/**
 * Generate a new session ID
 */
export function generateSessionId(userId: number): string {
  return `${userId}:${generateId(32)}`;
}

/**
 * Create session data for storage
 */
export function createSessionData(user: PublicUser, expirySeconds: number): SessionData {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expirySeconds * 1000);

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Store session in KV
 */
export async function storeSession(
  kv: KVNamespace,
  sessionId: string,
  data: SessionData,
  expirySeconds: number
): Promise<void> {
  await kv.put(sessionId, JSON.stringify(data), {
    expirationTtl: expirySeconds
  });
}

/**
 * Get session from KV
 */
export async function getSession(kv: KVNamespace, sessionId: string): Promise<SessionData | null> {
  const data = await kv.get(sessionId);
  if (!data) return null;

  try {
    const session = JSON.parse(data) as SessionData;

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      await kv.delete(sessionId);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Delete session from KV
 */
export async function deleteSession(kv: KVNamespace, sessionId: string): Promise<void> {
  await kv.delete(sessionId);
}

/**
 * Parse session ID from cookie header
 */
export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) return null;

  return sessionCookie.split('=')[1] || null;
}

/**
 * Create session cookie header
 */
export function createSessionCookie(sessionId: string, expirySeconds: number): string {
  const expires = new Date(Date.now() + expirySeconds * 1000);

  return [
    `${SESSION_COOKIE_NAME}=${sessionId}`,
    `Path=/`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Strict`,
    `Expires=${expires.toUTCString()}`
  ].join('; ');
}

/**
 * Create cookie to clear session
 */
export function createClearSessionCookie(): string {
  return [
    `${SESSION_COOKIE_NAME}=`,
    `Path=/`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Strict`,
    `Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  ].join('; ');
}
