import { serialize } from 'next-mdx-remote/serialize'
import dynamic from 'next/dynamic'

import { validateRequest } from '@/auth.validate'
import UserLayout from '@/components/UserLayout'
import ProductDetail from '@/components/pages/product/[name]'
import HeadBar from '@/components/widgets/HeadBar'
import { getProductByName } from '@/services/actions/products'

export const runtime = 'edge'

interface PageProps {
  params: { name: string }
}

export default async function Page({ params }: PageProps) {
  const { name } = params
  const [{ user }, product] = await Promise.all([validateRequest(), getProductByName(name)])

  if (!product) {
    const NotFound = dynamic(() => import('@/components/NotFound/404'), {
      ssr: false,
    })
    return <NotFound title="Product not found" />
  }

  product.desc = (await serialize(product.desc || '')) as any
  return (
    <UserLayout>
      <HeadBar title="Fire Cricket" />
      <ProductDetail product={product} user={user} />
      <div className="h-24" />
    </UserLayout>
  )
}
