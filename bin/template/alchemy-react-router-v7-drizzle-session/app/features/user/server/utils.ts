import type { DrizzleD1Database } from "drizzle-orm/d1";
import { eq, like, sql } from "drizzle-orm";
import * as schema from "@/schema";
import { users } from "../database/schema";
import type {
  PublicUser,
  CreateUserInput,
  UpdateUserInput,
} from "../database/types";
import { hashPassword } from "~/lib/crypto";

export type DatabaseType = DrizzleD1Database<typeof schema>;

/**
 * 用户字段选择器 - 排除敏感字段
 */
const publicUserFields = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

/**
 * 获取所有用户（公开信息）
 */
export async function getAllUsers(db: DatabaseType): Promise<PublicUser[]> {
  const result = await db.select(publicUserFields).from(users);
  return result as PublicUser[];
}

/**
 * 根据ID获取用户
 */
export async function getUserById(
  db: DatabaseType,
  id: string
): Promise<PublicUser | null> {
  const result = await db
    .select(publicUserFields)
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return (result[0] as PublicUser) || null;
}

/**
 * 根据邮箱获取用户（包含密码，用于登录验证）
 */
export async function getUserByEmail(
  db: DatabaseType,
  email: string
): Promise<(PublicUser & { password: string }) | null> {
  const result = await db
    .select({
      ...publicUserFields,
      password: users.password,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
}

/**
 * 根据邮箱获取用户（公开信息）
 */
export async function getPublicUserByEmail(
  db: DatabaseType,
  email: string
): Promise<PublicUser | null> {
  const result = await db
    .select(publicUserFields)
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return (result[0] as PublicUser) || null;
}

/**
 * 创建用户
 */
export async function createUser(
  db: DatabaseType,
  input: CreateUserInput
): Promise<PublicUser> {
  const hashedPassword = await hashPassword(input.password);

  const result = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      password: hashedPassword,
      role: input.role || "user",
    })
    .returning(publicUserFields);

  return result[0] as PublicUser;
}

/**
 * 更新用户
 */
export async function updateUser(
  db: DatabaseType,
  input: UpdateUserInput
): Promise<PublicUser | null> {
  const updateData: Partial<typeof users.$inferInsert> = {
    updatedAt: sql`CURRENT_TIMESTAMP`,
  };

  if (input.email) updateData.email = input.email;
  if (input.name) updateData.name = input.name;
  if (input.role) updateData.role = input.role;
  if (input.password) {
    updateData.password = await hashPassword(input.password);
  }

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, input.id))
    .returning(publicUserFields);

  return (result[0] as PublicUser) || null;
}

/**
 * 删除用户
 */
export async function deleteUser(
  db: DatabaseType,
  id: string
): Promise<boolean> {
  const result = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  return result.length > 0;
}

/**
 * 检查邮箱是否已存在
 */
export async function checkEmailExists(
  db: DatabaseType,
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  let query = db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  const result = await query.limit(1);

  if (result.length === 0) return false;
  if (excludeUserId && result[0].id === excludeUserId) return false;

  return true;
}

/**
 * 获取用户权限信息
 */
export async function getUserPermission(
  db: DatabaseType,
  email: string
): Promise<{
  user: PublicUser;
  permissions: string[];
  roleDescription: string;
} | null> {
  const user = await getPublicUserByEmail(db, email);
  if (!user) return null;

  // 根据角色返回权限
  const rolePermissions: Record<string, string[]> = {
    admin: ["read", "write", "delete", "manage_users", "manage_settings"],
    user: ["read", "write"],
  };

  const roleDescriptions: Record<string, string> = {
    admin: "管理员 - 拥有完全访问权限",
    user: "普通用户 - 可以查看和编辑自己的内容",
  };

  return {
    user,
    permissions: rolePermissions[user.role] || [],
    roleDescription: roleDescriptions[user.role] || "未知角色",
  };
}

