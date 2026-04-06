import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? 'fallback-secret')

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'STAFF']

async function getRole(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return (payload as { role?: string }).role ?? null
  } catch {
    return null
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('auth_token')?.value

  // ── /admin/* — allow login page through; protect everything else ──
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    const role = await getRole(token)
    if (!role || !ADMIN_ROLES.includes(role)) {
      // Customers who somehow hit /admin → send to their dashboard
      return NextResponse.redirect(new URL('/my', req.url))
    }
  }

  // ── /my/* — require a valid customer (or any) session ──
  if (pathname.startsWith('/my')) {
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
    }
    const role = await getRole(token)
    if (!role) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
    }
    // Admin users who land on /my → redirect to admin dashboard
    if (ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/my/:path*'],
}
