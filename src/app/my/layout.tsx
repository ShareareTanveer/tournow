import type { Metadata } from 'next'
import CustomerShell from './CustomerShell'

export const metadata: Metadata = {
  title: { default: 'My Account – Metro Voyage', template: '%s | My Account' },
}

export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>
}
