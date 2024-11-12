import bcrypt from 'bcrypt-edge'
import { AnyColumn, InferSelectModel, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

import { actives } from '@/db/schema'
import type { ReturnOfFunction } from '@/types/server'

export type ActiveTable = InferSelectModel<typeof actives>

export function passwordToSalt(password: string) {
  const saltRounds = 10
  const hash = bcrypt.hashSync(password, saltRounds)
  return hash
}

export const generateInviteCode = () => {
  return nanoid(6)
}

export const validActive = (active?: ActiveTable) => {
  if (!active) throw new Error(`Invalid active`)
  if (active.freeze) {
    throw new Error('Sorry, the active is frozen')
  }
  return active as ActiveTable
}

export const increment = (column: AnyColumn, value = 1, isRound = true) => {
  return isRound ? sql`ROUND(${column} + ${value}, 2)` : sql`${column} + ${value}`
}

export const reduction = (column: AnyColumn, value = 1, isRound = true) => {
  return isRound ? sql`ROUND(${column} - ${value}, 2)` : sql`${column} - ${value}`
}

export const sleep = async (time: number) => {
  const promise = new Promise((resolve) =>
    setTimeout(() => {
      resolve(null)
    }, time),
  )
  return await promise
}

export const timestamp = () => sql`(unixepoch())`
