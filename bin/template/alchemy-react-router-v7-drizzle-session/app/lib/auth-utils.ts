/**
 * 简单的认证工具函数
 * 在SSR middleware架构下，这些是客户端需要的最小功能
 */

/**
 * 客户端登出函数
 * 调用API并重定向到登录页
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/v1/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('登出API调用失败:', error);
  } finally {
    // 无论API是否成功，都重定向到登录页
    window.location.href = '/signin';
  }
}
