import { redirect, type MiddlewareFunction } from "react-router";
import { UserContext, EnvContext } from "~/context";
import { getSessionFromRequest, validateSessionDetailed } from "~/sessions.server";
import { getUserById } from "~/lib/db-utils";

export const authMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  const { db, sessionKV } = context.get(EnvContext);

  // 从请求中获取session ID
  const sessionId = getSessionFromRequest(request);

  if (!sessionId) {
    // 没有session cookie，直接重定向
    throw redirect("/signin");
  }

  // 验证session，使用增强版本获取详细结果
  const validationResult = await validateSessionDetailed(sessionKV as any, sessionId);
  
  if (!validationResult.isValid) {
    // 根据失败原因决定重定向URL，传递具体的失败原因
    const reason = validationResult.reason;
    if (reason === 'expired') {
      // Session过期，重定向时包含过期标识
      throw redirect("/signin?auth_error=expired");
    } else if (reason === 'not_found') {
      // Session不存在，重定向时包含标识
      throw redirect("/signin?auth_error=not_found");
    } else if (reason === 'invalid') {
      // Session无效，重定向时包含标识
      throw redirect("/signin?auth_error=invalid");
    } else {
      // 未知错误，正常重定向
      throw redirect("/signin");
    }
  }

  // 从数据库获取最新的用户信息
  const user = await getUserById(db, validationResult.sessionData!.userId);
  if (!user) {
    // 用户不存在，清除session
    await sessionKV.delete(sessionId);
    throw redirect("/signin");
  }

  // 将用户信息设置到context中
  context.set(UserContext, user);
};