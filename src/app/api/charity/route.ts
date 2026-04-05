import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { CharityDonationSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const donations = await prisma.charityDonation.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(donations)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = CharityDonationSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    const donation = await prisma.charityDonation.create({ data: parsed.data })
    return NextResponse.json(donation, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
