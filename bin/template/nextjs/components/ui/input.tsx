/**
 * Input 组件
 * 
 * 基础输入框组件，使用 forwardRef 支持 ref 传递
 * 
 * @example
 * // 基础用法
 * <Input placeholder="Enter text" />
 * 
 * // 不同类型
 * <Input type="email" placeholder="Email" />
 * <Input type="password" placeholder="Password" />
 * 
 * // 与 react-hook-form 结合
 * <Input {...register("email")} />
 */

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "custom-input flex h-10 w-full px-3 py-2 placeholder-placeholder",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

