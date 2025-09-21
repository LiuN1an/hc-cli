import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "~/lib/api-client";
import type { User } from "@/types";

// 用户数据类型
export interface UserPermission {
  user: User;
  permissions: string[];
  role_description: string;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: "user" | "admin";
}

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  permissions: () => [...userKeys.all, "permissions"] as const,
  permission: (email: string) => [...userKeys.permissions(), email] as const,
};

// 获取所有用户
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => apiGet<User[]>("users"),
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}

// 获取用户权限
export function useUserPermissions(email: string) {
  return useQuery({
    queryKey: userKeys.permission(email),
    queryFn: () => {
      const params = new URLSearchParams({ email });
      return apiGet<UserPermission>(`user-permission?${params.toString()}`);
    },
    enabled: !!email && email.includes("@"), // 只有当email有效时才执行查询
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

// 创建用户
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserData) => apiPost<User>("users", userData),
    onSuccess: () => {
      // 创建成功后刷新用户列表
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });
}

// 手动触发权限查询的hook
export function useUserPermissionQuery() {
  const queryClient = useQueryClient();

  const queryPermissions = async (email: string) => {
    if (!email || !email.includes("@")) {
      throw new Error("Please enter a valid email address");
    }

    return queryClient.fetchQuery({
      queryKey: userKeys.permission(email),
      queryFn: () => {
        const params = new URLSearchParams({ email });
        return apiGet<UserPermission>(`user-permission?${params.toString()}`);
      },
      staleTime: 0, // 每次都重新获取
    });
  };

  return { queryPermissions };
}
