import { NextRequest, NextResponse } from 'next/server'

import { isUser } from './lib/server/api'
import { ROOT } from './lib/common/const'

const redirect = (req: NextRequest) => NextResponse.redirect(new URL('/home', req.url))

const rootUrls = []

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const user = await isUser(req)
    if (!user) return redirect(req)

    if (rootUrls.some((url) => req.nextUrl.pathname.startsWith(url))) {
      if (user?.role === ROOT) {
        return NextResponse.next()
      } else {
        return redirect(req)
      }
    }

    if (user?.role !== 'user') {
      return NextResponse.next()
    } else {
      return redirect(req)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
