import { useTranslation } from 'react-i18next';

export function meta() {
  return [{ title: 'Admin - Reviews' }];
}

export default function AdminReviews() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.reviews')}</h1>
      <div className="rounded-lg border bg-card">
        <div className="p-6 text-center text-muted-foreground">
          Content review and moderation interface will be implemented here.
        </div>
      </div>
    </div>
  );
}
