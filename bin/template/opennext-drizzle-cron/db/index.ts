import * as schema from "./schema";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export let db: DrizzleD1Database<typeof schema>;

export const getDB = async () => {
  if (db) {
    return db;
  }

  const context = getCloudflareContext();

  db = drizzle((context.env as any).DB, { schema });

  return db;
};

getDB();
