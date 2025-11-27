import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "~/lib/api-client";
import type {
  PublicUser,
  CreateUserInput,
  UpdateUserInput,
  UserPermission,
} from "../database/types";

// Query Keys - 分层组织，便于精确失效
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  permissions: () => [...userKeys.all, "permissions"] as const,
  permission: (email: string) => [...userKeys.permissions(), email] as const,
};

/**
 * 获取所有用户
 */
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => apiGet<PublicUser[]>("users"),
    staleTime: 2 * 60 * 1000, // 2分钟
  });
}

/**
 * 根据ID获取用户
 */
export function useUser(id?: string) {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => apiGet<PublicUser>(`users/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分钟
  });
}

/**
 * 获取用户权限（手动触发）
 */
export function useUserPermissionQuery() {
  const queryClient = useQueryClient();

  const queryPermissions = async (email: string) => {
    if (!email || !email.includes("@")) {
      throw new Error("请输入有效的邮箱地址");
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

/**
 * 创建用户
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => apiPost<PublicUser>("users", input),
    onSuccess: (newUser) => {
      // 刷新列表缓存
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      // 直接设置详情缓存
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
    },
  });
}

/**
 * 更新用户
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateUserInput) =>
      apiPut<PublicUser>(`users/${id}`, data),
    onSuccess: (updatedUser, variables) => {
      // 更新详情缓存
      queryClient.setQueryData(userKeys.detail(variables.id), updatedUser);

      // 刷新列表缓存
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * 删除用户
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiDelete(`users/${id}`),
    onSuccess: (_, deletedId) => {
      // 移除详情缓存
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });

      // 刷新列表缓存
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

