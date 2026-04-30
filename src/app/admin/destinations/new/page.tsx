import AdminShell from '@/components/admin/AdminShell'
import DestinationForm from '../DestinationForm'

export default function NewDestinationPage() {
  return (
    <AdminShell title="New Destination">
      <DestinationForm />
    </AdminShell>
  )
}
