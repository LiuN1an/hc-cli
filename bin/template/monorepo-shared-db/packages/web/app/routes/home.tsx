import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Monorepo Template" },
    { name: "description", content: "Cloudflare D1 Monorepo Template" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Monorepo Template
        </h1>
        <p className="text-gray-600 mb-8">
          Alchemy + Wrangler + Shared D1 Database
        </p>
        <div className="space-y-2 text-left max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-4">Packages:</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">@myapp/web</code>
              <span className="text-gray-500 ml-2">- Primary D1 (Alchemy)</span>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">@myapp/api</code>
              <span className="text-gray-500 ml-2">- Adopts D1 (Alchemy)</span>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">@myapp/worker</code>
              <span className="text-gray-500 ml-2">- Binds D1 (Wrangler)</span>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">@myapp/shared</code>
              <span className="text-gray-500 ml-2">- Database Schema</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
