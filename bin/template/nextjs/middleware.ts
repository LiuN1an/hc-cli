/**
 * Next.js Middleware
 * 
 * 中间件用于:
 * 1. 处理国际化路由 (next-intl)
 * 2. 路由鉴权 (如 admin 路由)
 * 
 * 鉴权方式说明:
 * - 通过请求头 (header) 进行鉴权，适合后台管理页面
 * - 也可以改用 cookie/session 方式鉴权
 * - 鉴权失败时重定向到 404 或登录页
 */

import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/request";
import { defaultLocale, locales, type Locale } from "./i18n/config";

// 创建 i18n 中间件
const handleI18nRouting = createMiddleware(routing);

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // ========== 排除静态资源请求 ==========
  // 静态资源不需要经过 i18n 处理
  if (
    pathname.includes('.') || // 包含扩展名的文件请求
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static')
  ) {
    return NextResponse.next();
  }

  // ========== Admin 路由鉴权 ==========
  // 检查是否是 admin 路由 (支持 /admin 和 /{locale}/admin)
  const adminRouteRegex = /^(\/([a-z]{2}))?\/admin/;
  const adminMatch = pathname.match(adminRouteRegex);
  
  if (adminMatch) {
    // 方式1: 通过 header 鉴权
    const authHeader = req.headers.get("auth_admin");
    
    // 验证 header 中的 auth_admin 值是否与环境变量匹配
    if (authHeader !== process.env.ADMIN_AUTH_TOKEN) {
      // 鉴权失败，重定向到 404 页面
      // 从 URL 中提取 locale，如果没有则使用默认 locale
      const urlLocale = adminMatch[2] as Locale | undefined;
      const locale = urlLocale && locales.includes(urlLocale) ? urlLocale : defaultLocale;
      
      // 重定向到一个不存在的路径，触发 not-found.tsx
      const notFoundUrl = new URL(`/${locale}/404`, req.url);
      return NextResponse.redirect(notFoundUrl);
    }
    
    // 方式2: 通过 cookie 鉴权 (可选)
    // const authCookie = req.cookies.get("admin_token")?.value;
    // if (authCookie !== process.env.ADMIN_AUTH_TOKEN) {
    //   return NextResponse.redirect(new URL('/login', req.url));
    // }
  }

  // 处理 i18n 路由
  return handleI18nRouting(req);
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有路径，排除静态资源和 API
    // 注意：这里排除了常见的静态资源路径，静态文件由 middleware 函数内部额外检查
    "/((?!api|_next/static|_next/image|_vercel|favicon.ico|.*\\..*).*)",
  ],
};

