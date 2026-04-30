import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import AiSettingsForm from './AiSettingsForm'

export default async function AiSettingsPage() {
  const providers = await prisma.aiProviderConfig.findMany({ orderBy: { provider: 'asc' } })

  // Mask API keys — only show last 6 chars
  const masked = providers.map(p => ({
    ...p,
    apiKey:     p.apiKey.length > 6
      ? '•'.repeat(p.apiKey.length - 6) + p.apiKey.slice(-6)
      : '••••••',
    configured: true,
  }))

  return (
    <AdminShell
      title="AI Provider Config"
      subtitle="Configure AI providers for content and SEO generation"
    >
      <div className="max-w-2xl">
        <AiSettingsForm initial={masked as Parameters<typeof AiSettingsForm>[0]['initial']} />
      </div>
    </AdminShell>
  )
}
