# API 路由结构

这个文件夹包含所有的API路由文件，按版本组织。

## 文件夹结构

```
app/routes/api/
├── README.md           # 本说明文件
├── v1/                 # API v1版本
│   ├── user-permission.tsx  # 用户权限查询API
│   └── ...             # 其他v1 API文件
└── v2/                 # 未来的API v2版本
    └── ...
```

## API路由特点

- **纯API路由**: 只导出 `loader` 和/或 `action` 函数，不导出React组件
- **版本控制**: 使用文件夹按版本组织 (v1, v2, ...)
- **统一响应格式**: 所有API使用JSON格式响应
- **错误处理**: 统一的错误码和错误信息格式

## 添加新的API路由

1. 在相应版本文件夹中创建新的 `.tsx` 文件
2. 在 `app/routes.ts` 中使用 `apiV1Route("endpoint-name")` 添加路由配置
3. 实现 `loader` (GET请求) 和/或 `action` (POST/PUT/DELETE请求) 函数

## 示例

```typescript
// app/routes/api/v1/example.tsx
export async function loader({ request, context }) {
  // GET /api/v1/example
  return new Response(JSON.stringify({ message: "Hello" }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function action({ request, context }) {
  // POST/PUT/DELETE /api/v1/example
  const data = await request.json();
  // 处理数据...
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
}
```

然后在 `app/routes.ts` 中添加：

```typescript
const apiRoutes = [
  apiV1Route("example"),  // 对应 /api/v1/example
  // ...其他路由
];
```
