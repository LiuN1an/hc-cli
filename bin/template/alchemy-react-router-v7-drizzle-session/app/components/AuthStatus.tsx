import React from "react";
import { useRouteLoaderData } from "react-router";
import { UserContext } from "~/context";
import type { PublicUser } from "@/types";

/**
 * 认证状态展示组件
 * 用于调试和展示当前的认证状态（SSR架构）
 */
export function AuthStatus({ user }: { user?: PublicUser | null }) {
  const isAuthenticated = user !== null;

  return (
    <div className="space-y-4">
      {/* 认证状态概览 */}
      <div className={`p-4 rounded-md border ${
        isAuthenticated 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <h3 className="font-medium text-lg mb-2">Authentication Status (SSR)</h3>
        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Status: </span>
            <span className={isAuthenticated ? 'text-green-700' : 'text-red-700'}>
              {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
            </span>
          </p>
          <p>
            <span className="font-medium">Session: </span>
            <span className="text-gray-600">
              {isAuthenticated ? 'Active (HttpOnly Cookie)' : 'No Active Session'}
            </span>
          </p>
          {user && (
            <>
              <p>
                <span className="font-medium">User: </span>
                <span className="text-gray-700">{user.email}</span>
              </p>
              <p>
                <span className="font-medium">Role: </span>
                <span className="text-gray-700">{user.role}</span>
              </p>
              <p>
                <span className="font-medium">User ID: </span>
                <span className="text-gray-700">{user.id}</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* SSR架构说明 */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <h4 className="font-medium text-base mb-2">SSR Authentication Architecture</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Authentication is handled server-side by middleware</li>
          <li>• Session data stored in Cloudflare KV with HttpOnly cookies</li>
          <li>• User information available through React Context</li>
          <li>• No client-side authentication state management needed</li>
          <li>• Automatic redirection for unauthorized access</li>
          <li>• Session expires automatically based on configured timeout</li>
        </ul>
      </div>

      {isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <h4 className="font-medium text-base mb-2">Current Session Info</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>• Session managed via secure HttpOnly cookie</p>
            <p>• Session validation happens on each server request</p>
            <p>• User data refreshed from database on each page load</p>
            <p>• No client-side token storage or management</p>
          </div>
        </div>
      )}
    </div>
  );
}