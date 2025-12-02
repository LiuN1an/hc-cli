/**
 * Toast Provider
 * 
 * 使用 sonner 提供全局 Toast 通知功能
 * 在 layout 中引入此组件，然后在任意位置使用 toast() 函数显示通知
 * 
 * @example
 * // 在 layout 中引入
 * <ToastProvider />
 * 
 * // 在组件中使用
 * import { toast } from "sonner";
 * toast.success("Success!");
 * toast.error("Error!");
 * toast.info("Info");
 * toast.warning("Warning");
 */

"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster 
      position="top-right"
      richColors
      closeButton
    />
  );
}

