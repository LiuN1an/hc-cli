/**
 * 首页
 * 
 * 服务端组件 (Server Component):
 * - 默认情况下，app 目录下的组件都是服务端组件
 * - 可以直接使用 async/await
 * - 使用 getTranslations 获取翻译
 * 
 * 客户端组件:
 * - 需要添加 "use client" 指令
 * - 用于需要交互的组件
 */

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/request";
import { Button } from "@/components/ui/button";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-20">
        <h1 className="text-4xl md:text-6xl font-bold">
          <span className="gradient-text">{t("title")}</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("subtitle")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/demo">{t("getStarted")}</Link>
          </Button>
          <Button variant="outline" size="lg">
            {t("learnMore")}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t("features.title")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            title="🌍 i18n"
            description={t("features.i18n")}
          />
          <FeatureCard
            title="📝 Form"
            description={t("features.form")}
          />
          <FeatureCard
            title="🎨 UI"
            description={t("features.ui")}
          />
          <FeatureCard
            title="🔔 Toast"
            description={t("features.toast")}
          />
          <FeatureCard
            title="🔗 Query State"
            description={t("features.queryState")}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

