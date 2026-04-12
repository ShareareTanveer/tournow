import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_SIZE = 20 * 1024 * 1024 // 20 MB

/**
 * GET /api/media/fetch-image?url=https://...
 *
 * Server-side image proxy — fetches a remote image and pipes it back.
 * Used by the image uploader so users can load images from any URL
 * without hitting browser CORS restrictions.
 */
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = req.nextUrl.searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'url param required' }, { status: 400 })

  // Only allow http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return NextResponse.json({ error: 'Only http/https URLs are allowed' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HaloHolidays/1.0)' },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Remote returned ${res.status}` }, { status: 502 })
    }

    const contentType = res.headers.get('content-type') ?? ''
    const mimeType = contentType.split(';')[0].trim()

    if (!ALLOWED_TYPES.some(t => mimeType.startsWith(t.split('/')[0]) && mimeType.includes(t.split('/')[1]))) {
      return NextResponse.json({ error: `Not an image (got ${mimeType})` }, { status: 400 })
    }

    const buffer = await res.arrayBuffer()
    if (buffer.byteLength > MAX_SIZE) {
      return NextResponse.json({ error: 'Image too large (max 20 MB)' }, { status: 400 })
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Fetch failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
