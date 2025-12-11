---
description: React Router best practices focusing on separation of concerns between middleware, loaders/actions, and components
globs: ["**/*.tsx", "**/*.ts"]
alwaysApply: true
---
# React Router Best Practices: Separation of Concerns

## Core Principle: Separation of Concerns

React Router follows strict responsibility separation between middleware, loaders/actions, and components to ensure clean architecture and avoid common error patterns.

### 1. Middleware - Page-level Authorization
**Use for**: Authentication checks and redirects before page loads

```typescript
// ✅ Correct: Use middleware for page-level authorization
export const middleware: Route.MiddlewareFunction[] = [
  authMiddleware as Route.MiddlewareFunction,
];

// authMiddleware uses redirect() internally
import { redirect } from "react-router";
export const authMiddleware = ({ request, context }) => {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw redirect("/signin");
  }
  // Validate token and set user context
};
```

### 2. Loader/Action - Pure Data Processing
**Responsibility**: Fetch data (loader) and process data (action), never perform redirects
**Returns**: Only return data or error information to components

```typescript
// ✅ Correct: loader only returns data
export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get(UserContext); // middleware ensures user exists
  const { db } = context.get(EnvContext);
  const users = await db.select().from(usersTable);
  return { users, currentUser: user };
}

// ✅ Correct: action only returns operation results
export async function action({ request, context }: Route.ActionArgs) {
  const data = await request.json();
  const { email, password } = data;
  
  try {
    const user = await authenticateUser(email, password);
    const token = await createJWTToken(user);
    const authHeaders = createAuthHeaders(token);
    
    // Use Response.json(), automatically sets Content-Type
    return Response.json(
      { 
        success: true, 
        data: { user, token }
      },
      {
        status: 200,
        headers: authHeaders, // Can set cookies and other headers
      }
    );
  } catch (error) {
    // Return object directly on failure
    return { 
      success: false, 
      error: error.message,
      code: "AUTHENTICATION_FAILED"
    };
  }
}

// ❌ Wrong: Return 302 redirect in action
export async function action() {
  // ... processing logic
  return new Response(null, {
    status: 302,
    headers: { Location: "/" }, // This is wrong!
  });
}

// ❌ Wrong: Manual redirect in loader
export async function loader() {
  if (!hasPermission) {
    throw new Response(null, {
      status: 302,
      headers: { Location: "/signin" }, // This is wrong!
    });
  }
}
```

### 3. Components - User Interaction and Client-side Navigation
**Use for**: UI updates and client-side navigation based on data state
**Tools**: `useNavigate()`, `<Navigate>`, `useActionData()`

```typescript
// ✅ Correct: Handle navigation in components
export default function SigninPage() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  
  // Navigate based on action results
  useEffect(() => {
    if (actionData?.success) {
      navigate("/"); // Client-side navigation
    }
  }, [actionData, navigate]);

  return (
    <div>
      {actionData?.error && <div>{actionData.error}</div>}
      {/* Form content */}
    </div>
  );
}

// ✅ Correct: Conditional redirect
export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  
  return <div>Protected content</div>;
}
```

## Action Response Format Standards

### Standard Response Format
All actions should follow a unified response format to ensure consistent handling on the component side:

```typescript
// Success response format
interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string; // Optional success message
}

// Error response format  
interface ErrorResponse {
  success: false;
  error: string;   // User-friendly error message
  code?: string;   // Machine-readable error code
  details?: any;   // Optional detailed error information
}

// ✅ Success response with cookies (e.g., login/registration)
export async function loginAction({ request }: Route.ActionArgs) {
  try {
    const { email, password } = await request.json();
    const user = await authenticateUser(email, password);
    const token = await createJWTToken(user);
    const authHeaders = createAuthHeaders(token);
    
    return Response.json(
      {
        success: true,
        data: { user, token },
        message: "Login successful"
      },
      {
        status: 200,
        headers: authHeaders, // Set authentication cookies
      }
    );
  } catch (error) {
    return {
      success: false,
      error: "Invalid email or password",
      code: "INVALID_CREDENTIALS"
    };
  }
}

// ✅ Regular operation response (no special headers needed)
export async function createUserAction({ request }: Route.ActionArgs) {
  try {
    const userData = await request.json();
    const newUser = await createUser(userData);
    
    return {
      success: true,
      data: newUser,
      message: "User created successfully"
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to create user",
      code: "USER_CREATION_FAILED",
      details: error.message
    };
  }
}

// ✅ Validation failure response
export async function validateAction({ request }: Route.ActionArgs) {
  const formData = await request.json();
  
  if (!formData.email) {
    return {
      success: false,
      error: "Email is required",
      code: "MISSING_EMAIL"
    };
  }
  
  if (!isValidEmail(formData.email)) {
    return {
      success: false,
      error: "Invalid email format",
      code: "INVALID_EMAIL_FORMAT"
    };
  }
  
  // Validation passed
  return {
    success: true,
    data: { isValid: true },
    message: "Validation passed"
  };
}
```

### Component-side Handling Standards
```typescript
export default function MyPage() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (actionData?.success) {
      // Show success toast and navigate
      toast.success(actionData.message || "Operation successful");
      navigate("/success-page");
    } else if (actionData && !actionData.success) {
      // Show error toast on failure
      toast.error(actionData.error);
      
      // Navigate based on error code
      if (actionData.code === "UNAUTHORIZED") {
        navigate("/signin");
      }
    }
  }, [actionData, navigate]);
}
```

### Error Code Standards
Recommended unified error codes for easy handling:

```typescript
// Common error codes
const ERROR_CODES = {
  // Validation errors
  MISSING_FIELDS: "MISSING_FIELDS",
  INVALID_EMAIL_FORMAT: "INVALID_EMAIL_FORMAT", 
  PASSWORD_TOO_SHORT: "PASSWORD_TOO_SHORT",
  
  // Authentication errors
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  
  // Business logic errors
  EMAIL_EXISTS: "EMAIL_EXISTS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  
  // System errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const;
```

## Correct Approaches for Specific Scenarios

### Scenario 1: User redirect after login
```typescript
// ❌ Wrong: Return redirect in action
export async function action() {
  // Authenticate user...
  return new Response(null, { status: 302, headers: { Location: "/" } });
}

// ✅ Correct: Action returns data, component handles navigation
export async function action() {
  // Authenticate user...
  return { success: true, user };
}

export default function SigninPage() {
  const actionData = useActionData();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (actionData?.success) {
      navigate("/");
    }
  }, [actionData]);
}
```

### Scenario 2: Page requires login permission
```typescript
// ❌ Wrong: Check permission in loader
export async function loader() {
  if (!hasToken) {
    throw new Response(null, { status: 302, headers: { Location: "/signin" } });
  }
}

// ✅ Correct: Use middleware
export const middleware = [authMiddleware];
export async function loader({ context }) {
  const user = context.get(UserContext); // middleware ensures existence
  return { user };
}
```

### Scenario 3: Handling operation failures
```typescript
// ❌ Wrong: Direct redirect to error page in action
export async function action() {
  try {
    // Operation...
  } catch (error) {
    return new Response(null, { status: 302, headers: { Location: "/error" } });
  }
}

// ✅ Correct: Return error info, let component decide how to handle
export async function action() {
  try {
    // Operation...
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default function MyPage() {
  const actionData = useActionData();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (actionData?.success === false && actionData.error === 'CRITICAL_ERROR') {
      navigate("/error");
    }
  }, [actionData]);
}
```

## Forbidden Patterns

1. **Manually creating Response objects for redirects in loader/action**
2. **Returning 302 status codes in actions**
3. **Mixing server-side redirects with client-side navigation logic**
4. **Duplicating middleware permission checks in loader/action**

## Decision Flow

When encountering scenarios that need redirects, ask yourself:

1. **Is this page-level authorization?** → Use middleware
2. **Is this the result of user action?** → Action returns data, component handles navigation
3. **Is this conditional navigation based on data state?** → Use Navigate or useNavigate in component
4. **Is this data fetching failure?** → Loader returns error data, component handles it

## Best Practices Summary
- Middleware handles page-level authorization and server-side redirects
- Loaders/actions focus on pure data processing, never redirect
- Components handle UI updates and client-side navigation
- Follow standardized response formats for consistent error handling
- Use specific error codes for different failure scenarios
- Remember: React Router is client-side first - prefer client navigation
