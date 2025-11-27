import type { users } from "./schema";

/**
 * 用户基础类型 - 直接从 schema 推断
 */
export type User = typeof users.$inferSelect;

/**
 * 公开用户信息 - 不包含敏感字段（如密码）
 */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建用户输入
 */
export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role?: "admin" | "user";
}

/**
 * 更新用户输入
 */
export interface UpdateUserInput {
  id: string;
  email?: string;
  name?: string;
  password?: string;
  role?: "admin" | "user";
}

/**
 * 用户权限信息
 */
export interface UserPermission {
  user: PublicUser;
  permissions: string[];
  roleDescription: string;
}

