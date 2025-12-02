/**
 * Header 组件
 * 
 * 全局导航头部组件，包含:
 * - Logo
 * - 导航链接
 * - 语言切换器
 * 
 * 使用 i18n/request 导出的 Link 和 useRouter 实现国际化导航
 */

"use client";

import { Link, useRouter, usePathname } from "@/i18n/request";
import { useLocale, useTranslations } from "next-intl";
import Logo from "@/svgs/logo";
import { cn } from "@/lib/utils";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 判断当前路径是否激活
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  // 切换语言
  const switchLanguage = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  // 导航链接配置
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/demo", label: "Demo" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/80 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Language Switcher */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => switchLanguage(locale === "en" ? "zh" : "en")}
          >
            <Globe className="w-4 h-4" />
            {locale === "en" ? "EN" : "中"}
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive(link.href) ? "text-primary" : "text-muted-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-fit gap-2"
              onClick={() => switchLanguage(locale === "en" ? "zh" : "en")}
            >
              <Globe className="w-4 h-4" />
              {locale === "en" ? "English" : "中文"}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

