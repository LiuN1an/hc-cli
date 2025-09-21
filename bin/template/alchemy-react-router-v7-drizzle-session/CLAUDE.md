# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern full-stack React application built with React Router v7, deployed on Cloudflare with Alchemy. It features server-side rendering, a SQLite database (Drizzle ORM), JWT authentication, and TailwindCSS styling.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with HMR (uses Alchemy)
- `npm run build` - Build for production
- `npm run typecheck` - Run TypeScript type checking (includes React Router typegen)
- `npm run preview` - Preview production build locally

### Database Commands
- `npm run db:generate` - Generate database migrations with Drizzle Kit
- `npm run db:migrate` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio for database inspection

### Deployment Commands
- `npm run deploy` - Deploy to Cloudflare using Alchemy
- `npm run destroy` - Destroy deployed resources
- `npx wrangler versions upload` - Deploy preview version
- `npx wrangler versions deploy` - Promote version to production

### Analysis Commands
- `npm run analyze:build` - Analyze build bundle size

## Architecture Overview

### Framework Stack
- **React Router v7** with SSR enabled and future flags (`unstable_viteEnvironmentApi`, `v8_middleware`)
- **Alchemy** for Cloudflare deployment and development tooling
- **Vite** as the build tool with TailwindCSS v4, TypeScript paths
- **Drizzle ORM** with SQLite (local development) / Cloudflare D1 (production)

### Authentication System
- **JWT-based authentication** using `@tsndr/cloudflare-worker-jwt`
- **Middleware-based authorization** at `app/middleware/auth.ts`
- **Session management** at `app/sessions.server.ts`
- **User context** propagated through React Router context system

### Database Schema
Located at `database/schema.ts`:
- **Users table** with roles: `buyer`, `vendor`, `admin`
- **Environment-specific configuration** in `drizzle.config.ts`
- **Development**: Uses local SQLite file or memory database
- **Production**: Uses Cloudflare D1 bindings

### Route Structure
**File-based routing** defined in `app/routes.ts`:
- **Page routes**: `/`, `/users`, `/auth-demo`, `/signup`, `/signin`
- **API routes**: `/api/v1/*` (user-permission, users, logout, validate)
- **System routes**: Catch-all `*` route

### State Management
- **React Query** (@tanstack/react-query) for server state with devtools
- **React Hot Toast** for notifications with dark theme styling
- **Global QueryClient** configured in `app/root.tsx`

## Important Development Patterns

### React Router Best Practices
The project follows strict separation of concerns (documented in `.cursor/rules/react-router-best-practices.md`):

1. **Middleware**: Page-level authorization only, uses `redirect()` for unauthorized access
2. **Loaders/Actions**: Pure data processing, never perform redirects
3. **Components**: Handle client-side navigation with `useNavigate()` or `<Navigate>`

### Action Response Format
All actions follow a standardized response format:
```typescript
// Success
{ success: true, data: T, message?: string }

// Error
{ success: false, error: string, code?: string, details?: any }
```

### Authentication Flow
1. **Page authorization**: Use `authMiddleware` in route middleware array
2. **JWT validation**: Automatic token verification and user context injection
3. **Database sync**: User data fetched from database on each request
4. **Error handling**: Automatic redirect to `/signin` on auth failures

## Environment Configuration

### Development Environment Detection
The project automatically detects environments:
- **Development**: `NODE_ENV !== 'production'` and not Cloudflare Pages
- **Production**: Cloudflare Pages deployment (`CF_PAGES === '1'`)

### Environment Files
- `.env.local` - Local development variables (loaded automatically in dev)
- `.env` - Shared environment variables
- Cloudflare environment variables handled through Wrangler/Alchemy

## Testing and Quality

### Type Checking
Always run `npm run typecheck` before committing changes. This includes:
- React Router type generation
- Full TypeScript compilation check

### Code Standards
- **TypeScript** throughout the codebase
- **Dark theme** UI design (gray-950 background, gray-100 text)
- **Chinese language support** (lang="zh-CN" in HTML)
- **Responsive design** with TailwindCSS

## Common Tasks

### Adding New Routes
1. Add route definition in `app/routes.ts`
2. Create route file in `app/routes/` directory
3. For protected routes, add `authMiddleware` to middleware array
4. Follow action/loader patterns documented in Cursor rules

### Database Changes
1. Modify `database/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply changes
4. Use `npm run db:studio` to inspect results

### API Development
1. Create new file in `app/routes/api/v1/`
2. Add route to `apiRoutes` array in `app/routes.ts` using `apiV1Route()` helper
3. Follow standardized response format
4. Return data objects, let components handle navigation