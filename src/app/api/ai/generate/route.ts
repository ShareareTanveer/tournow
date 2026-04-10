import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { generateContent } from '@/lib/ai-service'
import { z } from 'zod'

const BodySchema = z.object({
  templateKey: z.string().min(1),
  entityType:  z.string().min(1),
  entityId:    z.string().optional(),
  vars:        z.record(z.string(), z.string()),
})

/**
 * POST /api/ai/generate
 * Body: { templateKey, entityType, entityId?, vars }
 */
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }

  const { templateKey, entityType, entityId, vars } = parsed.data

  try {
    const result = await generateContent(templateKey, vars, {
      entityType,
      entityId,
      createdBy: user.id,
    })
    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
