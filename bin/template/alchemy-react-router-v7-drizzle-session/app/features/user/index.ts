/**
 * User Feature Module
 * 
 * 这是一个完整的 feature 模块示例，展示了模块化开发的标准结构：
 * - database/ - 数据库 schema 和类型定义
 * - server/   - 服务端工具函数（仅服务端使用）
 * - api/      - API 业务逻辑处理（仅服务端使用）
 * - hooks/    - React Query hooks（客户端使用）
 * - components/ - UI 组件（客户端使用，如果有的话）
 */

// ============================================
// 数据库相关导出（schema 仅服务端，types 通用）
// ============================================
export { users, usersRelations, insertUserSchema, selectUserSchema } from "./database/schema";

export type {
  User,
  PublicUser,
  CreateUserInput,
  UpdateUserInput,
  UserPermission,
} from "./database/types";

// ============================================
// 服务端工具导出（⚠️ 仅服务端使用）
// ============================================
export {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getPublicUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  checkEmailExists,
  getUserPermission,
  type DatabaseType,
} from "./server/utils";

// ============================================
// API 处理函数导出（⚠️ 仅服务端使用）
// ============================================
export {
  handleGetUsers,
  handleGetUser,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
  handleGetUserPermission,
  handleUserLogin,
} from "./api/handlers";

// ============================================
// 客户端 Hooks 导出（✅ 客户端使用）
// ============================================
export {
  userKeys,
  useUsers,
  useUser,
  useUserPermissionQuery,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "./hooks/use-users";

