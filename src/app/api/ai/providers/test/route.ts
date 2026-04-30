import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { testProviderConnection } from '@/lib/ai-service'
import { z } from 'zod'

const TestSchema = z.object({
  provider: z.enum(['openai', 'groq', 'gemini', 'openrouter']),
  apiKey:   z.string().min(1),
  model:    z.string().min(1),
})

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = TestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }

  try {
    const result = await testProviderConnection(parsed.data.provider, parsed.data.apiKey, parsed.data.model)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connection failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
