import type { Route } from "./+types/users";
import { useEnv } from "~/context";
import { requireAdmin } from "~/lib/auth";
import { users } from "@myapp/shared/database";

/**
 * GET /api/v1/users - List all users (admin only)
 */
export async function loader({ request, context }: Route.LoaderArgs) {
  const env = useEnv();

  // Admin auth check
  const authError = requireAdmin(request, env);
  if (authError) return authError;

  const allUsers = await env.db.select().from(users).all();

  return Response.json({
    success: true,
    data: allUsers,
  });
}
