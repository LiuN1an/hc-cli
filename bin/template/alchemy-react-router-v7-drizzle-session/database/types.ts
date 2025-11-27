/**
 * 数据库类型统一导出
 *
 * 从各个 feature 模块中重新导出类型
 *
 * 使用方式：
 * - import type { User, PublicUser } from "@/types";
 */

// User feature types
export type {
  User,
  PublicUser,
  CreateUserInput,
  UpdateUserInput,
  UserPermission,
} from "~/features/user/database/types";

// Session types
import type { sessions } from "./schema";

export type Session = typeof sessions.$inferSelect;

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
  expiresAt: number;
}
