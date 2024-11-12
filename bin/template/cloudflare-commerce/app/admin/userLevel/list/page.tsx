import UserLevelList from '@/components/Admin/UserLevel'
import { getLevelSettings } from '@/services/actions/levelSettings'

export const runtime = 'edge'

export default async function Page() {
  const settings = await getLevelSettings()
  return <UserLevelList settings={settings} />
}
