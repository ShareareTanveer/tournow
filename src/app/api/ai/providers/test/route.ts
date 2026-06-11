import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { testProviderConnection } from '@/lib/ai-service'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const TestSchema = z.object({
  provider: z.enum(['openai', 'groq', 'gemini', 'openrouter']),
  apiKey:   z.string().min(1).optional(),
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
    let apiKey = parsed.data.apiKey
    if (!apiKey) {
      const saved = await prisma.aiProviderConfig.findUnique({
        where: { provider: parsed.data.provider },
        select: { apiKey: true },
      })
      apiKey = saved?.apiKey
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'No saved API key found for this provider' }, { status: 400 })
    }

    const result = await testProviderConnection(parsed.data.provider, apiKey, parsed.data.model)
    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connection failed'
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
