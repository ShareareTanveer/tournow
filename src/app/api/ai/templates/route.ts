import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const templates = await prisma.aiPromptTemplate.findMany({
    where: { isActive: true },
    orderBy: { key: 'asc' },
    select: { key: true, name: true, description: true, outputFormat: true },
  })
  return NextResponse.json(templates)
}
