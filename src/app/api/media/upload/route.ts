import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { uploadFromFormData } from '@/lib/storage'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const folder = (formData.get('folder') as string) || 'media'
  const altText = (formData.get('altText') as string) || undefined
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  // 10MB limit
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  try {
    const result = await uploadFromFormData(formData, 'file', folder)

    const media = await prisma.media.create({
      data: {
        filename: result.filename,
        url: result.url,
        size: file.size,
        mimeType: file.type,
        storage: result.storage,
        folder,
        altText,
      },
    })

    return NextResponse.json({ url: result.url, media })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const folder = searchParams.get('folder') || undefined
  const take = Math.min(parseInt(searchParams.get('take') || '50'), 100)
  const skip = parseInt(searchParams.get('skip') || '0')

  const [items, total] = await Promise.all([
    prisma.media.findMany({
      where: folder ? { folder } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    }),
    prisma.media.count({ where: folder ? { folder } : undefined }),
  ])

  return NextResponse.json({ items, total })
}
