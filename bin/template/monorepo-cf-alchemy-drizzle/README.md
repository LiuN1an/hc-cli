# Monorepo Template

基于 React Router 7、Alchemy 和 Cloudflare Workers 的全栈 Monorepo 模板。

## 特性

- **Monorepo 架构**: 使用 pnpm workspace 管理多包
- **全栈 Web 应用**: React Router 7 + Alchemy + Cloudflare Workers
- **会话认证**: 基于 KV 存储的 session 认证
- **表单验证**: React Hook Form + Zod
- **表格分页**: TanStack Table + 虚拟滚动
- **国际化**: i18next 多语言支持
- **Worker 模板**: 可复用的 Cloudflare Worker 配置

## 项目结构

```
template/
├── packages/
│   ├── shared/         # 共享数据库 schema 和工具函数
│   ├── web/            # React Router 全栈 Web 应用
│   └── cf-worker/      # Cloudflare Worker 模板
├── scripts/
│   └── generate-wrangler.js  # Wrangler 配置生成脚本
├── wrangler.base.jsonc       # 基础 Wrangler 配置
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 创建 D1 数据库

```bash
# 创建数据库
wrangler d1 create template-db

# 更新 wrangler.base.jsonc 中的 database_id
```

### 3. 运行数据库迁移

```bash
# 生成迁移文件
pnpm db:generate

# 应用迁移（本地）
pnpm db:migrate

# 应用迁移（远程）
pnpm --filter @template/web db:migrate:prod
```

### 4. 启动开发服务器

```bash
pnpm dev
```

## 包说明

### @template/shared

共享的数据库 schema 和工具函数。

**导出:**

- `./database`: Drizzle ORM schema、类型定义、查询工具
- `./utils`: 通用工具函数（分页、ID 生成等）

**Schema 层级:**

- Layer 1 (基础表): `users`, `sessions`, `configs`
- Layer 2 (业务表): `reviews` (内容审核)

### @template/web

基于 Alchemy 的 React Router 7 全栈应用。

**技术栈:**

- React 19 + React Router 7
- Alchemy (Cloudflare Workers 运行时)
- Tailwind CSS 4 + CVA
- React Hook Form + Zod
- TanStack Query + Table
- i18next

**目录结构:**

```
web/
├── app/
│   ├── components/ui/     # UI 组件（Button, Input, Form, Pagination...）
│   ├── features/auth/     # 认证功能（session, middleware, handlers）
│   ├── lib/               # 工具函数和 i18n 配置
│   ├── locales/           # 翻译文件
│   ├── routes/            # 路由页面
│   │   ├── admin/         # 管理后台
│   │   └── api/v1/        # API 端点
│   ├── context.ts         # React Context
│   ├── root.tsx           # 根组件
│   └── routes.ts          # 路由配置
├── workers/
│   └── app.ts             # Worker 入口
├── alchemy.run.ts         # Alchemy 配置
└── vite.config.ts         # Vite 配置
```

**认证流程:**

1. 用户登录 → 创建 session → 存储到 KV
2. 请求时 → 验证 session cookie → 获取用户信息
3. Admin 支持 header token 认证（用于 API 调用）

### @template/cf-worker

Cloudflare Worker 模板，用于后台任务处理。

**功能:**

- 定时任务支持（cron triggers）
- 共享数据库访问
- 健康检查端点
- 手动触发端点

## Wrangler 配置复用

本模板使用基础配置 + 生成脚本的方式实现 wrangler 配置复用。

### 基础配置 (wrangler.base.jsonc)

```jsonc
{
  "compatibility_date": "2024-12-01",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "template-db",
      "database_id": "YOUR_DATABASE_ID"
    }
  ]
}
```

### 生成脚本

```bash
pnpm wrangler:generate
```

脚本会读取基础配置，合并包特定配置，生成各包的 `wrangler.jsonc`。

### 添加新 Worker

1. 在 `scripts/generate-wrangler.js` 中添加包配置：

```javascript
const packages = [
  {
    name: 'cf-worker',
    config: {
      name: 'template-worker',
      main: 'src/index.ts',
      triggers: { crons: ['0 6 * * *'] }
    }
  },
  // 添加新的 worker
  {
    name: 'my-new-worker',
    config: {
      name: 'my-new-worker',
      main: 'src/index.ts',
      vars: { MY_VAR: 'value' }
    }
  }
];
```

2. 运行生成脚本：

```bash
pnpm wrangler:generate
```

## 环境变量

### Web 应用

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `SESSION_EXPIRY` | Session 过期时间（秒） | `604800` (7天) |
| `AUTH_TOKEN_KEY` | Admin token header 名称 | `x-admin-token` |
| `AUTH_TOKEN_VALUE` | Admin token 值 | - |
| `R2_CUSTOM_DOMAIN` | R2 自定义域名 | - |

### Worker

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `WORKER_ENABLED` | 是否启用 Worker | `true` |

## 部署

### 部署 Web 应用

```bash
pnpm deploy:web
```

### 部署 Worker

```bash
pnpm deploy:worker
```

## 开发命令

```bash
# 开发
pnpm dev                    # 启动 web 开发服务器
pnpm --filter @template/cf-worker dev  # 启动 worker 开发

# 构建
pnpm build                  # 构建 web 应用

# 类型检查
pnpm typecheck              # 检查所有包

# 数据库
pnpm db:generate            # 生成迁移文件
pnpm db:migrate             # 应用迁移（本地）

# 配置生成
pnpm wrangler:generate      # 生成 wrangler 配置
```

## License

MIT
