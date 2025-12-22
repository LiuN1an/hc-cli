import { Link, Outlet, NavLink, useNavigation } from "react-router";
import { useEffect } from "react";
import NProgress from "nprogress";
import { useTranslation } from "react-i18next";
import {
  FileText,
  Home,
  Languages,
  LayoutDashboard,
  Shield,
  Table2,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";

const navLinks = [
  { to: "/", icon: Home, labelKey: "nav.home" },
  { to: "/table", icon: Table2, labelKey: "nav.table" },
  { to: "/form", icon: FileText, labelKey: "nav.form" },
  { to: "/protected", icon: Shield, labelKey: "nav.protected" },
  { to: "/admin", icon: LayoutDashboard, labelKey: "nav.admin" },
];

export default function Layout() {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });
  }, []);

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
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto flex h-16 items-center gap-4 px-4">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2 group">
              <span className="text-xl text-primary/80">✦</span>
              <span className="text-lg font-semibold tracking-wide group-hover:text-primary transition-colors">
                Alchemy
              </span>
            </NavLink>

            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
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

          <div className="ml-auto flex items-center gap-3">
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-[120px]">
                <Languages className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder={t("language.label")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("language.en")}</SelectItem>
                <SelectItem value="zh">{t("language.zh")}</SelectItem>
              </SelectContent>
            </Select>

            <div className="hidden sm:flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/signin">{t("nav.signin")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">{t("nav.signup")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
