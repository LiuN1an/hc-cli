import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '~/components/ui/button';
import { useUser } from '~/context';

export function meta() {
  return [{ title: 'Template - Home' }, { name: 'description', content: 'Monorepo Template' }];
}

export default function Home() {
  const { t } = useTranslation();
  const user = useUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="text-xl font-bold">
            Template
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/table" className="text-sm text-muted-foreground hover:text-foreground">
              {t('nav.table')}
            </Link>
            <Link to="/form" className="text-sm text-muted-foreground hover:text-foreground">
              {t('nav.form')}
            </Link>
            {user ? (
              <>
                <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
                  {t('nav.admin')}
                </Link>
                <span className="text-sm text-muted-foreground">{user.email}</span>
              </>
            ) : (
              <Link to="/signin">
                <Button size="sm">{t('nav.signin')}</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{t('home.title')}</h1>
          <p className="mt-6 text-lg text-muted-foreground">{t('home.description')}</p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/table">
              <Button size="lg">{t('nav.table')}</Button>
            </Link>
            <Link to="/form">
              <Button variant="outline" size="lg">
                {t('nav.form')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mx-auto mt-20 grid max-w-4xl gap-8 sm:grid-cols-2">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">{t('home.features.auth')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('home.features.authDesc')}</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">{t('home.features.form')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('home.features.formDesc')}</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">{t('home.features.table')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('home.features.tableDesc')}</p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold">{t('home.features.i18n')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('home.features.i18nDesc')}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
