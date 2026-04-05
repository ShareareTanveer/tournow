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

// POST /api/loyalty-program — public: register for loyalty card
export async function POST(req: NextRequest) {
  try {
    const { name, phone, email } = await req.json()
    if (!name || !phone || !email) {
      return NextResponse.json({ error: 'Name, phone and email are required' }, { status: 400 })
    }

    const card = await prisma.loyaltyCard.upsert({
      where: { customerEmail: email },
      update: { customerName: name, customerPhone: phone },
      create: { customerName: name, customerPhone: phone, customerEmail: email },
    })

    return NextResponse.json({ success: true, card }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
