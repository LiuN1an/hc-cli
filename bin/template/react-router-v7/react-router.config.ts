import type { Config } from "@react-router/dev/config";

export default {
  // SSR 默认开启
  ssr: true,
  // 启用 middleware
  future: {
    v8_middleware: true,
  },
} satisfies Config;
