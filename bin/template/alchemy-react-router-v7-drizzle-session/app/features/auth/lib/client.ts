/**
 * 客户端认证工具
 */

/**
 * 客户端登出函数
 * 调用 API 并重定向到登录页
 */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/v1/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("登出 API 调用失败:", error);
  } finally {
    // 无论 API 是否成功，都重定向到登录页
    window.location.href = "/signin";
  }
}

