import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { listProviders, upsertProvider } from '@/lib/ai-service'
import { z } from 'zod'

const UpsertSchema = z.object({
  provider:  z.enum(['openai', 'groq', 'gemini', 'openrouter']),
  apiKey:    z.string().min(1),
  model:     z.string().min(1),
  isActive:  z.boolean().optional(),
  isPrimary: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const providers = await listProviders()
  // Mask API keys — only show last 6 chars
  const masked = providers.map(p => ({
    ...p,
    apiKey: p.apiKey.length > 6
      ? '•'.repeat(p.apiKey.length - 6) + p.apiKey.slice(-6)
      : '••••••',
  }))
  return NextResponse.json(masked)
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = UpsertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }

  const result = await upsertProvider(parsed.data)
  return NextResponse.json({
    ...result,
    apiKey: result.apiKey.length > 6
      ? '•'.repeat(result.apiKey.length - 6) + result.apiKey.slice(-6)
      : '••••••',
  })
}
