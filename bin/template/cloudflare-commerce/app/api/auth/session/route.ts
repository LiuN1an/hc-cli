import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { lucia } from '@/auth'

export const runtime = 'edge'

const handler = async (req: NextRequest) => {
  const sessionId = req.cookies.get(lucia.sessionCookieName)?.value ?? null

  if (!sessionId) {
    return NextResponse.json({ valid: false })
  }

  const { user, session } = await lucia.validateSession(sessionId)
  if (!session) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({ valid: true, user: user })
}

export { handler as GET }
