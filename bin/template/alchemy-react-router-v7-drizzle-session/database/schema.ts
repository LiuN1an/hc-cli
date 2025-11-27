/**
 * 数据库 Schema 统一导出
 *
 * 从各个 feature 模块中重新导出 schema，保持统一入口
 *
 * 使用方式：
 * - import * as schema from "@/schema";
 * - import { users } from "@/schema";
 */

// User feature
export {
  users,
  usersRelations,
  insertUserSchema,
  selectUserSchema,
} from "~/features/user/database/schema";

// Session 表（系统核心）
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  data: text("data").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
