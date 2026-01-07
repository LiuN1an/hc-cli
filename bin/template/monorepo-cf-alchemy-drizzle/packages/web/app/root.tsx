import type { LinksFunction, LoaderFunctionArgs } from 'react-router';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

import '~/lib/i18n';
import './app.css';

import { RouterContext, type EnvContext, type UserContext } from './context';
import { authMiddleware } from './features/auth/middleware/auth';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous'
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  }
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await authMiddleware(request, context);

  return {
    env: context as EnvContext,
    user
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { env, user } = useLoaderData<typeof loader>();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <RouterContext.Provider value={{ env, user }}>
        <Outlet />
        <Toaster position="top-center" richColors />
      </RouterContext.Provider>
    </QueryClientProvider>
  );
}
