/**
 * Auth Feature Module
 *
 * 认证模块 - 统一管理 session、登录、注册、登出等认证相关功能
 *
 * 目录结构：
 * - lib/        - 核心工具函数（session、crypto）
 * - api/        - API handlers（登录、注册、登出逻辑）
 * - middleware/ - 认证中间件
 */

// ============================================
// 核心工具导出
// ============================================
export {
  // Session 管理
  createSession,
  validateSession,
  validateSessionDetailed,
  destroySession,
  getSessionFromRequest,
  parseSessionFromRequest,
  createSessionHeaders,
  createLogoutHeaders,
  // 统一认证
  getAuthTokenFromRequest,
  authenticateRequest,
  type SessionData,
  type SessionValidationResult,
  type AuthResult,
} from "./lib/session";

// 密码加密从 lib 重新导出（方便使用）
export { hashPassword, verifyPassword } from "~/lib/crypto";

// ============================================
// API Handlers 导出（⚠️ 仅服务端使用）
// ============================================
export {
  handleLogin,
  handleSignup,
  handleLogout,
  handleValidateSession,
} from "./api/handlers";

// ============================================
// 中间件导出（⚠️ 仅服务端使用）
// ============================================
export { authMiddleware } from "./middleware/auth";

// ============================================
// 客户端工具导出
// ============================================
export { logout } from "./lib/client";

