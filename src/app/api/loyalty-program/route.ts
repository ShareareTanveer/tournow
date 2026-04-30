import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/loyalty-program — public: returns program settings from site_settings
export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { startsWith: 'loyalty_' } },
    })
    const map: Record<string, string> = {}
    settings.forEach((s) => { map[s.key] = s.value })
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({})
  }
}

// POST /api/loyalty-program — register for privilege card
// If logged in, links the card to the user account. Also works as guest registration.
export async function POST(req: NextRequest) {
  try {
    const { name, phone, email } = await req.json()
    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'Name, phone and email are required' }, { status: 400 })
    }

    const authUser = await getAuthUser(req)

    // Logged-in user already has a card — return it immediately
    if (authUser) {
      const existing = await prisma.loyaltyCard.findUnique({ where: { userId: authUser.id } })
      if (existing) {
        return NextResponse.json({ success: true, card: existing, alreadyRegistered: true })
      }
    }

    const card = await prisma.loyaltyCard.upsert({
      where: { customerEmail: email },
      update: {
        customerName: name,
        customerPhone: phone,
        ...(authUser ? { userId: authUser.id } : {}),
      },
      create: {
        customerName: name,
        customerPhone: phone,
        customerEmail: email,
        ...(authUser ? { userId: authUser.id } : {}),
      },
    })

    return NextResponse.json({ success: true, card }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
