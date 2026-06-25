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
    <div className="admin-ui flex h-screen min-h-0 overflow-hidden bg-[#f6f7f8] font-sans">
      <Sidebar />
      <main className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden">
        <div className="admin-topbar flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl lg:px-8">
          <div className="admin-page-heading min-w-0">
            {title && <h1 className="truncate text-xl font-semibold leading-tight tracking-tight text-slate-950">{title}</h1>}
            {subtitle && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{subtitle}</p>}
          </div>
          <div className="admin-page-actions flex shrink-0 items-center gap-2">
            {actions}
            <NotificationBell
              apiBase="/api/admin/notifications"
              streamUrl="/api/admin/notifications/stream"
            />
          </div>
        </div>
        <div className="admin-content flex-1 overflow-auto p-3 sm:p-5 lg:p-6">
          <div className="admin-content-inner">{children}</div>
        </div>
      </main>
    </div>
  )
}
