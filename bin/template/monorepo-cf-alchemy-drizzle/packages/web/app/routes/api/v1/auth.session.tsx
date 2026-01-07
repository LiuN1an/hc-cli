import type { LoaderFunctionArgs } from 'react-router';
import { handleValidateSession } from '~/features/auth/api/handlers';

export async function loader({ request, context }: LoaderFunctionArgs) {
  return handleValidateSession(request, context);
}
