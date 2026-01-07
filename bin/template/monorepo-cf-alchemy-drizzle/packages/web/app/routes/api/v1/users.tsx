import type { LoaderFunctionArgs } from 'react-router';
import { users } from '@template/shared/database';
import { parsePagination, createPaginationMeta } from '@template/shared/utils';
import { adminAuthMiddleware } from '~/features/auth/middleware/auth';
import { count } from 'drizzle-orm';

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Require admin auth
  await adminAuthMiddleware(request, context);

  const url = new URL(request.url);
  const { page, pageSize, offset } = parsePagination(
    url.searchParams.get('page'),
    url.searchParams.get('pageSize')
  );

  // Get total count
  const [{ total }] = await context.db.select({ total: count() }).from(users);

  // Get paginated users
  const data = await context.db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt
    })
    .from(users)
    .limit(pageSize)
    .offset(offset);

  return Response.json({
    data,
    pagination: createPaginationMeta(page, pageSize, total)
  });
}
