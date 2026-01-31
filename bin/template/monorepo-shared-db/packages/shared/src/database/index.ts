/**
 * Database Schema - Shared across all packages
 *
 * All packages in the monorepo share this single D1 database.
 * Schema changes should be made here, then migrations generated in packages/web.
 */

// ============================================================================
// User Schema
// ============================================================================

export {
  users,
  usersRelations,
  insertUserSchema,
  selectUserSchema,
  USER_ROLES,
  USER_STATUSES,
  type User,
  type NewUser,
  type UserRole,
  type UserStatus,
} from "./user/schema";

// ============================================================================
// Session Schema
// ============================================================================

export { sessions } from "./session/schema";

// ============================================================================
// Example: Add more schema exports here as your app grows
// ============================================================================
// export { posts, postsRelations } from "./post/schema";
// export { comments, commentsRelations } from "./comment/schema";
