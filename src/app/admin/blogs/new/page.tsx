import AdminShell from '@/components/admin/AdminShell'
import BlogForm from '../BlogForm'

export default function NewBlogPage() {
  return (
    <AdminShell title="New Blog Post">
      <BlogForm />
    </AdminShell>
  )
}
