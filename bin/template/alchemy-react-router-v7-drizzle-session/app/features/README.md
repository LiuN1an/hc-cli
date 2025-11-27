# Features 目录

每个业务模块独立管理，遵循统一的目录结构。

## 目录结构

```
features/
├── auth/                 # 认证模块
│   ├── api/              # API handlers
│   │   └── handlers.ts   # 登录、注册、登出逻辑
│   ├── lib/              # 核心工具
│   │   ├── session.ts    # Session 管理
│   │   ├── crypto.ts     # 密码加密
│   │   └── client.ts     # 客户端工具
│   ├── middleware/       # 中间件
│   │   └── auth.ts       # 认证中间件
│   └── index.ts          # 模块导出
│
└── user/                 # 用户模块
    ├── api/              # API handlers
    │   └── handlers.ts   # 用户 CRUD 逻辑
    ├── database/         # 数据库
    │   ├── schema.ts     # Drizzle schema
    │   └── types.ts      # TypeScript 类型
    ├── hooks/            # React Query hooks
    │   └── use-users.ts  # 用户数据 hooks
    ├── server/           # 服务端工具
    │   └── utils.ts      # 数据库操作函数
    └── index.ts          # 模块导出
```

## 职责划分

| 层级 | 职责 | 运行环境 |
|------|------|----------|
| `database/` | Schema 定义、类型定义 | 通用 |
| `server/` | 数据库操作、业务逻辑 | 仅服务端 |
| `api/` | API handlers、请求处理 | 仅服务端 |
| `hooks/` | React Query hooks | 仅客户端 |
| `components/` | UI 组件 | 仅客户端 |
| `lib/` | 通用工具函数 | 视情况 |

## 使用方式

### 服务端（路由/API）

```typescript
import { handleLogin, handleSignup } from "~/features/auth";
import { handleGetUsers, handleCreateUser } from "~/features/user";
```

### 客户端（组件）

```typescript
import { useUsers, useCreateUser } from "~/features/user";
import { logout } from "~/features/auth";
```

## 添加新模块

1. 创建模块目录：`features/[module-name]/`
2. 按需创建子目录（database、server、api、hooks）
3. 创建 `index.ts` 统一导出
4. 在 `database/schema.ts` 中重新导出 schema
5. 在 `database/types.ts` 中重新导出类型

## 设计原则

- **高内聚**：模块内相关代码放在一起
- **低耦合**：模块间通过明确接口交互
- **单一入口**：通过 `index.ts` 统一导出
- **职责分离**：Route 只负责 HTTP，业务逻辑在 handlers
