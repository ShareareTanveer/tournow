import { NextRequest } from 'next/server'
import { getCustomerUser } from '@/lib/auth'
import { sseSubscribe, sseUnsubscribe } from '@/lib/notifications'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const customer = await getCustomerUser(req)
  if (!customer) return new Response('Unauthorized', { status: 401 })

  const key = `customer:${customer.id}`
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      ctrl.enqueue(encoder.encode(': connected\n\n'))
      sseSubscribe(key, ctrl)

      const hb = setInterval(() => {
        try { ctrl.enqueue(encoder.encode(': ping\n\n')) }
        catch { clearInterval(hb) }
      }, 25_000)

      req.signal.addEventListener('abort', () => {
        clearInterval(hb)
        sseUnsubscribe(key, ctrl)
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
