import { validateRequest } from '@/auth.validate'
import OrderList from '@/components/Admin/Order/List'

export const runtime = 'edge'

export default async function Page() {
  const { user } = await validateRequest()

  return <OrderList role={user!.role} />
}
