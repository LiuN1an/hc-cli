import { redirect } from 'react-router';
import type { AppLoadContext } from 'react-router';
import { eq, users, type PublicUser } from '@template/shared/database';
import { getSession, parseSessionCookie } from '../lib/session';

/**
 * Auth middleware - validates session and returns user
 */
export async function authMiddleware(
  request: Request,
  context: AppLoadContext
): Promise<PublicUser | null> {
  const cookieHeader = request.headers.get('Cookie');
  const sessionId = parseSessionCookie(cookieHeader);

  if (!sessionId) {
    return null;
  }

  const session = await getSession(context.sessionKV, sessionId);
  if (!session) {
    return null;
  }

  // Get user from database
  const user = await context.db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatar: users.avatar,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  return user || null;
}

/**
 * Require auth middleware - redirects to signin if not authenticated
 */
export async function requireAuth(
  request: Request,
  context: AppLoadContext
): Promise<PublicUser> {
  const user = await authMiddleware(request, context);

  if (!user) {
    const url = new URL(request.url);
    throw redirect(`/signin?redirect=${encodeURIComponent(url.pathname)}`);
  }

  return user;
}

/**
 * Admin auth middleware - validates admin token or session
 * Supports header-based token authentication for API access
 */
export async function adminAuthMiddleware(
  request: Request,
  context: AppLoadContext
): Promise<PublicUser> {
  // Check for admin token in header
  const adminToken = request.headers.get(context.authTokenKey);
  if (adminToken === context.authTokenValue) {
    // Token auth - return a system admin user
    return {
      id: 0,
      email: 'system@admin',
      name: 'System Admin',
      role: 'admin',
      avatar: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Fall back to session auth
  const user = await authMiddleware(request, context);

  if (!user || user.role !== 'admin') {
    throw new Response('Unauthorized', { status: 401 });
  }

  return user;
}
