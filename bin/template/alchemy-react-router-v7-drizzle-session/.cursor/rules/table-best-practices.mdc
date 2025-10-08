---
description: Table组件最佳实践 - 虚拟列表、过滤器、实时数据与性能优化
globs: 
  - "**/*table*.{ts,tsx}"
  - "**/*filter*.{ts,tsx}"
alwaysApply: false
---

# Table 组件最佳实践

基于 `@tanstack/react-table` + `@tanstack/react-virtual` 构建高性能表格系统的通用最佳实践，适用于大数据量、复杂过滤、实时更新场景。

## 虚拟列表核心配置

### 基础设置
```typescript
const rowVirtualizer = useVirtualizer({
  count: rowModel.rows.length,
  estimateSize: () => 33,              // 固定行高33px
  getScrollElement: () => containerRef.current,
  overscan: 5,                         // 预渲染5行防白屏
  measureElement: /* Firefox兼容处理 */
});
```

**关键点**
- 行高固定：保证虚拟滚动稳定性，避免布局抖动
- Overscan值：平衡性能与用户体验，5行为最佳实践
- Firefox兼容：禁用动态测量避免性能问题

### 无限滚动实现
```typescript
const fetchMoreOnBottomReached = useCallback((container) => {
  const { scrollHeight, scrollTop, clientHeight } = container;
  // 距底部500px触发加载
  if (scrollHeight - scrollTop - clientHeight < 500 && isAllowNextFetch) {
    fetchNextPage?.();
  }
}, [fetchNextPage, isAllowNextFetch]);

// 只监听垂直滚动
const lastScrollTopRef = useRef(0);
onScroll={(e) => {
  const currentScrollTop = e.currentTarget.scrollTop;
  if (currentScrollTop !== lastScrollTopRef.current) {
    fetchMoreOnBottomReached(e.currentTarget);
    lastScrollTopRef.current = currentScrollTop;
  }
}}
```

**最佳实践**
- 阈值设置：500px触发点既不过早也不过晚
- 避免误触发：使用ref追踪垂直滚动，排除水平滚动
- 加载控制：通过`isAllowNextFetch`防止重复请求

## 列定义标准模式

### 列配置结构
列定义是表格的核心，建议每个表格独立维护 `columns.tsx` 文件。

```typescript
import { createColumnHelper, FilterFn } from "@tanstack/react-table";

// 定义行类型
type DataRow = {
  id: string;
  name: string;
  value: number;
  createTime: number;
};

const columnHelper = createColumnHelper<DataRow>();

export const columns = [
  columnHelper.accessor("fieldName", {
    id: "uniqueId",              // 必须唯一，用于排序、过滤等操作
    header: CustomHeaderComponent, // 表头组件
    cell: ({ row, table }) => (   // 单元格渲染
      <div style={{ width: "100%", textAlign: "center" }}>
        {row.original.fieldName}
      </div>
    ),
    filterFn: customFilterFunction, // 自定义过滤逻辑
    size: 100,                      // 列宽（px）
    enablePinning: true,            // 是否可固定
  })
];
```

### 自定义FilterFn
```typescript
// 时间范围过滤
const dateRangeFilter: FilterFn<T> = (row, columnId, value) => {
  const { fromTimestamp, toTimestamp } = value;
  const cellValue = Number(row.getValue(columnId));
  return cellValue >= fromTimestamp && cellValue <= toTimestamp;
};

// 数值范围过滤
const numericRangeFilter: FilterFn<T> = (row, columnId, value) => {
  const { min, max } = value;
  const cellValue = Number(row.getValue(columnId));
  if (min !== undefined && max !== undefined) {
    return cellValue >= min && cellValue <= max;
  }
  return min !== undefined ? cellValue >= min : cellValue <= max;
};

// 多选过滤
const multiSelectFilter: FilterFn<T> = (row, columnId, value: string[]) => {
  if (!value || value.length === 0) return true;
  const cellValue = row.getValue(columnId) as string;
  return value.includes(cellValue);
};
```

**设计原则**
- FilterFn负责客户端过滤逻辑
- 复杂过滤应在服务端完成，FilterFn仅做展示过滤
- 返回值必须为boolean

### Meta数据传递
```typescript
// 初始化时传入meta
useVirtualTable({
  // ...其他配置
  meta: {
    showOriginTime,
    toggleShowOriginTime,
    customConfig,
  }
});

// 在cell/header中访问
cell: ({ row, table }) => {
  const meta = table.options.meta as any;
  const showOrigin = meta?.showOriginTime;
  // 使用meta数据
}
```

## 表格初始化标准流程

### 完整初始化模板
这是一个包含虚拟滚动、无限分页、过滤器、排序的完整实现模板。

```typescript
export const DataTable: FC<{ dataSource: string }> = ({ dataSource }) => {
  // 1. 状态定义
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "time", desc: true }
  ]);

  // 2. 提取过滤器值（解耦状态与API参数）
  const dateFilter = useMemo(() => 
    columnFilters.find(f => f.id === "date")?.value,
    [columnFilters]
  );
  
  const volumeFilter = useMemo(() => 
    columnFilters.find(f => f.id === "volume")?.value,
    [columnFilters]
  );

  // 3. 转换排序参数
  const sortParams = useMemo(() => {
    if (sorting.length === 0) return {};
    const [sort] = sorting;
    return {
      sort_order: sort.desc ? "desc" : "asc",
      sort_by: sort.id,
    };
  }, [sorting]);

  // 4. 无限查询（以React Query为例）
  const { data, fetchNextPage, isFetching, isError } = useInfiniteQuery({
    queryKey: ['tableData', dataSource, dateFilter, volumeFilter, sortParams],
    queryFn: ({ pageParam = 1 }) => fetchTableData({
      source: dataSource,
      page: pageParam,
      pageSize: 100,
      startTime: dateFilter?.fromTimestamp,
      minValue: volumeFilter?.min,
      ...sortParams,
    }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    }
  });

  // 5. 扁平化分页数据
  const flatData = useMemo(() => 
    data?.pages?.flatMap(page => page.data).filter(Boolean) || [],
    [data]
  );

  // 6. 合并实时数据（可选）
  const combinedData = useCombinedTableData(flatData, "time");

  // 7. 过滤器变化时重新获取
  useEffect(() => {
    refetch();
  }, [dateFilter, volumeFilter]);

  // 8. 初始化虚拟表格
  const { table, render } = useVirtualTable({
    data: combinedData,
    columns,
    state: { rowSelection, columnFilters, sorting },
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    enableColumnFilters: true,
    fetchNextPage,
    isFetching,
    isAllowNextFetch: flatData.length < totalCount,
    meta: { /* 全局配置 */ }
  });

  return render;
};
```

**关键步骤**
1. **状态分离**：rowSelection、columnFilters、sorting独立管理
2. **useMemo提取**：避免过滤器状态直接耦合API参数
3. **扁平化处理**：无限查询分页数据需要flatten
4. **条件加载**：通过`isAllowNextFetch`控制是否继续分页
5. **副作用触发**：过滤器变化时手动refetch

## 过滤器系统设计

### 时间范围过滤器
```typescript
export interface TimeFilterValue {
  fromTimestamp?: number;  // 秒级时间戳
  toTimestamp?: number;
}

// 使用
<DateTimeFilter
  value={column.getFilterValue() as TimeFilterValue}
  onFilterChange={(value) => column.setFilterValue(value)}
  label=""
  triggerClassName="rounded-md text-xs"
/>
```

**实现要点**
- 日期默认值：fromDate设为00:00:00，toDate设为23:59:59
- 时间戳转换：前端Date转秒级时间戳（除以1000）
- 验证逻辑：fromDate不能晚于toDate
- Apply/Cancel分离：点击Apply才生效，避免频繁触发

### 数值范围过滤器
```typescript
export interface NumberRangeFilterValue {
  min?: number;
  max?: number;
}

// 输入验证正则
const isValidNumber = /^-?\d*\.?\d*$/;
```

**实现要点**
- 独立输入：min和max可以单独设置
- 实时验证：输入时检查正则，应用时检查min≤max
- 类型安全：存储为number而非string

### 文本过滤器
```typescript
const [search, setSearch] = useState("");

<Input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Filter trader"
/>
<Button onClick={() => {
  column.setFilterValue(search);
  setIsOpen(false);
}}>Apply</Button>
```

**交互模式**
- 本地状态：使用useState存储输入值
- 延迟生效：点击Apply才调用setFilterValue
- Clear按钮：重置输入并清空过滤器

### 统一表头结构
```typescript
export const FieldHeader: ColumnDefTemplate<T> = ({ column, table }) => (
  <div className="flex items-center text-xs">
    <span className="font-bold">Label</span>
    <TheadSorting table={table} id="fieldId" />
    <FilterComponent
      value={column.getFilterValue()}
      onFilterChange={(value) => column.setFilterValue(value)}
    />
  </div>
);
```

**设计规范**
- 标签 + 排序 + 过滤三段式布局
- 过滤器触发器统一使用Filter图标
- 激活态显示：`bg-gray-700 text-[#7D7DF5]`

## 实时数据集成方案

### useCombinedTableData Hook
适用于需要同时展示历史分页数据和实时推送数据的场景（如交易记录、日志监控等）。

```typescript
// 使用方式
const combinedData = useCombinedTableData<T>(flatData, "id"); // id为唯一键字段
```

**核心实现逻辑**
```typescript
export function useCombinedTableData<T>(
  flatData: T[],
  uniqueKeyField: keyof T = 'id' as keyof T
) {
  const [realtimeData, setRealtimeData] = useState<T[]>([]);

  // 监听实时更新（具体实现根据你的实时通信方案，如WebSocket、SSE等）
  useEffect(() => {
    const unsubscribe = realtimeDataSource.subscribe((newData: T[]) => {
      setRealtimeData(prevData => {
        const uniqueMap = new Map<string, T>();
        
        // 先添加已有实时数据
        prevData.forEach(item => {
          uniqueMap.set(String(item[uniqueKeyField]), item);
        });
        
        // 新数据覆盖旧数据
        newData.forEach(item => {
          uniqueMap.set(String(item[uniqueKeyField]), item);
        });
        
        // 转数组并排序（最新数据在前）
        return Array.from(uniqueMap.values())
          .sort((a, b) => {
            const aValue = a[uniqueKeyField] as unknown as number;
            const bValue = b[uniqueKeyField] as unknown as number;
            return bValue - aValue; // 降序
          });
      });
    });

    return unsubscribe;
  }, [uniqueKeyField]);

  // flatData变化时重置实时数据（过滤器变化场景）
  useEffect(() => {
    setRealtimeData([]);
  }, [flatData]);

  // 合并数据：实时数据在前，历史数据在后，去重
  return useMemo(() => {
    return combineTableData(flatData, realtimeData, uniqueKeyField);
  }, [flatData, realtimeData, uniqueKeyField]);
}
```

**工具函数：combineTableData**
```typescript
export function combineTableData<T>(
  flatData: T[],
  realtimeData: T[],
  uniqueKeyField: keyof T = 'id' as keyof T
): T[] {
  if (!realtimeData.length) return flatData;
  if (!flatData.length) return realtimeData;

  // 建立历史数据Map用于去重
  const existingDataMap = new Map<string, boolean>();
  flatData.forEach(item => {
    existingDataMap.set(String(item[uniqueKeyField]), true);
  });

  // 过滤掉已存在于历史数据的实时数据
  const uniqueRealtimeData = realtimeData.filter(item => {
    return !existingDataMap.get(String(item[uniqueKeyField]));
  });

  // 实时数据置顶
  return [...uniqueRealtimeData, ...flatData];
}
```

### 实时监听条件控制
```typescript
useEffect(() => {
  // 条件：无过滤器 + 数据已加载 + 未在加载中
  const shouldEnableRealtime = 
    !dateFilter &&
    !volumeFilter &&
    !searchFilter &&
    !isFetching &&
    flatData.length > 0;

  if (shouldEnableRealtime) {
    // 启动实时监听（返回清理函数）
    return realtimeDataSource.start(dataSource);
  }
}, [dateFilter, volumeFilter, searchFilter, isFetching, flatData.length]);
```

**设计原则**
- **过滤器互斥**：有过滤器时禁用实时数据，避免数据不一致
- **延迟启动**：等待首次加载完成再启用实时监听
- **自动清理**：返回unsubscribe函数，组件卸载时自动清理
- **去重机制**：使用Map按唯一键去重，O(n)复杂度

## 列固定（Pinning）实现

### 固定列样式函数
```typescript
const getCommonPinningStyles = (column: Column<T>): CSSProperties => {
  const isPinned = column.id === "select" || column.id === "date";
  const isFirstPinned = column.id === "select";
  const isSecondPinned = column.id === "date";

  return {
    position: isPinned ? "sticky" : "relative",
    width: column.getSize(),
    zIndex: isPinned ? 2 : 0,
    left: isFirstPinned ? 0 : isSecondPinned ? 40 : 0,
    boxShadow: isSecondPinned ? "4px 0 4px -4px rgba(0,0,0,0.3)" : undefined,
    backgroundColor: isPinned ? "black" : undefined,
  };
};

// 传入虚拟表格
useVirtualTable({
  getCommonPinningStyles,
  // ...
});
```

**关键点**
- `sticky` + `zIndex: 2`：确保固定列在最上层
- `backgroundColor`：必须设置，避免滚动时穿透
- `left`：累加前面固定列宽度
- `boxShadow`：最后固定列添加阴影分隔

## 排序组件实现

### TheadSorting组件
```typescript
export const TheadSorting: FC<{ table: Table<any>; id: string }> = ({
  table,
  id,
}) => {
  const isDesc = useMemo(() => {
    const [sort] = table.getState().sorting;
    if (sort?.id === id) return sort.desc;
  }, [table.getState().sorting, id]);

  return (
    <div className="flex flex-col items-center">
      <OrderUp className={cn(
        "h-2 w-2",
        isDesc === false && "text-[#7D7DF5]"
      )}/>
      <OrderDown className={cn(
        "h-2 w-2",
        isDesc === true && "text-[#7D7DF5]"
      )}/>
    </div>
  );
};
```

**设计规范**
- 双向箭头垂直排列
- 当前排序方向高亮紫色`#7D7DF5`
- 点击切换：`table.setSorting([{ id, desc: !isDesc }])`

## 性能优化清单

### 虚拟化优化
- [ ] 使用`useVirtualizer`处理超过100行数据
- [ ] 固定行高避免动态测量（Firefox性能问题）
- [ ] overscan设置为5行（平衡性能与体验）
- [ ] 使用`measureElement`实现精确测量（非Firefox）

### 状态管理优化
- [ ] 使用`useMemo`提取过滤器值，避免重复计算
- [ ] 分页数据扁平化缓存到`useMemo`
- [ ] 排序参数转换使用`useMemo`
- [ ] 避免在render中直接访问`table.getState()`

### 数据处理优化
- [ ] 使用Map进行去重，复杂度O(n)
- [ ] 实时数据与分页数据合并延迟到`useMemo`
- [ ] 过滤器变化时才触发refetch，避免无效请求
- [ ] 服务端分页+排序+过滤，客户端仅做展示

### 渲染优化
- [ ] 使用`flexRender`渲染cell和header
- [ ] 避免在cell中使用复杂计算，提前在数据层完成
- [ ] 固定列必须设置背景色避免重绘
- [ ] 骨架屏使用固定数量（20行），避免动态计算

## 样式设计建议

### 尺寸规范
```typescript
rowHeight: 33-40        // 行高建议33-40px（固定值，避免虚拟滚动抖动）
headerHeight: 33-40     // 表头高度与行高一致
fontSize: 12-14         // 字体大小
iconSize: 12-16         // 图标尺寸
```

### 视觉层次
- **表头**：粗体、略深背景、统一色调（如紫/蓝系）
- **奇偶行**：可选择性添加斑马纹，提升可读性
- **悬停态**：行悬停时边框或背景变化，提供视觉反馈
- **激活态**：过滤器、排序激活时颜色变化

### 交互规范
```css
/* 建议的交互样式 */
.table-row:hover {
  border-color: var(--border-hover);
  cursor: pointer;
}

.filter-active, .sort-active {
  color: var(--primary-color);
  background: var(--active-bg);
}

/* 固定列阴影分隔 */
.pinned-column {
  box-shadow: 4px 0 4px -4px rgba(0, 0, 0, 0.3);
}
```

## TypeScript 类型安全

### 行类型定义
```typescript
// 定义清晰的行数据结构
export type TableRowType = {
  id: string;                    // 唯一标识
  name: string;
  value: number;
  status: "active" | "inactive"; // 使用联合类型
  createTime: number;            // 时间戳
  metadata?: Record<string, any>; // 可选的元数据
};
```

### 过滤器类型定义
```typescript
// 时间范围过滤器
export interface TimeFilterValue {
  fromTimestamp?: number;
  toTimestamp?: number;
}

// 数值范围过滤器
export interface NumberRangeFilterValue {
  min?: number;
  max?: number;
}

// 多选过滤器
export type MultiSelectFilterValue = string[];

// 文本搜索过滤器
export type TextSearchFilterValue = string;
```

### Meta类型扩展
为了在表格组件中传递自定义配置，可以扩展TableMeta类型：

```typescript
declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    // 显示配置
    showOriginTime?: boolean;
    toggleShowOriginTime?: () => void;
    
    // 业务逻辑配置
    onRowAction?: (row: TData) => void;
    customConfig?: Record<string, any>;
    
    // 状态标识
    isFetched?: boolean;
  }
}
```

## 常见问题

### Q: 虚拟滚动出现白屏？
A: 增加`overscan`值到5-10，或检查`estimateSize`是否准确

### Q: 横向滚动触发分页加载？
A: 使用ref追踪`scrollTop`，只在垂直滚动时触发

### Q: 过滤器不生效？
A: 检查`enableColumnFilters: true`，确认filterFn正确返回boolean

### Q: 实时数据重复？
A: 确认`uniqueKeyField`唯一且正确，检查Map去重逻辑

### Q: 固定列滚动时穿透？
A: 必须设置`backgroundColor`，`zIndex`至少为2

### Q: 排序不生效？
A: 检查sorting state是否正确传递，确认sortBy字段名匹配

## 架构建议

### 文件组织
```
src/
  components/
    virtual-table.tsx          # 虚拟表格核心Hook
    table-sorting.tsx          # 排序组件
    ui/
      date-time-filter.tsx     # 时间范围过滤器
      number-range-filter.tsx  # 数值范围过滤器
  features/
    [feature-name]/
      table.tsx                # 表格容器组件
      columns.tsx              # 列定义
      hooks/
        useCombinedTableData.ts # 实时数据合并Hook
      utils/
        combineTableData.ts    # 数据合并工具函数
```

### 代码复用策略
- **虚拟表格Hook**：封装 `useVirtualTable` 统一管理配置
- **过滤器组件**：UI层复用，只传值和回调
- **列定义**：按业务拆分文件，每个表格独立columns
- **工具函数**：数据处理逻辑（去重、合并、转换）抽离到utils
