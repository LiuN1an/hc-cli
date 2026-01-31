# Monorepo Template

Cloudflare Workers monorepo with shared D1 database using **Alchemy** and **Wrangler**.

## Architecture

```
.
├── packages/
│   ├── shared/          # Database schema (Drizzle ORM)
│   ├── web/             # Primary D1 owner (Alchemy + React Router)
│   ├── api/             # Adopts D1 (Alchemy + React Router)
│   └── worker/          # Binds D1 (Wrangler native)
├── .alchemy/            # Local D1 database (auto-created)
└── package.json
```

## Key Concepts

### Shared D1 Database

All packages share the same D1 database:

| Package | Tool | D1 Strategy |
|---------|------|-------------|
| `@myapp/web` | Alchemy | **Creates** D1 with `migrationsDir` |
| `@myapp/api` | Alchemy | **Adopts** D1 with `adopt: true` |
| `@myapp/worker` | Wrangler | **Binds** D1 via `wrangler.jsonc` |

### Local Development

All packages connect to the same local SQLite database in `.alchemy/miniflare/`:

- **Alchemy packages** (`web`, `api`): Use `rootDir: "../.."` to share `.alchemy`
- **Wrangler packages** (`worker`): Use `--persist-to=../../.alchemy/miniflare`

### Admin Authentication

Simple header-based token authentication:

```bash
curl -H "x-admin-token: your-token" http://localhost:5173/api/v1/users
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Build shared package first
pnpm --filter @myapp/shared build

# Start web (creates D1 and runs migrations)
pnpm dev:web

# In another terminal, start worker
pnpm dev:worker
```

## Database Migrations

Migrations are managed in `packages/web` and auto-applied on startup:

```bash
# Modify schema in packages/shared/src/database/
# Then generate migration
pnpm db:generate

# Migrations auto-apply when running pnpm dev:web
```

## Production Deployment

1. **Deploy web first** (creates D1 database):
   ```bash
   pnpm deploy:web
   ```

2. **Note the D1 database ID** from Cloudflare dashboard

3. **Update api and worker** with the D1 database ID:
   - `api/alchemy.run.ts`: Update `name` in D1Database
   - `worker/wrangler.jsonc`: Update `database_id` in `env.production`

4. **Deploy remaining packages**:
   ```bash
   pnpm deploy:api
   pnpm deploy:worker
   ```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Required variables:
- `AUTH_TOKEN_KEY`: Header name for admin auth (default: `x-admin-token`)
- `AUTH_TOKEN_VALUE`: Token value for admin auth

## Package Details

### @myapp/shared

Database schema using Drizzle ORM:

```typescript
import { users } from "@myapp/shared/database";
```

### @myapp/web

Primary Alchemy package that creates the D1 database:

```typescript
const db = await D1Database("web-db", {
  migrationsDir: "./drizzle/migrations",
});
```

### @myapp/api

Secondary Alchemy package that adopts the D1 database:

```typescript
const db = await D1Database("api-db", {
  name: "web-web-db-development",  // Match web's database name
  adopt: true,
});
```

### @myapp/worker

Wrangler-native worker that binds to the same D1:

```jsonc
// wrangler.jsonc
"d1_databases": [{
  "binding": "DB",
  "database_name": "web-web-db-development"
}]
```

Local dev command uses `--persist-to` to share database:

```bash
wrangler dev --persist-to=../../.alchemy/miniflare
```
