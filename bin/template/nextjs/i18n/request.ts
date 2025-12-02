/**
 * i18n 请求配置和导航工具
 * 
 * 使用说明:
 * 1. LOCALE_PARTS 定义翻译文件的名称，对应 messages/{locale}/ 目录下的 JSON 文件
 * 2. 导出的 Link, redirect, usePathname, useRouter 用于替代 next/navigation 的同名方法
 * 3. localePrefix: "as-needed" 表示默认语言不显示前缀，其他语言显示
 */

import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "./config";
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

// 翻译文件名列表，按需添加
const LOCALE_PARTS = [
  "common",
  "home",
  "demo",
];

// 加载指定语言的所有翻译文件
const loadTranslations = async (locale: string) => {
  const modules = await Promise.all(
    LOCALE_PARTS.map((FILE) => import(`../messages/${locale}/${FILE}.json`))
  );
  return modules.reduce(
    (acc, module, index) => ({
      ...acc,
      [LOCALE_PARTS[index]]: module.default,
    }),
    {}
  );
};

// 路由配置
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "as-needed", // 默认语言不显示前缀
});

// 导出国际化导航工具 - 用于替代 next/navigation 的同名方法
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

// 导出请求配置
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  // 验证 locale 是否有效，无效则回退到默认语言
  // 这可以防止无效的路径（如 favicon.ico）被当作 locale 处理
  if (!locale || !locales.includes(locale as typeof locales[number])) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: await loadTranslations(locale),
  };
});

