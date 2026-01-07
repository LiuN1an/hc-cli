import type { LoaderFunctionArgs } from 'react-router';
import { Link, Outlet, useLoaderData, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { cn } from '~/lib/utils';
import { adminAuthMiddleware } from '~/features/auth/middleware/auth';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await adminAuthMiddleware(request, context);
  return { user };
}

export default function AdminLayout() {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: t('admin.dashboard') },
    { path: '/admin/users', label: t('admin.users') },
    { path: '/admin/reviews', label: t('admin.reviews') },
    { path: '/admin/configs', label: t('admin.configs') }
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold">
            Template Admin
          </Link>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </header>

      <div className="container mx-auto flex gap-8 px-4 py-8">
        {/* Sidebar */}
        <aside className="w-48 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'block rounded-md px-3 py-2 text-sm transition-colors',
                  location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
