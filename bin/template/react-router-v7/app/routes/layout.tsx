import { Outlet, NavLink, useNavigation } from "react-router";
import { useEffect } from "react";
import NProgress from "nprogress";
import { useTranslation } from "react-i18next";
import { Home, Table2, FileText, Lock, Languages } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ThemeToggle } from "~/components/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

// 导航链接配置
const navLinks = [
  { to: "/", icon: Home, labelKey: "nav.home" },
  { to: "/table", icon: Table2, labelKey: "nav.table" },
  { to: "/form", icon: FileText, labelKey: "nav.form" },
  { to: "/protected", icon: Lock, labelKey: "nav.protected" },
];

export default function Layout() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  // NProgress 页面跳转进度条
  useEffect(() => {
    if (navigation.state === "loading") {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [navigation.state]);

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - 复古风格 */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="mr-4 flex">
            {/* Logo - 手写体风格 */}
            <NavLink to="/" className="mr-8 flex items-center space-x-2 group">
              <span className="text-2xl text-primary/80">✦</span>
              <span
                className="text-xl font-medium tracking-wide group-hover:text-primary transition-colors"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Template
              </span>
            </NavLink>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )
                  }
                  end={link.to === "/"}
                >
                  <link.icon className="h-4 w-4" />
                  <span>{t(link.labelKey)}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* 语言切换器 - 精致风格 */}
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[130px] rounded-sm border-2">
                <Languages className="mr-2 h-4 w-4 text-primary/70" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-sm">
                <SelectItem value="en" className="rounded-sm">
                  {t("language.en")}
                </SelectItem>
                <SelectItem value="zh" className="rounded-sm">
                  {t("language.zh")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <Outlet />
      </main>

      {/* Footer - 复古风格 */}
      <footer className="border-t-2 border-border/60 py-8 mt-auto">
        <div className="container mx-auto text-center px-4">
          <p
            className="text-muted-foreground/70 text-sm"
            style={{ fontFamily: "Caveat, cursive" }}
          >
            Crafted with elegance · React Router v7 Template
          </p>
        </div>
      </footer>
    </div>
  );
}
