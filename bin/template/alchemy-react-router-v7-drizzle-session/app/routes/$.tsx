// 通配符路由 - 处理所有未匹配的路径
export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  
  // 对于开发者工具和其他特殊路径，返回404而不是错误
  if (url.pathname.startsWith('/.well-known/') || 
      url.pathname.startsWith('/favicon.ico') ||
      url.pathname.startsWith('/__vite') ||
      url.pathname.includes('devtools')) {
    return new Response(null, { status: 404 });
  }
  
  // 对于其他路径，可以返回友好的404页面
  throw new Response("Page not found", { status: 404 });
}

// 默认导出一个简单的404组件（虽然通常不会被渲染，因为我们在loader中抛出了Response）
export default function CatchAll() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-4">Page not found</p>
        <a 
          href="/" 
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
