/**
 * Admin Auth Middleware
 *
 * Simple header-based token authentication for admin access
 */

import type { EnvContextType } from "~/context";

export interface AuthResult {
  authenticated: boolean;
  error?: string;
}

/**
 * Verify request has valid admin token in headers
 */
export function verifyAdminToken(
  request: Request,
  env: Pick<EnvContextType, "authTokenKey" | "authTokenValue">
): AuthResult {
  const token = request.headers.get(env.authTokenKey);

  if (!token) {
    return { authenticated: false, error: "Missing auth token" };
  }

  if (token !== env.authTokenValue) {
    return { authenticated: false, error: "Invalid auth token" };
  }

  return { authenticated: true };
}

/**
 * Create unauthorized response
 */
export function unauthorizedResponse(message = "Unauthorized"): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Admin auth middleware for API routes
 * Use in loader/action functions
 */
export function requireAdmin(
  request: Request,
  env: Pick<EnvContextType, "authTokenKey" | "authTokenValue">
): Response | null {
  const result = verifyAdminToken(request, env);
  if (!result.authenticated) {
    return unauthorizedResponse(result.error);
  }
  return null; // Auth passed, continue execution
}
