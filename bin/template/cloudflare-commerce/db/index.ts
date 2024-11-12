import { getRequestContext } from '@cloudflare/next-on-pages'
import { drizzle } from 'drizzle-orm/d1'

import * as schema from '@/db/schema'

export function initDbConnection() {
  if (process.env.NODE_ENV === 'development') {
    const { env: requestEnv } = getRequestContext()

    // @ts-expect-error DB is exist
    return drizzle(requestEnv.DB, { schema })
  }

  return drizzle(process.env.DB as unknown as D1Database, { schema })
}

export function initQueue() {
  if (process.env.NODE_ENV === 'development') {
    const { env: requestEnv } = getRequestContext()

    // @ts-expect-error DB is exist
    return requestEnv.QUEUE
  }

  return process.env.QUEUE
}

export function initKV() {
  if (process.env.NODE_ENV === 'development') {
    const { env: requestEnv } = getRequestContext()

    // @ts-expect-error DB is exist
    return requestEnv.KV as KVNamespace
  }

  return process.env.KV as unknown as KVNamespace
}

export const db = initDbConnection()

export const queue = initQueue()

export const kv = initKV()
