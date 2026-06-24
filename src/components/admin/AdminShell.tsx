import Sidebar from './Sidebar'
import NotificationBell from '@/components/NotificationBell'

interface Props {
  children:    React.ReactNode
  title?:      string
  subtitle?:   string
  actions?:    React.ReactNode
}

export default function AdminShell({ children, title, subtitle, actions }: Props) {
  return (
    <div className="admin-ui flex h-screen min-h-0 overflow-hidden bg-[#f3f7f6] font-sans">
      <Sidebar />
      <main className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden">
        <div className="admin-topbar bg-white border-b border-gray-200 px-6 lg:px-8 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="admin-page-heading min-w-0">
            {title && <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="admin-page-actions flex items-center gap-2 shrink-0">
            {actions}
            <NotificationBell
              apiBase="/api/admin/notifications"
              streamUrl="/api/admin/notifications/stream"
            />
          </div>
        </div>
        <div className="admin-content flex-1 p-6 lg:p-8 overflow-auto">
          <div className="admin-content-inner">{children}</div>
        </div>
      </main>
    </div>
  )
}
