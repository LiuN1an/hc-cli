import type { Route } from "./+types/home";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Database,
  FileText,
  Globe,
  KeyRound,
  Layers,
  Link2,
  Table2,
} from "lucide-react";

import { UserContext } from "~/context";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const features = [
  { icon: Layers, labelKey: "home.features.reactRouter" },
  { icon: Database, labelKey: "home.features.drizzle" },
  { icon: KeyRound, labelKey: "home.features.sessionAuth" },
  { icon: Table2, labelKey: "home.features.tanstackTable" },
  { icon: FileText, labelKey: "home.features.reactHookForm" },
  { icon: Link2, labelKey: "home.features.nuqs" },
  { icon: Globe, labelKey: "home.features.i18n" },
  { icon: Activity, labelKey: "home.features.reactQuery" },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Alchemy Template" },
    {
      name: "description",
      content: "Alchemy + React Router v7 + Drizzle + Session",
    },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  let user = null;
  try {
    user = context.get(UserContext);
  } catch (e) {
    // 用户未认证
  }

  return { user };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { user } = loaderData;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-border/70 bg-card/80 p-10 text-foreground shadow-[0_2px_0_rgba(30,30,30,0.08),0_12px_30px_rgba(30,30,30,0.08)]">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
            Alchemy Fullstack
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">
            {t("home.title")}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            {t("home.description")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/table">{t("nav.table")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/form">{t("nav.form")}</Link>
            </Button>
          </div>

          {user ? (
            <div className="rounded-2xl border border-border/70 bg-accent/40 p-5">
              <p className="text-foreground">
                {t("home.welcome", { name: user.name })}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/admin">{t("home.adminCta")}</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/api/v1/users">{t("home.usersApiCta")}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/signin">{t("home.signinCta")}</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/signup">{t("home.signupCta")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">{t("home.features.title")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("home.description")}
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("home.features.title")}</CardTitle>
            <CardDescription>
              {t("home.featureNote")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">
                    {t(feature.labelKey)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
