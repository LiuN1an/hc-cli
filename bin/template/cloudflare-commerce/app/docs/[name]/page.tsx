import { getTranslations } from 'next-intl/server'

import UserLayout from '@/components/UserLayout'
import HeadBar from '@/components/widgets/HeadBar'
import Test from '@/markdown/test.mdx'

export const runtime = 'edge'

export default async function Page() {
  const t = await getTranslations()
  return (
    <UserLayout className="bg-shallow">
      <HeadBar title="Fire Cricket" />
      <div className="my-4 ml-2 flex items-center gap-4 text-xs">
        <a className="cursor-pointer text-black outline-none" href="/home">
          {t('home')}
        </a>
        <span className="h-1 w-1 rounded-full bg-black" />
        <span>Docs</span>
      </div>
      <img
        className="w-full"
        src="https://www.hxs686.com/cdn/shop/articles/e7586c407ad542d7afd5e0f41f2bde31.jpg?v=1722348633&width=350"
      />
      <Test />
      <div className="h-20" />
    </UserLayout>
  )
}
