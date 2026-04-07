import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { NewsletterSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    orderBy: { subscribedAt: 'desc' },
  })
  return NextResponse.json(subscribers)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed: any = NewsletterSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data.email },
      update: { whatsapp: parsed.data.whatsapp, isActive: true },
      create: parsed.data,
    })

    return NextResponse.json({ message: 'Subscribed successfully', subscriber }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
