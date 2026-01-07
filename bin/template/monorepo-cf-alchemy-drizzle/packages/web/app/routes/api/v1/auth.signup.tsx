import type { ActionFunctionArgs } from 'react-router';
import { handleSignup } from '~/features/auth/api/handlers';

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const data = await request.json();
    return handleSignup(data, context);
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export function loader() {
  return new Response('Method not allowed', { status: 405 });
}
