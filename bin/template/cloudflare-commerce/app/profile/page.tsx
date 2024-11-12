import { getLocale } from 'next-intl/server'
import dynamic from 'next/dynamic'

import { validateRequest } from '@/auth.validate'
import UserLayout from '@/components/UserLayout'
import LangSwitcher from '@/components/widgets/LangSwitcher'
import { getActive, getLock } from '@/services/actions'
import { getLevelSettingByUserId } from '@/services/actions/levelSettings'
import { getNotAcceptOrder } from '@/services/actions/orders'

export const runtime = 'edge'

const PersonContent = async () => {
  const { user } = await validateRequest()

  if (user) {
    const [lock, active, [{ count }], level] = await Promise.all([
      getLock(user.id),
      getActive(user.id),
      getNotAcceptOrder(user.id),
      getLevelSettingByUserId(user.id),
    ])

    const PersonInfo = dynamic(() => import('@/components/Profile/info'), {
      ssr: false,
    })

    return (
      <PersonInfo user={user} lock={lock?.count} active={active?.count} count={count} level={level!.levelSetting!} />
    )
  } else {
    const PersonLogin = dynamic(() => import('@/components/Profile/login'), {
      ssr: false,
    })
    return <PersonLogin />
  }
}
export default async function Person() {
  const locale = await getLocale()

  return (
    <UserLayout className="bg-shallow">
      <div className="fixed bottom-16 left-0 right-0">
        <div className="flex justify-end md:m-auto md:max-w-[375px]">
          <div className="inline-flex items-center justify-center bg-white p-2 px-6 shadow-md">
            <LangSwitcher defaultValue={locale} />
          </div>
        </div>
      </div>
      <PersonContent />
    </UserLayout>
  )
}
