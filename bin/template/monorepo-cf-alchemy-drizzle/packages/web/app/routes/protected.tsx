import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { requireAuth } from '~/features/auth/middleware/auth';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await requireAuth(request, context);
  return { user };
}

export function meta() {
  return [{ title: 'Protected Page' }];
}

export default function Protected() {
  const { user } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Protected Page</h1>
        <p className="text-muted-foreground mb-6">
          Welcome, {user.name || user.email}! You are logged in as a {user.role}.
        </p>
        <Link to="/">
          <Button variant="outline">{t('common.back')}</Button>
        </Link>
      </div>
    </div>
  );
}
