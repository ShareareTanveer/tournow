import { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { sseSubscribe, sseUnsubscribe } from '@/lib/notifications'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return new Response('Unauthorized', { status: 401 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      // Send initial ping
      ctrl.enqueue(encoder.encode(': connected\n\n'))

      // Subscribe to admin broadcast channel
      sseSubscribe('admin', ctrl)

      // Heartbeat every 25s to keep connection alive through proxies
      const hb = setInterval(() => {
        try { ctrl.enqueue(encoder.encode(': ping\n\n')) }
        catch { clearInterval(hb) }
      }, 25_000)

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(hb)
        sseUnsubscribe('admin', ctrl)
        try { ctrl.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
