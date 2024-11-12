import { eq } from 'drizzle-orm'
import { cache } from 'react'

import { db } from '@/db'
import { users } from '@/db/schema'
import { generateInviteCode } from '@/lib/server/tools'

export const getUser = cache(async (email: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  return user
})

export const addRoleToUser = async (email: string, role: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })
  if (!user) throw new Error('User not exist')
}
