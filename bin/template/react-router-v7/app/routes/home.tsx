import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { NavLink } from "react-router";
import {
  ArrowRight,
  Table2,
  FileText,
  Globe,
  Shield,
  Layers,
  Zap,
  Link2,
  Palette,
  Sparkles,
} from "lucide-react";

const features = [
  { icon: Layers, labelKey: "home.features.reactRouter" },
  { icon: Palette, labelKey: "home.features.tailwind" },
  { icon: Zap, labelKey: "home.features.shadcn" },
  { icon: Table2, labelKey: "home.features.tanstackTable" },
  { icon: FileText, labelKey: "home.features.reactHookForm" },
  { icon: Link2, labelKey: "home.features.nuqs" },
  { icon: Globe, labelKey: "home.features.i18n" },
  { icon: Shield, labelKey: "home.features.auth" },
];

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* 装饰元素 */}
      <div className="text-primary/60 text-3xl mb-4">✦</div>

      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl">
        {/* 手写体副标题 */}
        <p
          className="text-2xl text-primary/80"
          style={{ fontFamily: "Caveat, cursive" }}
        >
          Crafted with care & precision
        </p>

        {/* 主标题 - 使用衬线体 */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight leading-tight"
          style={{ fontFamily: "Playfair Display, serif" }}
        >
          {t("home.title")}
        </h1>

        {/* 装饰分隔线 */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
          <Sparkles className="h-4 w-4 text-primary/60" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
        </div>

        {/* 描述文字 */}
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
          {t("home.description")}
        </p>

        {/* 按钮组 */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          <NavLink to="/table">
            <Button
              size="lg"
              className="rounded-sm px-8 shadow-md hover:shadow-lg transition-shadow"
            >
              <Table2 className="mr-2 h-4 w-4" />
              {t("nav.table")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </NavLink>
          <NavLink to="/form">
            <Button
              variant="outline"
              size="lg"
              className="rounded-sm px-8 border-2"
            >
              <FileText className="mr-2 h-4 w-4" />
              {t("nav.form")}
            </Button>
          </NavLink>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-4xl mt-20">
        {/* Section 标题 */}
        <div className="text-center mb-8">
          <p
            className="text-xl text-primary/70 mb-2"
            style={{ fontFamily: "Caveat, cursive" }}
          >
            Everything you need
          </p>
          <h2
            className="text-3xl font-medium"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            {t("home.features.title")}
          </h2>
        </div>

        <Card className="border-2 rounded-sm shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardDescription className="text-base">
              This template includes everything you need to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 rounded-sm border border-border/60 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-accent/30 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium leading-tight">
                    {t(feature.labelKey)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 底部装饰 */}
      <div className="mt-16 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground/60">
          <div className="h-px w-8 bg-current" />
          <span style={{ fontFamily: "Caveat, cursive" }} className="text-lg">
            Made with ♥
          </span>
          <div className="h-px w-8 bg-current" />
        </div>
      </div>
    </div>
  );
}
