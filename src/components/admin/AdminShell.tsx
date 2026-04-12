import Sidebar from './Sidebar'

interface Props {
  children:    React.ReactNode
  title?:      string
  subtitle?:   string
  actions?:    React.ReactNode
}

export default function AdminShell({ children, title, subtitle, actions }: Props) {
  return (
    <div className="flex min-h-screen bg-[#f5f6fa] font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {(title || actions) && (
          <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-4 flex items-center justify-between gap-4 shrink-0">
            <div>
              {title && <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>}
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          </div>
        )}
        <div className="flex-1 p-6 lg:p-8 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
