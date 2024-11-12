import type { Session } from 'lucia'
import { cookies } from 'next/headers'
import { cache } from 'react'

import { lucia } from './auth'
import { type User as DBUser } from './db/schema'

export const validateRequest = cache(
  async (): Promise<{ user: DBUser; session: Session } | { user: null; session: null }> => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
    if (!sessionId) {
      return {
        user: null,
        session: null,
      }
    }

    const result = await lucia.validateSession(sessionId)
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id)
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie()
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      }
    } catch {}

    if (result.session) {
      const user = result.user as DBUser
      return { ...result, user }
    }
    return result
  },
)
