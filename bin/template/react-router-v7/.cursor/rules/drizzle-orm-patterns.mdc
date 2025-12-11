---
description: Drizzle ORM database operation patterns and best practices
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: true
---
# Drizzle ORM Database Operation Guide

## Core Principles
Database access is unified through React Router contexts, following type safety, error handling, and performance optimization principles.

## Database Context Access
```typescript
// Get database instance from React Router context via EnvContext
import { EnvContext } from "~/context";

export async function loader({ context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);
  const result = await db.select().from(users);
  return { data: result };
}

export async function action({ context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  await db.insert(users).values(userData);
}
```

## Context Setup Pattern
```typescript
// workers/app.ts - Application entry point
import { drizzle } from "drizzle-orm/d1";
import { EnvContext } from "~/context";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const db = drizzle(env.DB, { schema });
    
    const _rootContext = new RouterContextProvider();
    _rootContext.set(EnvContext, { cloudflare: { env, ctx }, db });
    return requestHandler(request, _rootContext);
  },
};
```

## Context Type Definitions
```typescript
// app/context.ts
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { createContext } from "react-router";
import * as schema from "@/schema";
import type { PublicUser } from "@/types";

export const EnvContext = createContext<{
  cloudflare: { env: Env; ctx: ExecutionContext };
  db: DrizzleD1Database<typeof schema>;
}>();

export const UserContext = createContext<PublicUser | null>(null);
```

## Schema Definition Pattern
```typescript
// database/schema.ts - Follow project conventions
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  role: text('role', { enum: ['buyer', 'vendor', 'admin'] }).default('buyer').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updated_at: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});
```

## CRUD Operation Patterns

### Query Operations
```typescript
// Query all records with explicit field selection
export async function loader({ context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);
  
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users);
    
  return { users: allUsers };
}

// Conditional query
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

// Check if record exists
const existingUser = await db
  .select()
  .from(users)
  .where(eq(users.email, email))
  .limit(1);

if (existingUser.length > 0) {
  // Handle existing case
}
```

### Insert Operations
```typescript
// Create new record with specified return fields
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  
  const newUser = await db
    .insert(users)
    .values({
      email,
      name,
      password, // Should be hashed in production
      role: role || 'buyer',
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    });

  return newUser[0]; // Return the created record
}
```

### Update Operations
```typescript
const updatedUser = await db
  .update(users)
  .set({ 
    name: newName,
    updated_at: sql`CURRENT_TIMESTAMP`
  })
  .where(eq(users.id, userId))
  .returning({
    id: users.id,
    name: users.name,
    updated_at: users.updated_at,
  });
```

### Delete Operations
```typescript
const deletedUser = await db
  .delete(users)
  .where(eq(users.id, userId))
  .returning({ id: users.id });
```

## Error Handling Pattern
```typescript
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  
  try {
    const result = await db.insert(users).values(userData);
    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Database operation failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
```

## Data Validation Pattern
```typescript
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  const data = await request.json();
  const { email, name, password, role = "buyer" } = data;

  // Required field validation
  if (!email || !name || !password) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "All fields are required",
        code: "MISSING_FIELDS",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid email format",
        code: "INVALID_EMAIL_FORMAT",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Uniqueness validation
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Email already registered",
        code: "EMAIL_EXISTS",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

## Reusable Utility Functions
```typescript
// app/lib/db-utils.ts
import type { DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "@/schema";

export type DatabaseType = DrizzleD1Database<typeof schema>;

/**
 * Find user by ID
 */
export async function getUserById(db: DatabaseType, id: number): Promise<PublicUser | null> {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Find user by email (without password)
 */
export async function getUserByEmail(db: DatabaseType, email: string): Promise<PublicUser | null> {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
}

/**
 * Create user data type
 */
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: 'buyer' | 'vendor' | 'admin';
}

/**
 * Create new user
 */
export async function createUser(db: DatabaseType, userData: CreateUserData): Promise<PublicUser> {
  const result = await db
    .insert(users)
    .values({
      email: userData.email,
      name: userData.name,
      password: userData.password,
      role: userData.role || 'buyer',
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      created_at: users.created_at,
      updated_at: users.updated_at,
    });

  return result[0];
}

/**
 * Check if email exists
 */
export async function checkEmailExists(db: DatabaseType, email: string): Promise<boolean> {
  const result = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result.length > 0;
}
```

## Middleware Pattern with Context
```typescript
// app/middleware/auth.ts
import { redirect, type MiddlewareFunction } from "react-router";
import { UserContext, EnvContext } from "~/context";
import { getUserById } from "~/lib/db-utils";

export const authMiddleware: MiddlewareFunction = async ({
  request,
  context,
}) => {
  const { db } = context.get(EnvContext);

  // Get JWT token from request
  const token = getTokenFromRequest(request);
  if (!token) {
    throw redirect("/signin");
  }

  // Verify JWT token
  const payload = await verifyJWTToken(token);
  if (!payload) {
    throw redirect("/signin");
  }

  // Get latest user info from database
  const user = await getUserById(db, payload.userId);
  if (!user) {
    throw redirect("/signin");
  }

  // Set user info in context
  context.set(UserContext, user);
};
```

## Performance Optimization
- Use `.limit(1)` when only one record is needed
- Explicitly specify `select` fields to avoid querying unnecessary data
- Exclude sensitive fields (like passwords) from queries
- Use indexed fields for query conditions

## Security Considerations
- Exclude sensitive fields (passwords) from query results
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Hash passwords and other sensitive data

## Type Safety
```typescript
// Define clear type interfaces
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: 'buyer' | 'vendor' | 'admin';
}

// Use typed database operations
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  const data = await request.json();
  
  const userData: CreateUserData = {
    email: data.email,
    name: data.name,
    password: data.password,
    role: data.role || "buyer",
  };
  
  // Type-safe database operations
  const newUser = await createUser(db, userData);
  return { success: true, data: newUser };
}
```