import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import BlogForm from '../BlogForm'

type Props = { params: Promise<{ slug: string }> }

export default async function EditBlogPage({ params }: Props) {
  const { slug } = await params
  const blog = await prisma.blog.findUnique({ where: { slug } }).catch(() => null)
  if (!blog) notFound()
  return (
    <AdminShell title="Edit Blog Post">
      <BlogForm blog={blog} />
    </AdminShell>
  )
}
