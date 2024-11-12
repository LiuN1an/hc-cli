import { NextRequest, NextResponse } from 'next/server'

import { lucia } from '@/auth'
import { User } from '@/db/schema'
import { NextAuthRequest } from '@/types/server'

export const ErrorResponse = (e: any) => NextResponse.json({ message: e.message }, { status: 400 })

export const R2 = (path: string) => `${process.env.R2_HOST}${path}`

export const NotAllow = () => NextResponse.json({ message: 'Not Allowed' }, { status: 401 })

const isAdmin = async (req: NextRequest) => {
  const sessionId = req.cookies.get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) return false
  const { user } = (await lucia.validateSession(sessionId)) as any
  if (user?.role === 'user') {
    return false
  }
  return true
}

export const isUser = async (req: NextRequest) => {
  const sessionId = req.cookies.get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) return false
  const { user } = (await lucia.validateSession(sessionId)) as any as { user: User }
  if (!user) return false
  return user
}

export const auth = (fn: (req: NextRequest, res: NextResponse) => Promise<any>) => {
  return async (req: NextRequest, res: NextResponse) => {
    const admin = await isAdmin(req)
    if (!admin) return NotAllow()

    return await fn(req, res)
  }
}

export const authUser = (fn: (req: NextAuthRequest, res: NextResponse) => Promise<any>) => {
  return async (req: NextRequest, res: NextResponse) => {
    const user = await isUser(req)
    if (!user) return NotAllow()

    return await fn({ request: req, user }, res)
  }
}

export const calculateDaysUntilNow = (target_date: Date) => {
  const currentDate = new Date()
  const updatedAtDate = target_date
  // Set the time to the start of the day (00:00:00) for updatedAtDate
  updatedAtDate.setHours(0, 0, 0, 0)
  // Calculate the second day after updatedAtDate
  const secondDayStart = new Date(updatedAtDate)
  secondDayStart.setDate(secondDayStart.getDate() + 1)
  // Calculate the difference in time using getTime() method
  const timeDifference = currentDate.getTime() - secondDayStart.getTime()
  // Calculate the number of days that have passed
  const daysPassed = Math.floor(timeDifference / (1000 * 60 * 60 * 24))
  // If daysPassed is negative, it means we haven't reached the second day yet
  const totalDays = daysPassed < 0 ? 0 : daysPassed + 1 // Add 1 to count today as a day
  return totalDays
}
