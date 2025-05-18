import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export const getDB = (env: Env) => {
  return drizzle(env.DB as unknown as D1Database, {
    schema,
  });
};
