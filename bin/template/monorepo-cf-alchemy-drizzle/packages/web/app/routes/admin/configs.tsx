import { useTranslation } from 'react-i18next';

export function meta() {
  return [{ title: 'Admin - Configs' }];
}

export default function AdminConfigs() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.configs')}</h1>
      <div className="rounded-lg border bg-card">
        <div className="p-6 text-center text-muted-foreground">
          System configuration interface will be implemented here.
        </div>
      </div>
    </div>
  );
}
