import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  if (
    req.cookies.get(process.env.ADMIN_COOKIE_KEY)?.value !=
    process.env.ADMIN_COOKIE_VALUE
  ) {
    return NextResponse.redirect(
      new URL("/api/auth/unauthorized", req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*"],
};
