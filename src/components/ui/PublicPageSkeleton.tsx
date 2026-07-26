function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />
}

export default function PublicPageSkeleton() {
  return (
    <section
      className="min-h-screen bg-white pt-28"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading page content"
    >
      <span className="sr-only">Loading page content</span>
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6" aria-hidden="true">
        <div className="overflow-hidden rounded-2xl bg-slate-100 p-6 sm:p-10 lg:p-14">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-5 h-10 w-full max-w-xl sm:h-14" />
          <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-5 w-4/5 max-w-xl" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
