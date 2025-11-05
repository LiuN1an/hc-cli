/// <reference types="@types/node" />

import alchemy from "alchemy";
import { ReactRouter, D1Database, KVNamespace } from "alchemy/cloudflare";

const app = await alchemy("web");
const db = await D1Database("web-db", {
  migrationsDir: "./drizzle/migrations",
});
const sessionKV = await KVNamespace("web-session-kv", {
  title: "web-session-kv",
});

export const worker = await ReactRouter("website", {
  bindings: {
    DB: db,
    SESSION_KV: sessionKV,
    SESSION_EXPIRY: process.env.SESSION_EXPIRY || "604800", // 默认7天(604800秒)
  },
});

console.log({
  url: worker.url,
});

await app.finalize();
