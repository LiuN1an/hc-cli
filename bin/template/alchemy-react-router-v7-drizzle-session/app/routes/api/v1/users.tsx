/**
 * 用户 API 路由
 * 
 * 此路由展示了正确的 Routes vs Features 职责分离模式：
 * - Route 只负责处理 HTTP 请求/响应
 * - 业务逻辑委托给 feature 的 handlers
 * - 使用 Response.json() 返回标准化响应
 */
import type { Route } from "./+types/users";
import { EnvContext } from "~/context";
import {
  handleGetUsers,
  handleCreateUser,
  handleUpdateUser,
  handleDeleteUser,
} from "~/features/user/api/handlers";
import type { CreateUserInput, UpdateUserInput } from "~/features/user/database/types";

/**
 * GET /api/v1/users - 获取所有用户
 */
export async function loader({ context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);
  
  const result = await handleGetUsers(db);
  
  return Response.json(result, {
    status: result.success ? 200 : 500,
  });
}

/**
 * POST/PUT/DELETE /api/v1/users - 用户操作
 */
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  const method = request.method;
  
  // POST - 创建用户
  if (method === "POST") {
    const data = (await request.json()) as CreateUserInput;
    const result = await handleCreateUser(db, data);
    
    return Response.json(result, {
      status: result.success ? 201 : 400,
    });
  }
  
  // PUT - 更新用户
  if (method === "PUT") {
    const data = (await request.json()) as UpdateUserInput;
    const result = await handleUpdateUser(db, data);
    
    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  }
  
  // DELETE - 删除用户
  if (method === "DELETE") {
    const data = (await request.json()) as { id: string };
    const result = await handleDeleteUser(db, data.id);
    
    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  }
  
  // 不支持的方法
  return Response.json(
    {
      success: false,
      error: "HTTP 方法不支持",
      code: "METHOD_NOT_ALLOWED",
    },
    { status: 405 }
  );
}
