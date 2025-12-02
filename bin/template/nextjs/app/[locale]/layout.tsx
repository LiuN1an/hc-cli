/**
 * 根布局文件
 * 
 * Next.js App Router 的布局约定:
 * - app/[locale]/layout.tsx - 根布局，包含 html 和 body 标签
 * - 嵌套布局通过 route group 实现，如 (client) 和 (admin)
 * 
 * i18n 配置:
 * - 使用 NextIntlClientProvider 包裹客户端组件
 * - 服务端组件使用 getTranslations 获取翻译
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js Template",
  description: "A modern Next.js template with best practices",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

