# Next.js Template

一个现代化的 Next.js 项目模板，包含以下技术基建:

- **Next.js 15** + App Router + Turbopack
- **TypeScript** 类型安全
- **Tailwind CSS v4** 样式方案
- **shadcn/ui** UI 组件库
- **next-intl** 国际化 (i18n)
- **react-hook-form + zod** 表单验证
- **sonner** Toast 通知
- **nuqs** URL 状态管理
- **usehooks-ts** 实用 Hooks

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 目录结构

```
template/
├── app/
│   ├── [locale]/                 # 国际化路由
│   │   ├── (client)/            # 客户端路由组 (带 Header/Footer)
│   │   │   ├── page.tsx         # 首页
│   │   │   ├── demo/            # Demo 页面
│   │   │   └── not-found.tsx    # 404 页面
│   │   ├── (admin)/             # 管理后台路由组 (需鉴权)
│   │   │   └── admin/           # 管理后台页面
│   │   └── layout.tsx           # 根布局
│   └── globals.css              # 全局样式
├── components/
│   ├── ui/                      # shadcn/ui 组件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── label.tsx
│   │   └── form.tsx
│   ├── providers/               # Provider 组件
│   │   └── toast-provider.tsx
│   ├── header.tsx               # 头部导航
│   └── footer.tsx               # 页脚
├── hooks/
│   └── use-mobile.ts            # 自定义 Hooks
├── i18n/
│   ├── config.ts                # i18n 配置
│   └── request.ts               # i18n 请求配置
├── lib/
│   ├── utils.ts                 # 工具函数 (cn)
│   └── validation/              # Zod 验证 Schema
├── messages/
│   └── en/                      # 英文翻译文件
│       ├── common.json
│       ├── home.json
│       └── demo.json
├── svgs/                        # SVG 组件
│   ├── logo.tsx
│   └── github.tsx
└── middleware.ts                # 中间件 (i18n + 鉴权)
```

## 核心功能说明

### 1. Next.js 项目配置

**next.config.ts** - 集成 next-intl 插件:

```typescript
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

### 2. shadcn/ui 组件

已预置常用组件，可通过 shadcn CLI 添加更多:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
```

组件使用示例:

```tsx
import { Button } from "@/components/ui/button";

<Button variant="outline" size="lg">
  Click me
</Button>
```

### 3. 国际化 (i18n)

**添加新语言:**

1. 在 `i18n/config.ts` 中添加语言代码:
```typescript
export const locales = ["en", "zh"] as const;
```

2. 创建对应的翻译文件 `messages/zh/common.json`

**使用翻译:**

```tsx
// 服务端组件
import { getTranslations } from "next-intl/server";
const t = await getTranslations("home");
<h1>{t("title")}</h1>

// 客户端组件
import { useTranslations } from "next-intl";
const t = useTranslations("home");
```

**国际化导航:**

```tsx
// 使用 i18n/request 导出的 Link，不要使用 next/link
import { Link, useRouter, usePathname } from "@/i18n/request";
```

### 4. SVG 组件

SVG 组件书写规范:

```tsx
import * as React from "react";

const MyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"      // 使用 currentColor 支持颜色继承
    xmlns="http://www.w3.org/2000/svg"
    {...props}               // 传递所有 props
  >
    <path d="..." />
  </svg>
);

export default MyIcon;
```

使用:
```tsx
<MyIcon className="w-6 h-6 text-blue-500" />
```

### 5. 路由鉴权

**middleware.ts** 中实现路由保护:

```typescript
// 检查 admin 路由
if (adminRouteRegex.test(pathname)) {
  const authHeader = req.headers.get("auth_admin");
  if (authHeader !== process.env.ADMIN_AUTH_TOKEN) {
    return NextResponse.rewrite(new URL('/not-found', req.url));
  }
}
```

可选鉴权方式:
- Header 鉴权 (当前实现)
- Cookie/Session 鉴权
- JWT Token 鉴权

### 6. 表单方案 (react-hook-form + zod)

**定义 Schema:**

```typescript
// lib/validation/demo-form.ts
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
});

export type FormData = z.infer<typeof formSchema>;
```

**使用表单:**

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";

const form = useForm<FormData>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", email: "" },
});

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

### 7. Toast 通知 (sonner)

```tsx
import { toast } from "sonner";

// 不同类型的通知
toast.success("Success!");
toast.error("Error!");
toast.info("Info");
toast.warning("Warning");

// 带操作的通知
toast("Event created", {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
});
```

### 8. URL 状态管理 (nuqs)

```tsx
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";

// 字符串参数
const [search, setSearch] = useQueryState("q", parseAsString);

// 数字参数
const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));

// 使用
setSearch("hello"); // URL: ?q=hello
```

**注意:** 需要在布局中包裹 `NuqsAdapter`:

```tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app';

<NuqsAdapter>
  {children}
</NuqsAdapter>
```

### 9. usehooks-ts

常用 Hooks:

```tsx
import {
  useLocalStorage,
  useDebounceValue,
  useMediaQuery,
  useCopyToClipboard,
  useToggle,
} from "usehooks-ts";

// localStorage 持久化
const [value, setValue] = useLocalStorage("key", defaultValue);

// 防抖
const [debouncedValue] = useDebounceValue(value, 500);

// 媒体查询
const isMobile = useMediaQuery("(max-width: 768px)");
```

## 环境变量

创建 `.env.local` 文件:

```env
# Admin 鉴权 Token
ADMIN_AUTH_TOKEN=your-secret-token
```

## 添加更多 shadcn 组件

```bash
# 常用组件
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
npx shadcn@latest add tooltip
npx shadcn@latest add card
npx shadcn@latest add table
```

## License

MIT

