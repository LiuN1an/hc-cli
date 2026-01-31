import { drizzle } from "drizzle-orm/d1";
import { createRequestHandler, RouterContextProvider } from "react-router";
import * as schema from "@myapp/shared/database";
import { EnvContext, type EnvContextType } from "~/context";

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const db = drizzle(env.DB, { schema });

    const rootContext = new RouterContextProvider();
    rootContext.set(EnvContext, {
      cloudflare: { env, ctx },
      db,
      authTokenKey: env.AUTH_TOKEN_KEY || "x-admin-token",
      authTokenValue: env.AUTH_TOKEN_VALUE || "change-me-in-production",
    } satisfies EnvContextType);

    return requestHandler(request, rootContext);
  },
};
