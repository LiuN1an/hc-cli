---
description: React Query integration patterns and best practices for API operations
globs: ["app/hooks/**/*.ts", "app/routes/**/*.tsx", "app/lib/**/*.ts"]
alwaysApply: true
---
# React Query Integration Patterns Guide

## Core Architecture
Three-tier architecture with React Query + API Client + Custom Hooks, ensuring type safety and consistency.

## API Client Foundation Layer
```typescript
// app/lib/api-client.ts - Unified API request handling
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Generic API request function
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api/v1/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new ApiError(
        response.status,
        data.code || 'UNKNOWN_ERROR',
        data.error || 'Request failed'
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      error instanceof Error ? error.message : 'Network connection failed'
    );
  }
}

// HTTP method wrappers
export function apiGet<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

export function apiPost<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}
```

## Query Keys Management Pattern
```typescript
// app/hooks/use-users.ts - Hierarchical Query Keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  permissions: () => [...userKeys.all, 'permissions'] as const,
  permission: (email: string) => [...userKeys.permissions(), email] as const,
};

// Query Keys for other resources
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
};
```

## Type Definition Patterns
```typescript
// Data type definitions
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'buyer' | 'vendor' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserPermission {
  user: User;
  permissions: string[];
  role_description: string;
}

// Operation data types
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
  role?: 'buyer' | 'vendor' | 'admin';
}

export interface UpdateUserData {
  name?: string;
  role?: 'buyer' | 'vendor' | 'admin';
}
```

## Query Hooks Patterns

### Basic Query Hooks
```typescript
// Fetching list data
export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: () => apiGet<User[]>('users'),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
  });
}

// Fetching detail data
export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => apiGet<User>(`users/${id}`),
    enabled: !!id, // Only execute when id exists
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}
```

### Conditional Query Hooks
```typescript
// Queries that require parameters
export function useUserPermissions(email: string) {
  return useQuery({
    queryKey: userKeys.permission(email),
    queryFn: () => {
      const params = new URLSearchParams({ email });
      return apiGet<UserPermission>(`user-permission?${params.toString()}`);
    },
    enabled: !!email && email.includes('@'), // Conditional enablement
    staleTime: 5 * 60 * 1000,
  });
}

// Paginated queries
export function useUsersPaginated(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: userKeys.list(`page-${page}-limit-${limit}`),
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      return apiGet<{users: User[], total: number}>(`users?${params.toString()}`);
    },
    keepPreviousData: true, // Keep previous page data
    staleTime: 30 * 1000, // 30 seconds cache
  });
}
```

## Mutation Hooks Patterns

### Basic Mutation Hooks
```typescript
export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: CreateUserData) => apiPost<User>('users', userData),
    onSuccess: (newUser) => {
      // Update list cache
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Optional: directly update cache without refetching
      queryClient.setQueryData(userKeys.detail(newUser.id), newUser);
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) => 
      apiPut<User>(`users/${id}`, data),
    onSuccess: (updatedUser, variables) => {
      // Update detail cache
      queryClient.setQueryData(userKeys.detail(variables.id), updatedUser);
      
      // Update list cache
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => apiDelete(`users/${id}`),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: userKeys.detail(deletedId) });
      
      // Update list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

### Manual Query Trigger Hooks
```typescript
export function useUserPermissionQuery() {
  const queryClient = useQueryClient();
  
  const queryPermissions = async (email: string) => {
    if (!email || !email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    
    return queryClient.fetchQuery({
      queryKey: userKeys.permission(email),
      queryFn: () => {
        const params = new URLSearchParams({ email });
        return apiGet<UserPermission>(`user-permission?${params.toString()}`);
      },
      staleTime: 0, // Refetch every time
    });
  };
  
  return { queryPermissions };
}
```

## Component Usage Patterns

### Query Data Display
```typescript
function UsersList() {
  const { data: users, isLoading, error } = useUsers();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Loading failed: {error.message}</div>;
  
  return (
    <div>
      {users?.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
```

### Data Mutation Operations
```typescript
function CreateUserForm() {
  const createUser = useCreateUser();
  
  const handleSubmit = async (formData: CreateUserData) => {
    try {
      await createUser.mutateAsync(formData);
      toast.success('User created successfully');
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createUser.isPending}
      >
        {createUser.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

### Manual Query Trigger
```typescript
function UserPermissionChecker() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const { queryPermissions } = useUserPermissionQuery();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const data = await queryPermissions(email);
      setResult({ success: true, data });
    } catch (error) {
      if (error instanceof ApiError) {
        setResult({ 
          success: false, 
          error: error.message,
          code: error.code 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email address"
      />
      <button onClick={handleCheck} disabled={isLoading}>
        {isLoading ? 'Checking...' : 'Check Permissions'}
      </button>
      {result && <ResultDisplay result={result} />}
    </div>
  );
}
```

## Caching Strategies
```typescript
// Cache time strategies for different data types
const cacheStrategies = {
  // User data - changes infrequently
  users: 2 * 60 * 1000,        // 2 minutes
  
  // Permission data - relatively stable
  permissions: 5 * 60 * 1000,   // 5 minutes
  
  // Product data - changes frequently
  products: 30 * 1000,          // 30 seconds
  
  // Order data - requires real-time updates
  orders: 10 * 1000,            // 10 seconds
  
  // Statistics data - can be cached longer
  statistics: 10 * 60 * 1000,   // 10 minutes
};
```

## Error Handling Patterns
```typescript
// Global error handling
function useGlobalErrorHandler() {
  return (error: unknown) => {
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'UNAUTHORIZED':
          // Redirect to login page
          break;
        case 'FORBIDDEN':
          toast.error('Insufficient permissions');
          break;
        case 'NETWORK_ERROR':
          toast.error('Network connection failed, please check your connection');
          break;
        default:
          toast.error(error.message);
      }
    } else {
      toast.error('Unknown error');
    }
  };
}

// Using in Mutations
export function useCreateUser() {
  const handleError = useGlobalErrorHandler();
  
  return useMutation({
    mutationFn: (userData: CreateUserData) => apiPost<User>('users', userData),
    onError: handleError,
  });
}
```

## Performance Optimization
- Set reasonable `staleTime` to avoid frequent requests
- Use `enabled` conditions to control query execution
- Utilize `keepPreviousData` to improve pagination experience
- Use `setQueryData` timely to update cache directly
- Use `queryClient.invalidateQueries` for batch operations to refresh related data