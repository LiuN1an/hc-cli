# React Router Fullstack Template

A modern fullstack template built with React Router v7, Tailwind CSS v4, and more.

## Features

- 🚀 **React Router v7** - Full-stack framework with SSR support
- 🎨 **Tailwind CSS v4** - Latest version with new features
- 🧩 **shadcn/ui** - Beautiful, accessible UI components
- 📊 **TanStack Table** - Headless table with infinite scroll & virtual scrolling
- 📝 **React Hook Form** - Form with Zod validation (@hookform/resolvers)
- 🔗 **nuqs** - URL state management
- 🌍 **i18n** - SSR internationalization with remix-i18next
- 🔐 **Auth Middleware** - Header-based authentication
- 📡 **TanStack Query** - Powerful data fetching
- 🔔 **Sonner** - Beautiful toast notifications
- ⏳ **NProgress** - Page transition progress bar
- 📦 **pnpm** - Fast, disk space efficient package manager

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- pnpm

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
app/
├── components/
│   ├── ui/              # shadcn/ui components
│   └── providers.tsx    # App providers (QueryClient, NuqsAdapter)
├── hooks/
│   └── use-debounce.ts  # Debounce hooks
├── lib/
│   └── utils.ts         # Utility functions (cn)
├── locales/
│   ├── en.ts            # English translations
│   └── zh.ts            # Chinese translations
├── middleware/
│   ├── auth.ts          # Authentication middleware
│   └── i18next.ts       # i18n middleware
├── routes/
│   ├── api.locales.tsx  # i18n API endpoint
│   ├── form.tsx         # Form demo page
│   ├── home.tsx         # Home page
│   ├── layout.tsx       # App layout with navigation
│   ├── protected.tsx    # Protected page demo
│   └── table.tsx        # Table demo page
├── app.css              # Global styles & Tailwind config
├── entry.client.tsx     # Client entry point
├── entry.server.tsx     # Server entry point
├── root.tsx             # Root component
└── routes.ts            # Route configuration
```

## Key Features Explained

### 1. React Router v7 with SSR

The template uses React Router v7's framework mode with SSR enabled by default.

```typescript
// react-router.config.ts
export default {
  ssr: true,
  future: {
    unstable_middleware: true,
  },
} satisfies Config;
```

### 2. Tailwind CSS v4

Using the latest Tailwind CSS v4 with Vite integration:

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
});
```

### 3. shadcn/ui Components

Pre-configured with shadcn/ui. Add more components using:

```bash
pnpm dlx shadcn@latest add <component-name>
```

### 4. nuqs - URL State Management

Manage state through URL query parameters:

```typescript
import { useQueryState, parseAsString } from "nuqs";

const [search, setSearch] = useQueryState(
  "search",
  parseAsString.withDefault("")
);
```

### 5. TanStack Table with Infinite Scroll

Virtual scrolling for large datasets:

```typescript
const rowVirtualizer = useVirtualizer({
  count: table.getRowModel().rows.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 48,
  overscan: 10,
});
```

### 6. React Hook Form with Zod

Type-safe form validation using `react-hook-form` + `@hookform/resolvers`:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  age: z.coerce.number().min(18, "Must be 18+"),
});

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: { email: "", age: undefined },
});

// In JSX:
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 7. Middleware Authentication

Protect routes with header-based auth:

```typescript
// middleware/auth.ts
export const authMiddleware: Route.unstable_MiddlewareFunction = async (
  { request },
  next
) => {
  const authToken = request.headers.get("x-auth-token");
  if (!authToken) {
    throw redirect("/");
  }
  return next();
};

// routes/protected.tsx
export const middleware = [authMiddleware];
```

### 8. SSR i18n

Server-side internationalization with remix-i18next:

```typescript
// middleware/i18next.ts
export const [i18nextMiddleware, getLocale, getInstance] =
  createI18nextMiddleware({
    detection: {
      supportedLanguages: ["en", "zh"],
      fallbackLanguage: "en",
    },
    i18next: {
      resources: { en: { translation: en }, zh: { translation: zh } },
    },
  });
```

### 9. Page Transition Progress

NProgress bar on navigation:

```typescript
const navigation = useNavigation();

useEffect(() => {
  if (navigation.state === "loading") {
    NProgress.start();
  } else {
    NProgress.done();
  }
}, [navigation.state]);
```

### 10. Lodash Debounce

Debounced search with lodash:

```typescript
const debouncedSetSearch = useMemo(
  () => debounce((value: string) => setSearch(value || null), 300),
  [setSearch]
);
```

## Adding New shadcn Components

```bash
# Add a single component
pnpm dlx shadcn@latest add button

# Add multiple components
pnpm dlx shadcn@latest add card dialog input
```

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
NODE_ENV=development
```

## License

MIT

