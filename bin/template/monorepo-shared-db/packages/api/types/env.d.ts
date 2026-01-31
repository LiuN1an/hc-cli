/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
  AUTH_TOKEN_KEY: string;
  AUTH_TOKEN_VALUE: string;
}
