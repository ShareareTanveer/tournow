import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const ADMIN_ROUTES = ['/admin']
const PUBLIC_API_ROUTES = [
  '/api/packages',
  '/api/destinations',
  '/api/reviews',
  '/api/news',
  '/api/blogs',
  '/api/visas',
  '/api/staff',
  '/api/settings',
  '/api/newsletter',
  '/api/inquiries',
  '/api/consultations',
  '/api/bookings',
  '/api/charity',
  '/api/loyalty',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect /admin pages (non-API)
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('auth_token')?.value
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
