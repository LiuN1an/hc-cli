import React from "react";
import { logout } from "~/lib/auth-utils";
import type { PublicUser } from "@/types";

export function UserProfile({ user }: { user?: PublicUser | null }) {

  const handleLogout = async () => {
    await logout();
  };

  if (!user) {
    return (
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
        <p className="text-gray-600">User not signed in</p>
        <a href="/signin" className="text-blue-600 hover:underline">
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            user.role === "admin"
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}>
            {user.role === "admin" ? "Administrator" : "User"}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Sign out
        </button>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-500">
        <p>User ID: {user.id}</p>
        <p>Created: {new Date(user.createdAt).toLocaleString("en-US")}</p>
      </div>
    </div>
  );
}