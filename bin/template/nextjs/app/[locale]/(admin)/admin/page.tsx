/**
 * Admin Dashboard 页面
 * 
 * 演示 Admin 路由组的基本结构
 */

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value="1,234" />
        <StatCard title="Active Sessions" value="56" />
        <StatCard title="Revenue" value="$12,345" />
      </div>
      
      <div className="mt-8 p-6 rounded-lg border bg-card">
        <h2 className="text-xl font-semibold mb-4">Admin 路由鉴权说明</h2>
        <p className="text-muted-foreground mb-4">
          Admin 路由通过 middleware.ts 进行鉴权保护。
          默认情况下，需要在请求头中携带 <code className="px-1 bg-muted rounded">auth_admin</code> 字段，
          其值需要与环境变量 <code className="px-1 bg-muted rounded">ADMIN_AUTH_TOKEN</code> 匹配。
        </p>
        <p className="text-muted-foreground">
          你可以在 middleware.ts 中修改鉴权逻辑，例如使用 cookie/session 或 JWT 鉴权。
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

