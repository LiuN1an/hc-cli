import React from "react";
import type { Route } from "./+types/auth-demo";
import { UserProfile } from "~/components/UserProfile";
import { AuthStatus } from "~/components/AuthStatus";

export default function AuthDemo() {
  // 在实际使用中，这个页面需要通过middleware获取用户信息
  // 这里我们假设这是一个公开页面，用户信息为null
  const user = null;
  const isAuthenticated = user !== null;

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">SSR Session Authentication Demo</h1>
        
        <div className="space-y-8">
          {isAuthenticated ? (
            <UserProfile user={user} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">未登录</h2>
              <p className="text-gray-700 mb-4">
                您当前未登录。请访问登录页面进行身份验证。
              </p>
              <div className="space-x-4">
                <a 
                  href="/signin" 
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  登录
                </a>
                <a 
                  href="/signup" 
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  注册
                </a>
              </div>
            </div>
          )}
          
          {/* 认证状态展示 */}
          <AuthStatus user={user} />
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">SSR认证架构说明</h2>
            <div className="space-y-2 text-gray-700">
              <p>• 认证由服务端middleware处理，不需要客户端状态管理</p>
              <p>• Session数据存储在Cloudflare KV中，使用HttpOnly Cookie</p>
              <p>• 用户信息通过React Context在服务端设置并传递给客户端</p>
              <p>• 受保护的页面自动重定向未认证用户</p>
              <p>• 无需客户端token管理或localStorage操作</p>
              <p>• Session过期时间可通过环境变量配置</p>
              <p>• 过期的session会自动从KV中清理</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">API端点</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>POST /signin</strong> - 用户登录（React Router action）</p>
              <p><strong>POST /signup</strong> - 用户注册（React Router action）</p>
              <p><strong>POST /api/v1/logout</strong> - 用户登出</p>
              <p><strong>GET /users</strong> - 用户管理页面（需要认证）</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}