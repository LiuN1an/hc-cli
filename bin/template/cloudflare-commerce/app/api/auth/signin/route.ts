import bcrypt from 'bcrypt-edge'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { lucia } from '@/auth'
import { validEmail, validPassword } from '@/lib/common'
import { ErrorResponse } from '@/lib/server/api'
import { passwordToSalt } from '@/lib/server/tools'
import {  getUser } from '@/services/actions/users'

export const runtime = 'edge'

export const POST = async (req: NextRequest) => {
  const { email, password, inviteBy } = await req.json<Record<string, string>>()
  if (!email || !password) return NextResponse.json({ message: 'Email or password is empty' }, { status: 400 })

  // Password validation: at least 8 characters, must contain letters and numbers
  if (!validPassword(password)) {
    return ErrorResponse(new Error('Password must be at least 8 characters and contain both letters and numbers'))
  }

  if (email !== 'admin') {
    if (!validEmail(email)) {
      return ErrorResponse(new Error('Invalid email format'))
    }
  }

  try {
    let user = await getUser(email)
    if (user) {
      const isAuthenciated = bcrypt.compareSync(password, user.password || '')
      if (!isAuthenciated) return NextResponse.json({ message: 'Password is wrong' }, { status: 400 })
    } else {
      const saltedPassword = passwordToSalt(password)
    }

    const session = await lucia.createSession(user.id, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    return NextResponse.json({ message: 'ok' })
  } catch (e) {
    return ErrorResponse(e)
  }
}
