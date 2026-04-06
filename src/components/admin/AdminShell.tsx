import Sidebar from './Sidebar'

export default function AdminShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {title && (
          <div className="bg-white border-b border-gray-200 px-8 py-4">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          </div>
        )}
        <div className="flex-1 p-8">{children}</div>
      </main>
    </div>
  )
}
