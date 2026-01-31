# Project Guidelines for Claude

## Database Migration Rules (CRITICAL)

- **NEVER create migration SQL files manually** - All database schema changes MUST go through Drizzle's migration generation
- **Workflow**: Modify schema files in `packages/shared/src/database/` -> Run `pnpm db:generate` to generate migrations
- **DO NOT** create files like `0026_xxx.sql` by hand - Drizzle manages migration naming and tracking automatically

## Drizzle + Alchemy Migration Guide

### Architecture

- **Alchemy** manages Cloudflare Workers and D1 database (local: miniflare)
- **Drizzle** manages database schema and migrations
- **D1 Database** files located at: `.alchemy/miniflare/v3/d1/miniflare-D1DatabaseObject/<hash>.sqlite`
- **Migrations** stored in: `packages/web/drizzle/migrations/`

### Migration Auto-Apply

Alchemy's `D1Database` with `migrationsDir` auto-applies migrations on `pnpm dev`:

```typescript
const db = await D1Database("web-db", {
  migrationsDir: "./drizzle/migrations",
});
```

**No need to run `drizzle-kit migrate` manually.**

### Standard Workflow

1. **Modify Schema**: Edit `packages/shared/src/database/` schema files
2. **Build Shared**: Run `pnpm --filter @myapp/shared build`
3. **Generate Migration**: Run `pnpm db:generate` in root
4. **Apply Migration**: Run `pnpm dev:web` - Alchemy auto-applies

### Database Tools

```bash
pnpm db:studio     # Start Drizzle Studio
pnpm db:generate   # Generate migration from schema changes
```

## Shared D1 Architecture

### Local Development

All packages share `.alchemy/miniflare/` database:

| Package | How it connects |
|---------|-----------------|
| web | `rootDir: "../.."` in alchemy.run.ts |
| api | `rootDir: "../.."` + `adopt: true` |
| worker | `--persist-to=../../.alchemy/miniflare` |

### Production

1. Deploy `web` first (creates D1)
2. Get D1 database ID from Cloudflare dashboard
3. Update `api` and `worker` with database ID
4. Deploy remaining packages
