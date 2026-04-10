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

  // ── /admin/* — allow login page through; protect everything else ──
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    const role = await getRole(token)
    if (!role || !ADMIN_ROLES.includes(role)) {
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      res.cookies.delete('auth_token')
      return res
    }
  }

  // ── /my/* — require a valid customer_token ──
  if (pathname.startsWith('/my')) {
    const token = req.cookies.get('customer_token')?.value
    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
    }
    const role = await getRole(token)
    if (!role || role !== 'CUSTOMER') {
      const res = NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(pathname)}`, req.url)
      )
      res.cookies.delete('customer_token')
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/my/:path*'],
}
