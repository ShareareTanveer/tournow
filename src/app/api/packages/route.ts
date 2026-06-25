import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { PackageSchema } from '@/lib/validations'
import { getPackageSearchResults } from '@/lib/package-search'

// GET /api/packages — public, with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const results = await getPackageSearchResults(Object.fromEntries(searchParams.entries()))
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/packages — admin only
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed:any = PackageSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const pkg = await prisma.package.create({ data: parsed.data })
    return NextResponse.json(pkg, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
