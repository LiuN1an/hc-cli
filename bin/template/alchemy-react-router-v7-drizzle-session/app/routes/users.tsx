import type { Route } from "./+types/users";
import { Form, useActionData, useNavigate } from "react-router";
import { users } from "@/schema";
import { eq } from "drizzle-orm";
import { useState } from "react";
import {
  useUsers,
  useUserPermissionQuery,
  useCreateUser,
} from "../hooks/use-users";
import { ApiError } from "../lib/api-client";
import { EnvContext, UserContext } from "~/context";
import { authMiddleware } from "~/middleware/auth";
import { logout } from "~/lib/auth-utils";
import { createUser } from "~/lib/db-utils";
import toast from "react-hot-toast";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "User Management - Multi-Vendor Platform" },
    { name: "description", content: "Manage platform users" },
  ];
}

export const middleware: Route.MiddlewareFunction[] = [
  authMiddleware as Route.MiddlewareFunction,
];

export async function loader({ context }: Route.LoaderArgs) {
  // middleware已经确保用户已认证，可以直接获取用户信息
  const user = context.get(UserContext);
  const { db } = context.get(EnvContext);
  
  // 获取所有用户
  const allUsers = await db.select().from(users);
  return { users: allUsers, currentUser: user };
}

export async function action({ request, context }: Route.ActionArgs) {
  // middleware已经确保用户已认证
  const { db } = context.get(EnvContext);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "user" | "admin";

    // 简单验证
    if (!email || !name || !password) {
      return {
        error: "All fields are required",
        success: false,
      };
    }

    // 检查邮箱是否已存在
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        error: "Email already registered",
        success: false,
      };
    }

    try {
      // 创建新用户
      await createUser(db, {
        email,
        name,
        password, // 注意：实际项目中应该对密码进行哈希处理
        role: role as 'admin' | 'user' || "user",
      });

      return {
        success: true,
        message: "User created successfully",
      };
    } catch (error) {
      return {
        error: "Failed to create user, please try again",
        success: false,
      };
    }
  }

  return { error: "Invalid operation" };
}

// 用户头部组件，包含当前用户信息和logout按钮
function UserHeader({ currentUser }: { currentUser: any }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      toast.success("Signing out...", {
        duration: 1000,
      });
      await logout(); // 这会自动重定向到登录页
    } catch (error) {
      console.error("注销失败:", error);
      toast.error("注销失败，请重试", {
        duration: 3000,
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-lg">
            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <h3 className="text-gray-100 font-semibold">{currentUser?.name}</h3>
          <p className="text-gray-400 text-sm">{currentUser?.email}</p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            currentUser?.role === "admin"
              ? "bg-red-900 text-red-200"
              : "bg-green-900 text-green-200"
          }`}>
            {currentUser?.role === "admin"
              ? "Administrator"
              : "User"}
          </span>
        </div>
      </div>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}

// API测试组件
function ApiTester() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const { queryPermissions } = useUserPermissionQuery();
  const [isLoading, setIsLoading] = useState(false);

  const testApi = async () => {
    if (!email) {
      alert("Please enter an email");
      return;
    }

    setIsLoading(true);
    try {
      const data = await queryPermissions(email);
      setResult({ status: 200, data: { success: true, data } });
    } catch (error) {
      if (error instanceof ApiError) {
        setResult({
          status: error.status,
          data: {
            success: false,
            error: error.message,
            code: error.code,
          },
        });
      } else {
        setResult({
          status: 0,
          data: {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-gray-100">
        API Test - User Permission Query
      </h2>
      <div className="mb-4">
        <p className="text-sm text-gray-300 mb-2">
          API Endpoint: 
          <code className="bg-gray-700 text-gray-200 px-2 py-1 rounded">
            GET /api/v1/user-permission?email=user@example.com
          </code>
        </p>
      </div>

      <div className="flex gap-4 items-end mb-4">
        <div className="flex-1">
          <label
            htmlFor="test-email"
            className="block text-sm font-medium text-gray-200 mb-1"
          >
            Test Email
          </label>
          <input
            type="email"
            id="test-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email to query"
            className="w-full px-3 py-2 bg-gray-700 text-gray-100 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>
        <button
          onClick={testApi}
          disabled={isLoading}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
        >
          {isLoading ? "Querying..." : "Test API"}
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-gray-200">API Response:</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 border border-gray-600 rounded-md text-sm overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function Users({ loaderData }: Route.ComponentProps) {
  const { users: initialUsers, currentUser } = loaderData;
  const actionData = useActionData<typeof action>();

  // 使用React Query获取用户数据，初始数据来自loader
  const {
    data: userList = initialUsers,
    isLoading,
    error,
    refetch,
  } = useUsers();

  const createUserMutation = useCreateUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-100">User Management</h1>
      
      {/* 用户信息和注销按钮 */}
      <UserHeader currentUser={currentUser} />

      {/* API测试区域 */}
      <ApiTester />

      {/* React Query错误状态 */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
          <p>
            Failed to load user data:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* 创建用户表单 */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>

        {actionData?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {actionData.error}
          </div>
        )}

        {actionData?.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {actionData.message}
          </div>
        )}

        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="create" />

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create User
          </button>
        </Form>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">User List</h2>

        {isLoading ? (
          <div className="p-6 text-gray-400 text-center">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
            Loading...
          </div>
        ) : userList.length === 0 ? (
          <div className="p-6 text-gray-400 text-center">No user data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role === "admin"
                          ? "Administrator"
                          : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleString("en-US")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
