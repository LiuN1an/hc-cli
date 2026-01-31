import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "API Service - Monorepo Template" },
    { name: "description", content: "API service using shared D1 database" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          API Service
        </h1>
        <p className="text-blue-600 mb-8">
          Alchemy (adopts D1 from @myapp/web)
        </p>
        <div className="bg-white p-6 rounded-lg shadow max-w-md mx-auto">
          <h2 className="font-semibold text-lg mb-4">Endpoints:</h2>
          <ul className="space-y-2 text-sm text-left">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">GET /api/v1/health</code>
              <span className="text-gray-500 ml-2">- Health check</span>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">GET /api/v1/users</code>
              <span className="text-gray-500 ml-2">- List users (admin)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
