import { useCallback, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryState, parseAsString } from "nuqs";
import debounce from "lodash/debounce";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

// Mock 数据类型
interface User {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

// 生成 mock 数据
function generateMockData(page: number, pageSize: number, search: string): User[] {
  const startIndex = page * pageSize;
  const filtered = search.toLowerCase();

  return Array.from({ length: pageSize }, (_, i) => {
    const id = startIndex + i + 1;
    const statuses: User["status"][] = ["active", "inactive", "pending"];
    const names = [
      "Alice Johnson",
      "Bob Smith",
      "Charlie Brown",
      "Diana Prince",
      "Edward Norton",
      "Fiona Green",
      "George Wilson",
      "Hannah Montana",
      "Ivan Petrov",
      "Julia Roberts",
    ];
    const name = names[id % names.length];

    // 简单的搜索过滤
    if (filtered && !name.toLowerCase().includes(filtered)) {
      return null;
    }

    return {
      id,
      name: `${name} #${id}`,
      email: `user${id}@example.com`,
      status: statuses[id % 3],
      createdAt: new Date(Date.now() - id * 86400000).toISOString().split("T")[0],
    };
  }).filter(Boolean) as User[];
}

// 模拟 API 请求
async function fetchUsers({
  pageParam = 0,
  search = "",
}: {
  pageParam?: number;
  search?: string;
}): Promise<{ data: User[]; nextPage: number | null }> {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 500));

  const pageSize = 20;
  const data = generateMockData(pageParam, pageSize, search);

  // 模拟分页：假设最多100条数据（5页）
  const hasMore = pageParam < 4 && data.length === pageSize;

  return {
    data,
    nextPage: hasMore ? pageParam + 1 : null,
  };
}

export default function TablePage() {
  const { t } = useTranslation();

  // 使用 nuqs 进行 URL 状态管理
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );

  // 搜索防抖
  const debouncedSetSearch = useMemo(
    () => debounce((value: string) => setSearch(value || null), 300),
    [setSearch]
  );

  // 无限查询
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ["users", search],
    queryFn: ({ pageParam }) => fetchUsers({ pageParam, search }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  // 扁平化数据
  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  // 表格列定义
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => t("table.columns.id"),
        size: 80,
      },
      {
        accessorKey: "name",
        header: () => t("table.columns.name"),
        size: 200,
      },
      {
        accessorKey: "email",
        header: () => t("table.columns.email"),
        size: 250,
      },
      {
        accessorKey: "status",
        header: () => t("table.columns.status"),
        size: 120,
        cell: ({ row }) => {
          const status = row.original.status;
          const statusColors = {
            active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          };
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status]}`}
            >
              {t(`table.status.${status}`)}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => t("table.columns.createdAt"),
        size: 120,
      },
    ],
    [t]
  );

  // TanStack Table 实例
  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 虚拟化滚动容器 ref
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // 虚拟化
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48, // 行高估计值
    overscan: 10,
  });

  // 滚动到底部时加载更多
  const handleScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("table.title")}</CardTitle>
          <CardDescription>{t("table.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索框（带防抖） */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("table.searchPlaceholder")}
              defaultValue={search}
              onChange={(e) => debouncedSetSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 虚拟滚动表格 */}
          <div
            ref={tableContainerRef}
            className="h-[500px] overflow-auto rounded-md border"
          >
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : isError ? (
              <div className="flex h-full items-center justify-center text-destructive">
                Error loading data
              </div>
            ) : flatData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {t("table.noResults")}
              </div>
            ) : (
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          style={{ width: header.getSize() }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {/* 虚拟化填充 */}
                  <tr>
                    <td
                      colSpan={columns.length}
                      style={{ height: `${rowVirtualizer.getVirtualItems()[0]?.start ?? 0}px` }}
                    />
                  </tr>
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    return (
                      <TableRow key={row.id} data-index={virtualRow.index}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            style={{ width: cell.column.getSize() }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                  {/* 底部填充 */}
                  <tr>
                    <td
                      colSpan={columns.length}
                      style={{
                        height: `${
                          rowVirtualizer.getTotalSize() -
                          (rowVirtualizer.getVirtualItems().at(-1)?.end ?? 0)
                        }px`,
                      }}
                    />
                  </tr>
                </TableBody>
              </Table>
            )}
          </div>

          {/* 加载更多指示器 */}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("table.loadMore")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

