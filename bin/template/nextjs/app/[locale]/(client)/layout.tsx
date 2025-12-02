/**
 * Client 路由组布局
 * 
 * Route Group 说明:
 * - (client) 是路由组，括号内的名称不会出现在 URL 中
 * - 用于组织具有相同布局的页面
 * - 此布局包含 Header, Footer 和 Toast Provider
 * 
 * NuqsAdapter 说明:
 * - 用于 nuqs 库的 URL 状态管理
 * - 必须包裹使用 useQueryState 的页面
 */

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/providers/toast-provider";
import { NuqsAdapter } from 'nuqs/adapters/next/app';

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <ToastProvider />
      </div>
    </NuqsAdapter>
  );
}

