import AdminShell from '@/components/admin/AdminShell'

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />
}

export function AdminTableSkeleton({
  rows = 8,
  columns = 6,
  showTabs = true,
}: {
  rows?: number
  columns?: number
  showTabs?: boolean
}) {
  return (
    <div className="admin-data-table overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-3">
          <SkeletonBlock className="h-10 min-w-56 flex-1" />
          <SkeletonBlock className="h-9 w-28" />
          <SkeletonBlock className="h-9 w-28" />
          <SkeletonBlock className="h-9 w-24" />
        </div>
        {showTabs && (
          <div className="flex gap-2 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-8 w-24 shrink-0" />
            ))}
          </div>
        )}
      </div>
      <div className="overflow-hidden">
        <div className="grid gap-px bg-slate-100" style={{ gridTemplateColumns: `repeat(${columns}, minmax(120px, 1fr))` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <div key={`head-${index}`} className="bg-slate-50 px-5 py-3">
              <SkeletonBlock className="h-3 w-20" />
            </div>
          ))}
          {Array.from({ length: rows }).flatMap((_, rowIndex) =>
            Array.from({ length: columns }).map((__, columnIndex) => (
              <div key={`${rowIndex}-${columnIndex}`} className="bg-white px-5 py-4">
                <SkeletonBlock className={`h-4 ${columnIndex === 0 ? 'w-40' : columnIndex % 2 ? 'w-24' : 'w-32'}`} />
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <SkeletonBlock className="h-4 w-36" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-8" />
          <SkeletonBlock className="h-8 w-8" />
          <SkeletonBlock className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <SkeletonBlock className="h-10 w-10 rounded-xl" />
              <SkeletonBlock className="h-4 w-16" />
            </div>
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="mt-3 h-8 w-32" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.7fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-8 w-24" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-2/3" />
                  <SkeletonBlock className="h-3 w-1/2" />
                </div>
                <SkeletonBlock className="h-5 w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonBlock className="h-5 w-36" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-4 w-28" />
                  <SkeletonBlock className="h-4 w-12" />
                </div>
                <SkeletonBlock className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminFormSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="admin-editor-form space-y-5">
      <div className="admin-form-tabs flex gap-1 rounded-xl bg-gray-100 p-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-10 flex-1" />
        ))}
      </div>
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div key={sectionIndex} className="admin-form-panel rounded-2xl border border-gray-200 bg-white p-6">
          <SkeletonBlock className="mb-5 h-5 w-40" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((__, index) => (
              <div key={index} className={index % 5 === 4 ? 'sm:col-span-2' : ''}>
                <SkeletonBlock className="mb-2 h-3 w-28" />
                <SkeletonBlock className={`${index % 5 === 4 ? 'h-28' : 'h-12'} w-full rounded-xl`} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="admin-form-actions flex flex-wrap gap-2">
        <SkeletonBlock className="h-12 w-40" />
        <SkeletonBlock className="h-12 w-28" />
      </div>
    </div>
  )
}

export function AdminSplitPanelSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-9 w-32" />
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-4">
              <SkeletonBlock className="h-12 w-12 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-44" />
                <SkeletonBlock className="h-3 w-64 max-w-full" />
              </div>
              <SkeletonBlock className="h-9 w-10" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <SkeletonBlock className="h-5 w-36" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index}>
              <SkeletonBlock className="mb-2 h-3 w-28" />
              <SkeletonBlock className={`${index === 5 ? 'h-32' : 'h-12'} w-full rounded-xl`} />
            </div>
          ))}
          <SkeletonBlock className="h-11 w-36" />
        </div>
      </div>
    </div>
  )
}

export function AdminPageSkeleton({
  title = 'Loading dashboard',
  subtitle,
  variant = 'table',
}: {
  title?: string
  subtitle?: string
  variant?: 'dashboard' | 'table' | 'form' | 'split'
}) {
  const content = {
    dashboard: <AdminDashboardSkeleton />,
    table: <AdminTableSkeleton />,
    form: <AdminFormSkeleton />,
    split: <AdminSplitPanelSkeleton />,
  }[variant]

  return (
    <AdminShell title={title} subtitle={subtitle}>
      {content}
    </AdminShell>
  )
}
