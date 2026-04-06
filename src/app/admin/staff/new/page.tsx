import AdminShell from '@/components/admin/AdminShell'
import StaffForm from '../StaffForm'

export default function NewStaffPage() {
  return (
    <AdminShell title="Add Staff Member">
      <StaffForm />
    </AdminShell>
  )
}
