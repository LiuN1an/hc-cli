import { eq } from "drizzle-orm";
import { users } from "@/schema";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import type { User } from "@/types";
import * as schema from "@/schema";

export type DatabaseType = DrizzleD1Database<typeof schema>;

/**
 * 根据ID查找用户
 */
export async function getUserById(db: DatabaseType, id: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const user = result[0];
  // 返回不包含密码的用户信息
  const { password, ...publicUser } = user;
  return publicUser as User;
}

/**
 * 根据邮箱查找用户（包含密码，用于登录验证）
 */
export async function getUserByEmailWithPassword(db: DatabaseType, email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
}

/**
 * 根据邮箱查找用户（不包含密码）
 */
export async function getUserByEmail(db: DatabaseType, email: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0) return null;

  const user = result[0];
  // 返回不包含密码的用户信息
  const { password, ...publicUser } = user;
  return publicUser as User;
}

/**
 * 创建用户数据类型
 */
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: 'user' | 'admin';
}

/**
 * 创建新用户
 */
export async function createUser(db: DatabaseType, userData: CreateUserData): Promise<User> {
  const result = await db
    .insert(users)
    .values({
      email: userData.email,
      name: userData.name,
      password: userData.password,
      role: userData.role || 'user', // 修正默认角色为'user'，与schema一致
    })
    .returning();

  if (result.length === 0) {
    throw new Error("Failed to create user");
  }

  const user = result[0];
  // 返回不包含密码的用户信息
  const { password, ...publicUser } = user;
  return publicUser as User;
}

/**
 * 检查邮箱是否已存在
 */
export async function checkEmailExists(db: DatabaseType, email: string): Promise<boolean> {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0;
}
