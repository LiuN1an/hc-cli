import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api-client';
import { tokenStorage } from './token-storage';

/**
 * React Query的全局配置
 * 处理认证相关的错误和重试逻辑
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 数据的缓存时间（5分钟）
        staleTime: 5 * 60 * 1000,
        // 默认重试3次
        retry: (failureCount, error) => {
          // 如果是认证错误（401），不要重试
          if (error instanceof ApiError && error.status === 401) {
            return false;
          }
          // 其他错误重试3次
          return failureCount < 3;
        },
        // 错误处理
        throwOnError: (error) => {
          // 如果是认证错误，可以在这里处理自动登出
          if (error instanceof ApiError && error.status === 401) {
            // 清除无效token
            tokenStorage.remove();
            // 可以在这里触发重定向到登录页面
            // 或者发出全局事件
            console.warn('Authentication expired, please login again');
            return true; // 继续抛出错误
          }
          return true;
        },
      },
      mutations: {
        // mutation失败时的重试配置
        retry: (failureCount, error) => {
          // 认证错误不重试
          if (error instanceof ApiError && error.status === 401) {
            return false;
          }
          // 其他错误重试1次
          return failureCount < 1;
        },
      },
    },
  });
}

/**
 * 全局错误处理函数
 * 可以用于React Query的全局错误处理
 */
export function handleGlobalError(error: Error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        console.warn('Authentication expired:', error.message);
        tokenStorage.remove();
        // 可以在这里触发全局状态更新或路由跳转
        break;
      case 403:
        console.error('Permission denied:', error.message);
        break;
      case 404:
        console.error('Resource not found:', error.message);
        break;
      case 500:
        console.error('Server error:', error.message);
        break;
      default:
        console.error('API error:', error.message);
    }
  } else {
    console.error('Unknown error:', error.message);
  }
}
