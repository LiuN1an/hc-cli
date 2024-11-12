import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import UserLayout from '@/components/UserLayout'
import HeadBar from '@/components/widgets/HeadBar'
import ProductsList from '@/components/widgets/ProductsList'
import { getProducts } from '@/services/actions/products'

export const runtime = 'edge'

export default async function Page() {
  const products = await getProducts()
  const p_t = await getTranslations()

  return (
    <UserLayout className="bg-shallow">
      <Suspense fallback={<></>}>
        <div className="min-h-screen">
          <HeadBar title="Fire Cricket" />
          <div className="flex flex-col items-center justify-center py-10">
            <span className="text-2xl font-extrabold uppercase">{p_t('products')}</span>
            <div className="flex items-center gap-4 text-xs">
              <a className="cursor-pointer text-black outline-none" href="/home">
                {p_t('home')}
              </a>
              <span className="h-1 w-1 rounded-full bg-black" />
              <span>{p_t('products')}</span>
            </div>
          </div>
          <ProductsList products={products} />
        </div>
      </Suspense>
    </UserLayout>
  )
}
