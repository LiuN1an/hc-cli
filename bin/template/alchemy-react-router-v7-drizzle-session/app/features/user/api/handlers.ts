import type { DatabaseType } from "../server/utils";
import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  checkEmailExists,
  getUserPermission,
} from "../server/utils";
import type { CreateUserInput, UpdateUserInput } from "../database/types";
import { verifyPassword } from "~/lib/crypto";

/**
 * 获取所有用户
 */
export async function handleGetUsers(db: DatabaseType) {
  try {
    const users = await getAllUsers(db);
    return {
      success: true,
      data: users,
    };
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return {
      success: false,
      error: "获取用户列表失败",
      code: "FETCH_USERS_FAILED",
    };
  }
}

/**
 * 根据ID获取用户
 */
export async function handleGetUser(db: DatabaseType, id: string) {
  try {
    const user = await getUserById(db, id);

    if (!user) {
      return {
        success: false,
        error: "用户不存在",
        code: "USER_NOT_FOUND",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("获取用户详情失败:", error);
    return {
      success: false,
      error: "获取用户详情失败",
      code: "FETCH_USER_FAILED",
    };
  }
}

/**
 * 创建用户
 */
export async function handleCreateUser(
  db: DatabaseType,
  input: CreateUserInput
) {
  try {
    // 验证必填字段
    if (!input.email || !input.email.trim()) {
      return {
        success: false,
        error: "邮箱不能为空",
        code: "MISSING_EMAIL",
      };
    }

    if (!input.name || !input.name.trim()) {
      return {
        success: false,
        error: "姓名不能为空",
        code: "MISSING_NAME",
      };
    }

    if (!input.password || input.password.length < 6) {
      return {
        success: false,
        error: "密码至少需要6个字符",
        code: "INVALID_PASSWORD",
      };
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      return {
        success: false,
        error: "邮箱格式不正确",
        code: "INVALID_EMAIL_FORMAT",
      };
    }

    // 检查邮箱是否已存在
    const emailExists = await checkEmailExists(db, input.email);
    if (emailExists) {
      return {
        success: false,
        error: "该邮箱已被注册",
        code: "EMAIL_EXISTS",
      };
    }

    const user = await createUser(db, input);

    return {
      success: true,
      data: user,
      message: "用户创建成功",
    };
  } catch (error) {
    console.error("创建用户失败:", error);
    return {
      success: false,
      error: "创建用户失败",
      code: "CREATE_USER_FAILED",
    };
  }
}

/**
 * 更新用户
 */
export async function handleUpdateUser(
  db: DatabaseType,
  input: UpdateUserInput
) {
  try {
    // 检查用户是否存在
    const existingUser = await getUserById(db, input.id);
    if (!existingUser) {
      return {
        success: false,
        error: "用户不存在",
        code: "USER_NOT_FOUND",
      };
    }

    // 如果更新邮箱，检查是否已被占用
    if (input.email && input.email !== existingUser.email) {
      const emailExists = await checkEmailExists(db, input.email, input.id);
      if (emailExists) {
        return {
          success: false,
          error: "该邮箱已被使用",
          code: "EMAIL_EXISTS",
        };
      }
    }

    const user = await updateUser(db, input);

    return {
      success: true,
      data: user,
      message: "用户更新成功",
    };
  } catch (error) {
    console.error("更新用户失败:", error);
    return {
      success: false,
      error: "更新用户失败",
      code: "UPDATE_USER_FAILED",
    };
  }
}

/**
 * 删除用户
 */
export async function handleDeleteUser(db: DatabaseType, id: string) {
  try {
    // 检查用户是否存在
    const existingUser = await getUserById(db, id);
    if (!existingUser) {
      return {
        success: false,
        error: "用户不存在",
        code: "USER_NOT_FOUND",
      };
    }

    const success = await deleteUser(db, id);

    if (success) {
      return {
        success: true,
        message: "用户删除成功",
      };
    } else {
      return {
        success: false,
        error: "删除用户失败",
        code: "DELETE_USER_FAILED",
      };
    }
  } catch (error) {
    console.error("删除用户失败:", error);
    return {
      success: false,
      error: "删除用户失败",
      code: "DELETE_USER_FAILED",
    };
  }
}

/**
 * 获取用户权限
 */
export async function handleGetUserPermission(db: DatabaseType, email: string) {
  try {
    if (!email || !email.trim()) {
      return {
        success: false,
        error: "邮箱不能为空",
        code: "MISSING_EMAIL",
      };
    }

    const permission = await getUserPermission(db, email);

    if (!permission) {
      return {
        success: false,
        error: "用户不存在",
        code: "USER_NOT_FOUND",
      };
    }

    return {
      success: true,
      data: permission,
    };
  } catch (error) {
    console.error("获取用户权限失败:", error);
    return {
      success: false,
      error: "获取用户权限失败",
      code: "FETCH_PERMISSION_FAILED",
    };
  }
}

/**
 * 用户登录验证
 */
export async function handleUserLogin(
  db: DatabaseType,
  email: string,
  password: string
) {
  try {
    if (!email || !password) {
      return {
        success: false,
        error: "邮箱和密码不能为空",
        code: "MISSING_CREDENTIALS",
      };
    }

    const user = await getUserByEmail(db, email);
    if (!user) {
      return {
        success: false,
        error: "邮箱或密码错误",
        code: "INVALID_CREDENTIALS",
      };
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "邮箱或密码错误",
        code: "INVALID_CREDENTIALS",
      };
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...publicUser } = user;

    return {
      success: true,
      data: publicUser,
      message: "登录成功",
    };
  } catch (error) {
    console.error("登录验证失败:", error);
    return {
      success: false,
      error: "登录失败，请稍后重试",
      code: "LOGIN_FAILED",
    };
  }
}

