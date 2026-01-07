import { useTranslation } from 'react-i18next';

export function meta() {
  return [{ title: 'Admin - Users' }];
}

export default function AdminUsers() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.users')}</h1>
      <div className="rounded-lg border bg-card">
        <div className="p-6 text-center text-muted-foreground">
          User management interface will be implemented here.
        </div>
      </div>
    </div>
  );
}
