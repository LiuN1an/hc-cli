/**
 * i18n 配置文件
 * 
 * 使用说明:
 * 1. 在 locales 数组中添加或删除支持的语言
 * 2. 设置 defaultLocale 为默认语言
 * 3. 类型系统会自动推断 Locale 类型
 */

export type Locale = (typeof locales)[number];
export const locales = ["en"] as const;
export const defaultLocale: Locale = "en";

