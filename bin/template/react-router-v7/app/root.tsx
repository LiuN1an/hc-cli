import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Toaster } from "sonner";
import { I18nextProvider, useTranslation } from "react-i18next";

import type { Route } from "./+types/root";
import "./app.css";
import { Providers } from "./components/providers";
import i18n from "./lib/i18n";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "React Router Fullstack Template" },
    {
      name: "description",
      content: "A modern fullstack template with React Router v7",
    },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ];
};

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  // 复古字体：手写体 + 衬线体
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap",
  },
];

function InnerLayout({ children }: { children: React.ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();

  return (
    <html lang={i18nInstance.language} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="paper-texture">
        <Providers>{children}</Providers>
        <Toaster
          toastOptions={{
            classNames: {
              success: "!bg-primary text-primary-foreground !border-none font-serif",
            },
          }}
          position="top-center"
          duration={3000}
        />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <I18nextProvider i18n={i18n}>
      <InnerLayout>{children}</InnerLayout>
    </I18nextProvider>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <main className="flex min-h-screen flex-col items-center justify-center p-4 paper-texture">
        <h1 className="text-4xl font-serif font-bold">{message}</h1>
        <p className="mt-4 text-muted-foreground">{details}</p>
        {stack && (
          <pre className="mt-4 w-full max-w-2xl overflow-x-auto rounded-md bg-muted p-4">
            <code className="text-sm">{stack}</code>
          </pre>
        )}
      </main>
    </I18nextProvider>
  );
}
