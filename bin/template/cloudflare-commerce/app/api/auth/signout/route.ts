import { NextResponse } from 'next/server'

import { lucia } from '@/auth'
import { authUser } from '@/lib/server/api'
import { NextAuthRequest } from '@/types/server'

export const runtime = 'edge'

export const POST = authUser(async (req: NextAuthRequest) => {
  const { request } = req
  const sessionId = request.cookies.get(lucia.sessionCookieName)?.value ?? null

  if (!sessionId) {
    return NextResponse.json({ valid: false }, { status: 404 })
  }

  await lucia.invalidateSession(sessionId)

  return NextResponse.json({ message: 'Signout successfully' })
})
