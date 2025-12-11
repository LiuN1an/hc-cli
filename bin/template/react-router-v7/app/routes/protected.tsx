import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";
import { authMiddleware } from "~/middleware/auth";
import type { MiddlewareFunction } from "react-router";

// 使用认证中间件保护此路由
export const middleware: MiddlewareFunction[] = [authMiddleware];

export default function ProtectedPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>{t("protected.title")}</CardTitle>
          <CardDescription>{t("protected.description")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            You have successfully accessed the protected page. This means your
            request included a valid <code className="bg-muted px-1 py-0.5 rounded">x-auth-token</code> header.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// 当鉴权失败时显示的错误边界
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
            To access this page, add the following header to your request:
          </p>
          <pre className="mt-4 rounded-md bg-muted p-4 text-sm">
            <code>x-auth-token: your-secret-token</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

