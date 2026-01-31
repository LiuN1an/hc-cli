import type { Route } from "./+types/health";

export async function loader({ request, context }: Route.LoaderArgs) {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    package: "@myapp/web",
  });
}
