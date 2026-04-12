import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { generateContent } from '@/lib/ai-service'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// ── Mode 1: template-based (original) ─────────────────────────────────────────
const TemplateBodySchema = z.object({
  mode:        z.literal('template'),
  templateKey: z.string().min(1),
  entityType:  z.string().min(1),
  entityId:    z.string().optional(),
  vars:        z.record(z.string(), z.string()),
})

// ── Mode 2: per-field raw generation ──────────────────────────────────────────
const RawBodySchema = z.object({
  mode:         z.literal('raw'),
  systemPrompt: z.string().min(1),
  userMessage:  z.string().min(1),
  provider:     z.string().optional(),   // preferred provider key, null = auto
  model:        z.string().optional(),   // model override
})

const BodySchema = z.discriminatedUnion('mode', [TemplateBodySchema, RawBodySchema])

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  // Default to template mode for backwards-compat (mode field optional)
  if (!body.mode) body.mode = 'template'

  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }

  try {
    if (parsed.data.mode === 'template') {
      const { templateKey, entityType, entityId, vars } = parsed.data
      const result = await generateContent(templateKey, vars, {
        entityType,
        entityId,
        createdBy: user.id,
      })
      return NextResponse.json(result)
    }

    // ── Raw mode ──────────────────────────────────────────────────────────────
    const { systemPrompt, userMessage, provider: preferredProvider, model: modelOverride } = parsed.data

    // Resolve provider
    let config = preferredProvider
      ? await prisma.aiProviderConfig.findFirst({ where: { provider: preferredProvider, isActive: true } })
      : null

    if (!config) {
      config = await prisma.aiProviderConfig.findFirst({ where: { isActive: true, isPrimary: true } })
        ?? await prisma.aiProviderConfig.findFirst({ where: { isActive: true } })
    }

    if (!config) {
      return NextResponse.json(
        { error: 'No active AI provider configured. Go to Admin → Settings → AI.' },
        { status: 503 },
      )
    }

    const effectiveModel = modelOverride?.trim() || config.model

    // Call provider directly (re-use the internal helper via a lightweight inline call)
    const { callProviderRaw } = await import('@/lib/ai-service')
    const text = await callProviderRaw(config.provider, config.apiKey, effectiveModel, systemPrompt, userMessage)

    return NextResponse.json({ text, provider: config.provider })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
