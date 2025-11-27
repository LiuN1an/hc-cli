# Alchemy + React Router + Drizzle + Session 模版

[![Deployed with Alchemy](https://alchemy.run/alchemy-badge.svg)](https://alchemy.run)

基于 React Router v7 + Cloudflare Workers + Drizzle ORM + KV Session 的全栈应用模版，采用模块化 Feature 架构设计。

## 技术栈

- 🚀 **React Router v7** - 服务端渲染 + 数据加载/变更
- ☁️ **Cloudflare Workers** - 边缘计算部署
- 🗄️ **Drizzle ORM + D1** - 类型安全的数据库操作
- 🔐 **KV Session** - 基于 Cloudflare KV 的会话管理
- 🎨 **TailwindCSS + shadcn/ui** - 现代化 UI 组件
- 📦 **React Query** - 客户端数据缓存与同步
- 📝 **TypeScript** - 全栈类型安全

## 项目结构

```
├── app/
│   ├── components/          # 共享 UI 组件
│   │   └── ui/              # shadcn/ui 组件
│   ├── context.ts           # React Router Context 定义
│   ├── features/            # 功能模块（核心架构）
│   │   ├── README.md        # Feature 开发规范
│   │   └── user/            # 用户模块示例
│   │       ├── api/         # API 业务逻辑处理
│   │       ├── database/    # Schema + Types
│   │       ├── hooks/       # React Query Hooks
│   │       ├── server/      # 服务端工具函数
│   │       └── index.ts     # 统一导出
│   ├── hooks/               # 全局共享 Hooks
│   ├── lib/                 # 工具函数库
│   │   ├── api-client.ts    # API 请求客户端
│   │   ├── crypto.ts        # 密码哈希工具
│   │   ├── session.ts       # Session 管理
│   │   └── ...
│   ├── middleware/          # React Router 中间件
│   ├── routes/              # 路由文件
│   │   └── api/v1/          # API 路由
│   └── root.tsx             # 应用根组件
├── database/
│   ├── schema.ts            # 统一 Schema 导出
│   └── types.ts             # 统一类型导出
├── workers/
│   └── app.ts               # Cloudflare Worker 入口
├── alchemy.run.ts           # Alchemy 基础设施配置
└── react-router.config.ts   # React Router 配置
```

## 核心架构：Feature 模块化开发

### 设计原则

1. **Server vs Client 严格分离**
   - ✅ 客户端可用：`types.ts`、`hooks/*`、`components/*`
   - ❌ 仅服务端：`schema.ts`、`server/*`、`api/*`

2. **Routes vs Features 职责分离**
   - **Features**: 包含业务逻辑，不导出 `loader`/`action`
   - **Routes**: 调用 Features，导出 `loader`/`action`

### Feature 模块结构

```
app/features/{feature-name}/
├── database/
│   ├── schema.ts           # Drizzle Schema（服务端）
│   └── types.ts            # TypeScript 类型（通用）
├── server/
│   └── utils.ts            # 数据库操作函数
├── api/
│   └── handlers.ts         # API 业务逻辑处理
├── hooks/
│   └── use-{feature}.ts    # React Query Hooks
├── components/             # UI 组件（可选）
└── index.ts                # 统一导出
```

### 示例：创建新 Feature

```bash
mkdir -p app/features/product/{database,server,api,hooks,components}
```

详细开发规范请参阅：`app/features/README.md`

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 配置环境

```bash
# 复制环境变量模版
cp .env.example .env.local

# 或手动创建 .dev.vars 文件（Cloudflare Workers 运行时使用）
echo "SESSION_EXPIRY=604800" > .dev.vars
```

#### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SESSION_EXPIRY` | Session 过期时间（秒） | `604800` (7天) |
| `SEED_DEFAULT_PASSWORD` | 种子数据测试账号密码 | `123456` |
| `DB_NAME` | 远程 D1 数据库名称 | - |
| `DB_ID` | 远程 D1 数据库 ID（可选） | - |

### 数据库迁移

```bash
# 生成迁移文件
pnpm drizzle-kit generate

# 本地应用迁移
pnpm drizzle-kit migrate
```

### 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 启动。

## 部署

### 使用 Alchemy 部署

```bash
# 部署到 Cloudflare
pnpm deploy
```

### 手动部署

```bash
# 构建
pnpm build

# 部署
npx wrangler deploy
```

## API 设计规范

### 响应格式

```typescript
// 成功响应
{
  success: true,
  data: T,
  message?: string
}

// 错误响应
{
  success: false,
  error: string,
  code: string
}
```

### 错误码约定

```typescript
const ERROR_CODES = {
  // 验证错误
  MISSING_FIELDS: "缺少必填字段",
  INVALID_EMAIL_FORMAT: "邮箱格式错误",
  
  // 认证错误
  INVALID_CREDENTIALS: "凭证无效",
  UNAUTHORIZED: "未授权",
  
  // 业务错误
  EMAIL_EXISTS: "邮箱已存在",
  USER_NOT_FOUND: "用户不存在",
  
  // 系统错误
  INTERNAL_ERROR: "内部错误",
};
```

## Session 管理

基于 Cloudflare KV 的会话管理，支持：

- 自动过期（默认 7 天）
- 安全的 Cookie 设置（HttpOnly, Secure, SameSite=Strict）
- 会话验证中间件

```typescript
// 创建会话
const sessionId = await createSession(sessionKV, sessionExpiry, user);

// 验证会话
const sessionData = await validateSession(sessionKV, sessionId);

// 销毁会话
await destroySession(sessionKV, sessionId);
```

## 中间件模式

### 认证中间件示例

```typescript
// app/middleware/admin-auth.ts
export const adminAuthMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  const { sessionKV } = context.get(EnvContext);
  const sessionId = getSessionFromRequest(request);
  
  if (!sessionId) {
    throw redirect("/signin");
  }
  
  const sessionData = await validateSession(sessionKV, sessionId);
  if (!sessionData || sessionData.role !== "admin") {
    throw redirect("/");
  }
  
  context.set(UserContext, sessionData);
};
```

## React Query 集成

### Query Keys 组织

```typescript
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};
```

### 使用示例

```typescript
// 查询
const { data: users, isLoading } = useUsers();

// 创建
const createUser = useCreateUser();
await createUser.mutateAsync({ email, name, password });
```

## 开发工具

### 种子数据（Seed）

生成测试数据用于开发调试：

```bash
# 生成测试用户
pnpm db:seed users 10        # 生成 10 个普通用户
pnpm db:seed users:admin 2   # 生成 2 个管理员用户

# 便捷命令
pnpm db:seed:users 5         # 生成 5 个普通用户
pnpm db:seed:admin 1         # 生成 1 个管理员

# 数据管理
pnpm db:seed clear           # 清空所有数据
pnpm db:seed stats           # 查看数据统计

# 帮助
pnpm db:seed help            # 显示帮助信息
```

> ⚠️ 默认测试密码：`123456`

### 数据库工具

```bash
# 启动 Drizzle Studio（可视化数据库管理）
pnpm db:studio

# 查看远程数据库
node scripts/check-remote-db.js

# 清空表数据
node scripts/clear-tables.js
```

### 构建分析

```bash
node scripts/analyze-build-size.js
```

## 相关文档

- [React Router 文档](https://reactrouter.com/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Alchemy 文档](https://alchemy.run/docs)

## License

MIT

---

Built with ❤️ using React Router + Alchemy
