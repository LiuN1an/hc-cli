/// <reference types="@types/node" />

import "dotenv/config";
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
    AUTH_TOKEN_KEY: process.env.AUTH_TOKEN_KEY || "x-admin-token", // 管理员 Token 请求头 Key
    AUTH_TOKEN_VALUE: process.env.AUTH_TOKEN_VALUE || "change-me-in-production", // 管理员 Token 值
  },
});

console.log({
  url: worker.url,
});

await app.finalize();
