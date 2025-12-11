---
description: API route design patterns and decision guidelines for multi-vendor marketplace
globs: ["app/routes/**/*.tsx"]
alwaysApply: true
---
# API Route Design Decision Guide

## Core Decision Principles
Determine whether to use standalone API routes or page-internal actions based on operation scope and user roles.

## Decision Flow Chart
```
Operation Request
    ↓
Is it used across pages/roles?
    ↓               ↓
   Yes              No
    ↓               ↓
Standalone API Route    Page-internal action
(/api/v1/*)            (same file action)
```

## Scenarios for Standalone API Routes

### 1. Cross-Role Shared Operations
```typescript
// app/routes/api/v1/users.tsx - Admin, vendor, buyer all may need user info
import { EnvContext } from "~/context";

export async function loader({ context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);
  
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    })
    .from(users);

  return new Response(JSON.stringify({
    success: true,
    data: allUsers,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
```

### 2. Cross-Page Reusable Operations
```typescript
// app/routes/api/v1/user-permission.tsx - Multiple pages need user permission queries
import { EnvContext } from "~/context";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  
  // Permission query logic...
  const userPermission = await getUserPermission(db, email);
  
  return new Response(JSON.stringify({
    success: true,
    data: userPermission,
  }), {
    headers: { "Content-Type": "application/json" },
  });
}
```

### 3. Third-Party Integration or External Calls
```typescript
// app/routes/api/v1/webhooks/payment.tsx - Payment callbacks
import { EnvContext } from "~/context";

export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  
  // Handle payment platform callback
  const paymentData = await request.json();
  // Update order status...
  await db.update(orders).set({ status: 'paid' }).where(eq(orders.id, paymentData.orderId));
}
```

## Scenarios for Page-Internal Actions

### 1. Page-Specific Operations
```typescript
// app/routes/users.tsx - Create user operation only used in user management page
import { EnvContext } from "~/context";

export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    // Create user logic, only used on this page
    const userData = extractUserData(formData);
    await db.insert(users).values(userData);
    
    return {
      success: true,
      message: "User created successfully",
    };
  }
}
```

### 2. Role-Specific Page Operations
```typescript
// app/routes/vendor/products.tsx - Vendor-specific product management
import { EnvContext } from "~/context";

export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "toggle-status") {
    // Toggle product status, only used on vendor product page
    const productId = formData.get("productId");
    await db.update(products).set({ status: 'inactive' }).where(eq(products.id, productId));
  }
}
```

## API Response Format Standards

### Success Response
```typescript
return new Response(JSON.stringify({
  success: true,
  data: result,
}), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});
```

### Error Response
```typescript
return new Response(JSON.stringify({
  success: false,
  error: "User-friendly error message",
  code: "SPECIFIC_ERROR_CODE",
}), {
  status: 400, // Appropriate HTTP status code
  headers: { "Content-Type": "application/json" },
});
```

### Page-Internal Action Response
```typescript
// Success
return {
  success: true,
  message: "Operation successful",
  data: result,
};

// Error
return {
  success: false,
  error: "Error message",
};
```

## HTTP Method Usage Standards

### Standalone API Routes
```typescript
// GET - Query data
export async function loader({ request, context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);
  // Query logic
}

// POST/PUT/DELETE - Data mutations
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  const method = request.method;
  
  switch (method) {
    case "POST":
      // Create resource
      const data = await request.json();
      await db.insert(table).values(data);
      break;
    case "PUT":
      // Update resource
      const updateData = await request.json();
      await db.update(table).set(updateData).where(eq(table.id, id));
      break;
    case "DELETE":
      // Delete resource
      await db.delete(table).where(eq(table.id, id));
      break;
    default:
      return new Response(JSON.stringify({
        success: false,
        error: "Unsupported HTTP method",
        code: "METHOD_NOT_ALLOWED",
      }), { status: 405 });
  }
}
```

### Page-Internal Actions
```typescript
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  
  switch (intent) {
    case "create":
      // Create operation
      const createData = extractFormData(formData);
      await db.insert(table).values(createData);
      break;
    case "update":
      // Update operation
      const updateData = extractFormData(formData);
      await db.update(table).set(updateData).where(eq(table.id, id));
      break;
    case "delete":
      // Delete operation
      const deleteId = formData.get("id");
      await db.delete(table).where(eq(table.id, deleteId));
      break;
    default:
      return { error: "Invalid operation" };
  }
}
```

## URL Design Patterns

### Standalone API Routes
```
/api/v1/users              - User-related operations
/api/v1/user-permission    - User permission queries
/api/v1/products           - Product-related operations
/api/v1/orders             - Order-related operations
/api/v1/webhooks/*         - External callbacks
```

### Page Routes
```
/users                     - User management page
/vendor/products           - Vendor product management
/buyer/orders              - Buyer order management
```

## Error Handling Patterns

### API Route Error Handling
```typescript
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  
  try {
    const data = await request.json();
    const result = await db.insert(table).values(data).returning();
    
    return new Response(JSON.stringify({
      success: true,
      data: result,
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API operation failed:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

### Page Action Error Handling
```typescript
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  
  try {
    const formData = await request.formData();
    const result = await db.insert(table).values(extractFormData(formData));
    
    return {
      success: true,
      message: "Operation successful",
      data: result,
    };
  } catch (error) {
    console.error("Page operation failed:", error);
    return {
      success: false,
      error: "Operation failed, please try again",
    };
  }
}
```

## Permission Validation Patterns

### API Route Permission Validation
```typescript
export async function loader({ request, context }: Route.LoaderArgs) {
  const { db } = context.get(EnvContext);
  
  // Get user info from request (JWT, Session, etc.)
  const user = await getCurrentUser(request, db);
  
  if (!user || !hasPermission(user, 'READ_USERS')) {
    return new Response(JSON.stringify({
      success: false,
      error: "Insufficient permissions",
      code: "INSUFFICIENT_PERMISSIONS",
    }), { status: 403 });
  }
  
  // Execute operations...
  const users = await db.select().from(usersTable);
  return new Response(JSON.stringify({ success: true, data: users }));
}
```

### Page Action Permission Validation
```typescript
export async function action({ request, context }: Route.ActionArgs) {
  const { db } = context.get(EnvContext);
  
  // Page-level permissions are usually validated in loaders
  // Actions handle specific operation permissions
  const user = await getCurrentUser(request, db);
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "delete" && user.role !== "admin") {
    return {
      success: false,
      error: "Only administrators can delete users",
    };
  }
  
  // Execute operation...
  const userId = formData.get("userId");
  await db.delete(usersTable).where(eq(usersTable.id, userId));
  
  return {
    success: true,
    message: "User deleted successfully",
  };
}
```

## Performance Considerations
- Standalone API routes are suitable for caching and CDN optimization
- Page-internal actions reduce network requests and improve user experience
- Complex queries should prioritize standalone APIs for easier optimization and monitoring
- Simple form operations should use page actions to reduce complexity