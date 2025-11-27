import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

/**
 * 用户表定义
 * 使用 text 类型的 UUID 作为主键，确保分布式环境下的唯一性
 */
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "user"] })
    .notNull()
    .default("user"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

/**
 * 用户关系定义
 * 预留扩展，如用户与订单、用户与文章的关联
 */
export const usersRelations = relations(users, ({ many }) => ({
  // 示例：用户可以有多个订单
  // orders: many(orders),
}));

// Zod Schema - 用于表单验证
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

