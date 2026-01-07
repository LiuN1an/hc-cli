import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Input } from '~/components/ui/input';
import { Pagination } from '~/components/ui/pagination';

// Demo data type
interface DemoItem {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

// Generate demo data
function generateDemoData(page: number, pageSize: number, search: string) {
  const allData: DemoItem[] = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: i % 3 === 0 ? 'admin' : 'user',
    createdAt: new Date(Date.now() - i * 86400000).toISOString()
  }));

  // Filter by search
  const filtered = search
    ? allData.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase())
      )
    : allData;

  // Paginate
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize)
    }
  };
}

export function meta() {
  return [{ title: 'Table Demo' }];
}

export default function TableDemo() {
  const { t } = useTranslation();
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState('pageSize', parseAsInteger.withDefault(10));
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['demo-table', page, pageSize, search],
    queryFn: () => generateDemoData(page, pageSize, search)
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">{t('table.title')}</h1>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder={t('table.search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset to first page on search
          }}
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="h-10 px-4 text-left text-sm font-medium">{t('table.columns.id')}</th>
              <th className="h-10 px-4 text-left text-sm font-medium">{t('table.columns.name')}</th>
              <th className="h-10 px-4 text-left text-sm font-medium">{t('table.columns.email')}</th>
              <th className="h-10 px-4 text-left text-sm font-medium">{t('table.columns.role')}</th>
              <th className="h-10 px-4 text-left text-sm font-medium">
                {t('table.columns.createdAt')}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="h-24 text-center">
                  {t('common.loading')}
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="h-24 text-center text-muted-foreground">
                  {t('table.noResults')}
                </td>
              </tr>
            ) : (
              data?.data.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="h-12 px-4 text-sm">{item.id}</td>
                  <td className="h-12 px-4 text-sm">{item.name}</td>
                  <td className="h-12 px-4 text-sm">{item.email}</td>
                  <td className="h-12 px-4 text-sm">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        item.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.role}
                    </span>
                  </td>
                  <td className="h-12 px-4 text-sm text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && (
        <div className="mt-6">
          <Pagination
            page={data.pagination.page}
            pageSize={data.pagination.pageSize}
            total={data.pagination.total}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
