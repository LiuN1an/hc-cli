import { tokenStorage, isTokenExpired } from './token-storage';

// API客户端 - 统一处理API请求
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * 获取认证headers
 */
function getAuthHeaders(): Record<string, string> {
  const token = tokenStorage.get();
  
  if (!token) {
    return {};
  }

  // 检查token是否过期
  if (isTokenExpired(token)) {
    // token过期，清除存储
    tokenStorage.remove();
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`
  };
}

// 通用API请求函数
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api/v1/${endpoint}`;
  
  // 合并认证headers
  const authHeaders = getAuthHeaders();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      // 如果是401错误，可能是token过期或无效
      if (response.status === 401) {
        tokenStorage.remove(); // 清除无效token
      }
      
      throw new ApiError(
        response.status,
        data.code || 'UNKNOWN_ERROR',
        data.error || 'Request failed'
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 网络错误或其他错误
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network connection failed'
    );
  }
}

// GET请求
export function apiGet<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

// POST请求
export function apiPost<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT请求
export function apiPut<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE请求
export function apiDelete<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}
