import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { handleLogout } from '~/features/auth/api/handlers';

export async function action({ request, context }: ActionFunctionArgs) {
  return handleLogout(request, context);
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  return handleLogout(request, context);
}
