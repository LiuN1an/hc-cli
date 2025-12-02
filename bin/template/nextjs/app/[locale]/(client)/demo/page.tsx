/**
 * Demo 页面
 * 
 * 展示以下技术的综合使用:
 * 1. react-hook-form + zod - 表单验证
 * 2. sonner - Toast 通知
 * 3. nuqs - URL 状态管理
 * 4. usehooks-ts - 实用 Hooks
 * 5. shadcn/ui - UI 组件
 */

import { getTranslations } from "next-intl/server";
import { DemoForm } from "./demo-form";

interface DemoPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "demo" });

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <DemoForm />
    </div>
  );
}

