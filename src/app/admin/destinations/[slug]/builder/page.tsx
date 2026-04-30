import AdminShell from '@/components/admin/AdminShell'
import DestinationPageBuilder from '@/components/admin/destinations/DestinationPageBuilder'

type Props = { params: Promise<{ slug: string }> }

export default async function DestinationBuilderPage({ params }: Props) {
  const { slug } = await params
  return (
    <AdminShell title="Destination Builder" subtitle="Compose the live destination detail page with editable sections.">
      <DestinationPageBuilder slug={slug} />
    </AdminShell>
  )
}
