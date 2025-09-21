/**
 * Session存储管理工具
 * 现在基于HttpOnly Cookie，不再需要localStorage操作
 * 保留接口以保持向后兼容性
 */

/**
 * @deprecated 已迁移到Cookie-based session，不再需要localStorage
 */
export const tokenStorage = {
  /**
   * @deprecated Session现在使用HttpOnly Cookie自动管理
   */
  set(token: string): void {
    console.warn('tokenStorage.set() 已弃用：Session现在使用HttpOnly Cookie自动管理');
  },

  /**
   * @deprecated Session现在使用HttpOnly Cookie，无法从客户端访问
   */
  get(): string | null {
    console.warn('tokenStorage.get() 已弃用：Session现在使用HttpOnly Cookie，无法从客户端访问');
    return null;
  },

  /**
   * @deprecated 使用API调用/api/v1/logout来登出
   */
  remove(): void {
    console.warn('tokenStorage.remove() 已弃用：请使用API调用/api/v1/logout来登出');
  },

  /**
   * @deprecated Session状态现在通过服务端验证，客户端无法直接检查
   */
  exists(): boolean {
    console.warn('tokenStorage.exists() 已弃用：Session状态现在通过服务端验证，请使用useAuth hook');
    return false;
  }
};

/**
 * @deprecated JWT已替换为Cookie-based session
 */
export function parseJWTPayload(token: string): any {
  console.warn('parseJWTPayload() 已弃用：JWT已替换为Cookie-based session');
  return null;
}

/**
 * @deprecated JWT已替换为Cookie-based session
 */
export function isTokenExpired(token: string): boolean {
  console.warn('isTokenExpired() 已弃用：Session状态现在通过服务端验证');
  return true;
}

/**
 * 新的session管理说明：
 * 
 * 1. Session现在使用HttpOnly Cookie存储，更加安全
 * 2. 客户端无法直接访问session数据
 * 3. 使用useAuth hook获取用户状态
 * 4. 登录后自动设置Cookie
 * 5. 登出时调用/api/v1/logout API清理session
 * 6. Session过期时自动重定向到登录页
 */