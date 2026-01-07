import type { AppLoadContext } from 'react-router';
import { eq, users } from '@template/shared/database';
import { hashPassword, verifyPassword } from '../lib/crypto';
import {
  createClearSessionCookie,
  createSessionCookie,
  createSessionData,
  deleteSession,
  generateSessionId,
  parseSessionCookie,
  storeSession
} from '../lib/session';

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Signup request body
 */
export interface SignupRequest {
  email: string;
  password: string;
  name?: string;
}

/**
 * Handle login request
 */
export async function handleLogin(
  data: LoginRequest,
  context: AppLoadContext
): Promise<Response> {
  const { email, password } = data;

  // Find user by email
  const user = await context.db.select().from(users).where(eq(users.email, email)).get();

  if (!user) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    return Response.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Create session
  const expirySeconds = parseInt(context.sessionExpiry, 10);
  const sessionId = generateSessionId(user.id);
  const publicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  const sessionData = createSessionData(publicUser, expirySeconds);
  await storeSession(context.sessionKV, sessionId, sessionData, expirySeconds);

  // Return response with session cookie
  return Response.json(
    { user: publicUser },
    {
      headers: {
        'Set-Cookie': createSessionCookie(sessionId, expirySeconds)
      }
    }
  );
}

/**
 * Handle signup request
 */
export async function handleSignup(
  data: SignupRequest,
  context: AppLoadContext
): Promise<Response> {
  const { email, password, name } = data;

  // Check if email already exists
  const existing = await context.db.select().from(users).where(eq(users.email, email)).get();

  if (existing) {
    return Response.json({ error: 'Email already registered' }, { status: 400 });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const result = await context.db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name: name || null,
      role: 'user'
    })
    .returning();

  const user = result[0];
  if (!user) {
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }

  // Create session
  const expirySeconds = parseInt(context.sessionExpiry, 10);
  const sessionId = generateSessionId(user.id);
  const publicUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  const sessionData = createSessionData(publicUser, expirySeconds);
  await storeSession(context.sessionKV, sessionId, sessionData, expirySeconds);

  return Response.json(
    { user: publicUser },
    {
      status: 201,
      headers: {
        'Set-Cookie': createSessionCookie(sessionId, expirySeconds)
      }
    }
  );
}

/**
 * Handle logout request
 */
export async function handleLogout(request: Request, context: AppLoadContext): Promise<Response> {
  const cookieHeader = request.headers.get('Cookie');
  const sessionId = parseSessionCookie(cookieHeader);

  if (sessionId) {
    await deleteSession(context.sessionKV, sessionId);
  }

  return Response.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': createClearSessionCookie()
      }
    }
  );
}

/**
 * Handle validate session request
 */
export async function handleValidateSession(
  request: Request,
  context: AppLoadContext
): Promise<Response> {
  const { authMiddleware } = await import('../middleware/auth');
  const user = await authMiddleware(request, context);

  if (!user) {
    return Response.json({ valid: false, user: null });
  }

  return Response.json({ valid: true, user });
}
