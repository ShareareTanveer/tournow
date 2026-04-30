import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PerkForm from '../PerkForm'

type Props = { params: Promise<{ id: string }> }

export const metadata = { title: 'Edit Perk' }

export default async function EditPerkPage({ params }: Props) {
  const { id } = await params
  const perk = await prisma.perk.findUnique({ where: { id } }).catch(() => null)
  if (!perk) notFound()

  return (
    <AdminShell title="Edit Perk">
      <PerkForm perk={{
        id: perk.id,
        title: perk.title,
        description: perk.description,
        iconName: perk.iconName,
        iconColor: perk.iconColor,
        bgColor: perk.bgColor,
        imageUrl: perk.imageUrl ?? null,
        ctaLink: perk.ctaLink ?? null,
        sortOrder: perk.sortOrder,
        isActive: perk.isActive,
      }} />
    </AdminShell>
  )
}
