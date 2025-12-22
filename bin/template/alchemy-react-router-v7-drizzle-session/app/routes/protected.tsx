import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { authMiddleware } from "~/features/auth";
import type { MiddlewareFunction } from "react-router";

export const middleware: MiddlewareFunction[] = [authMiddleware];

export default function ProtectedPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Shield className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle>{t("protected.title")}</CardTitle>
          <CardDescription>{t("protected.description")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("protected.success")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function ErrorBoundary() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>{t("protected.unauthorized")}</CardTitle>
          <CardDescription>
            {t("protected.unauthorizedDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("protected.unauthorizedDescription")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
