/// <reference types="@types/node" />

import alchemy from "alchemy";
import { ReactRouter, D1Database, KVNamespace } from "alchemy/cloudflare";

const app = await alchemy("dmdm-new");
const db = await D1Database("dmdm-new-db", {
  migrationsDir: "./drizzle/migrations",
});
const sessionKV = await KVNamespace("dmdm-session-kv", {
  title: "dmdm-session-kv",
});

export const worker = await ReactRouter("website", {
  bindings: {
    DB: db,
    SESSION_KV: sessionKV,
    SESSION_EXPIRY: process.env.SESSION_EXPIRY || "604800", // 默认7天(604800秒)

    VALUE_FROM_CLOUDFLARE: alchemy.secret(process.env.ALCHEMY_PASSWORD),
  },
});

console.log({
  url: worker.url,
});

await app.finalize();
