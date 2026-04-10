import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import AiSettingsForm from './AiSettingsForm'

export default async function AiSettingsPage() {
  const providers = await prisma.aiProviderConfig.findMany({ orderBy: { provider: 'asc' } })

  // Mask API keys for initial render
  const masked = providers.map(p => ({
    ...p,
    apiKey: p.apiKey.length > 6
      ? '•'.repeat(p.apiKey.length - 6) + p.apiKey.slice(-6)
      : '••••••',
  }))

  return (
    <AdminShell title="AI Settings">
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-black text-gray-900">AI Provider Configuration</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your AI provider to enable one-click content and SEO generation for packages, tours, and blog posts.
          </p>
        </div>
        <AiSettingsForm initial={masked} />
      </div>
    </AdminShell>
  )
}
