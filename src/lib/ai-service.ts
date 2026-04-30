/**
 * ai-service.ts
 *
 * Multi-provider AI abstraction layer.
 * Supports: OpenAI, Groq, Gemini, OpenRouter
 *
 * Usage:
 *   const result = await generateContent('package-seo-generate', {
 *     title: 'Bali Honeymoon',
 *     category: 'HONEYMOON',
 *     keywords: 'bali, honeymoon, luxury',
 *   })
 */

import { prisma } from '@/lib/prisma'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AiGenerateOptions {
  entityType: string
  entityId?: string
  createdBy?: string
}

export interface AiGenerateResult {
  jobId: string
  output: Record<string, unknown>
  provider: string
  tokensUsed?: number
}

// ─── Provider implementations ─────────────────────────────────────────────────

async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ text: string; tokens?: number }> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return {
    text: data.choices[0].message.content,
    tokens: data.usage?.total_tokens,
  }
}

async function callGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ text: string; tokens?: number }> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return {
    text: data.choices[0].message.content,
    tokens: data.usage?.total_tokens,
  }
}

async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ text: string; tokens?: number }> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini error ${res.status}: ${err}`)
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return {
    text,
    tokens: data.usageMetadata?.totalTokenCount,
  }
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ text: string; tokens?: number }> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return {
    text: data.choices[0].message.content,
    tokens: data.usage?.total_tokens,
  }
}

// ─── Provider dispatch ────────────────────────────────────────────────────────

async function callProvider(
  provider: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<{ text: string; tokens?: number }> {
  switch (provider) {
    case 'openai':     return callOpenAI(apiKey, model, systemPrompt, userPrompt)
    case 'groq':       return callGroq(apiKey, model, systemPrompt, userPrompt)
    case 'gemini':     return callGemini(apiKey, model, systemPrompt, userPrompt)
    case 'openrouter': return callOpenRouter(apiKey, model, systemPrompt, userPrompt)
    default:           throw new Error(`Unknown AI provider: ${provider}`)
  }
}

// ─── Public raw call (used by per-field AI assist) ───────────────────────────

/**
 * Calls the provider and returns raw text (no JSON parsing, no job record).
 * Used for per-field generation where the caller decides how to use the output.
 */
export async function callProviderRaw(
  provider: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const { text } = await callProvider(provider, apiKey, model, systemPrompt, userMessage)
  return text
}

// ─── Template variable interpolation ─────────────────────────────────────────

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateContent(
  templateKey: string,
  vars: Record<string, string>,
  opts: AiGenerateOptions = { entityType: 'unknown' },
): Promise<AiGenerateResult> {
  // 1. Load template
  const template = await prisma.aiPromptTemplate.findUnique({ where: { key: templateKey } })
  if (!template) throw new Error(`AI template not found: ${templateKey}`)
  if (!template.isActive) throw new Error(`AI template is disabled: ${templateKey}`)

  // 2. Load primary active provider
  const config = await prisma.aiProviderConfig.findFirst({
    where: { isActive: true, isPrimary: true },
    orderBy: { updatedAt: 'desc' },
  }) ?? await prisma.aiProviderConfig.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  })
  if (!config) throw new Error('No active AI provider configured. Go to Admin → Settings → AI.')

  // 3. Create job record (RUNNING)
  const job = await prisma.aiGenerationJob.create({
    data: {
      templateKey,
      entityType: opts.entityType,
      entityId:   opts.entityId,
      status:     'RUNNING',
      inputData:  JSON.stringify(vars),
      provider:   config.provider,
      createdBy:  opts.createdBy,
    },
  })

  // 4. Build prompts
  const systemPrompt = interpolate(template.systemPrompt, vars)
  const userPrompt   = interpolate(template.userPrompt, vars)

  try {
    // 5. Call provider
    const { text, tokens } = await callProvider(
      config.provider, config.apiKey, config.model, systemPrompt, userPrompt,
    )

    // 6. Parse output
    let parsed: Record<string, unknown> = {}
    try {
      parsed = JSON.parse(text)
    } catch {
      // If not valid JSON, wrap in a content key
      parsed = { content: text }
    }

    // 7. Update job as DONE
    await prisma.aiGenerationJob.update({
      where: { id: job.id },
      data: {
        status:      'DONE',
        outputData:  text,
        parsedOutput: JSON.stringify(parsed),
        tokensUsed:  tokens,
      },
    })

    return {
      jobId:      job.id,
      output:     parsed,
      provider:   config.provider,
      tokensUsed: tokens,
    }

  } catch (err: unknown) {
    // 8. Update job as FAILED
    const message = err instanceof Error ? err.message : String(err)
    await prisma.aiGenerationJob.update({
      where: { id: job.id },
      data: { status: 'FAILED', error: message },
    })
    throw err
  }
}

// ─── List providers (for settings UI) ────────────────────────────────────────

export async function listProviders() {
  return prisma.aiProviderConfig.findMany({ orderBy: { provider: 'asc' } })
}

export async function upsertProvider(data: {
  provider: string
  apiKey: string
  model: string
  isActive?: boolean
  isPrimary?: boolean
}) {
  // If setting this as primary, unset others first
  if (data.isPrimary) {
    await prisma.aiProviderConfig.updateMany({
      where: { isPrimary: true },
      data:  { isPrimary: false },
    })
  }
  return prisma.aiProviderConfig.upsert({
    where:  { provider: data.provider },
    create: { ...data, isActive: data.isActive ?? true, isPrimary: data.isPrimary ?? false },
    update: { ...data },
  })
}

export async function deleteProvider(provider: string) {
  return prisma.aiProviderConfig.deleteMany({ where: { provider } })
}

/**
 * Test a provider connection by sending a tiny ping message.
 * Returns { ok: true } on success or throws with error message.
 */
export async function testProviderConnection(
  provider: string,
  apiKey: string,
  model: string,
): Promise<{ ok: true; model: string }> {
  const systemPrompt = 'You are a connection test. Reply with exactly: {"ok":true}'
  const userPrompt   = 'ping'
  const { text } = await callProvider(provider, apiKey, model, systemPrompt, userPrompt)
  // As long as we got any response without throwing, connection is good
  void text
  return { ok: true, model }
}
