/**
 * Demo 表单验证 Schema
 * 
 * 使用 Zod 定义表单验证规则
 * 
 * Zod 常用方法:
 * - z.string() - 字符串
 * - z.number() - 数字
 * - z.boolean() - 布尔值
 * - z.enum([]) - 枚举
 * - z.array() - 数组
 * - z.object() - 对象
 * 
 * 常用验证:
 * - .min(n) - 最小长度/值
 * - .max(n) - 最大长度/值
 * - .email() - 邮箱格式
 * - .optional() - 可选
 * - .refine() - 自定义验证
 */

import { z } from "zod";

// 角色选项
export const ROLE_OPTIONS = [
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "manager", label: "Manager" },
  { value: "other", label: "Other" },
] as const;

export type RoleValue = typeof ROLE_OPTIONS[number]["value"];

// 表单验证 Schema
export const demoFormSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
    })
    .min(2, "Name must be at least 2 characters"),
  
  email: z
    .string({
      required_error: "Email is required",
    })
    .email("Invalid email format"),
  
  role: z
    .string({
      required_error: "Please select a role",
    })
    .min(1, "Please select a role"),
  
  subscribe: z.boolean().optional().default(false),
});

// 从 Schema 推断类型
export type DemoFormData = z.infer<typeof demoFormSchema>;

// 表单默认值
export const demoFormDefaultValues: DemoFormData = {
  name: "",
  email: "",
  role: "",
  subscribe: false,
};

