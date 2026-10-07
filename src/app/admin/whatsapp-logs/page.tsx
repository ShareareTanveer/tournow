import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'
import { FiAlertCircle, FiCheckCircle, FiClock, FiMessageCircle } from 'react-icons/fi'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'WhatsApp Logs' }

function statusClass(status: string) {
  if (status === 'sent') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'failed') return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function formatJson(value: unknown) {
  if (!value) return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export default async function WhatsAppLogsPage() {
  const logs = await prisma.whatsAppMessageLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  }).catch(() => [])

  const sent = logs.filter((log) => log.status === 'sent').length
  const failed = logs.filter((log) => log.status === 'failed').length

  return (
    <AdminShell
      title="WhatsApp Logs"
      subtitle="Monitor supplier notification delivery and inspect Twilio responses"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <FiMessageCircle size={18} />
              </span>
              <div>
                <p className="text-sm text-slate-500">Latest attempts</p>
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{logs.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                <FiCheckCircle size={18} />
              </span>
              <div>
                <p className="text-sm text-emerald-700">Sent successfully</p>
                <p className="text-2xl font-semibold tracking-tight text-emerald-950">{sent}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-100 text-red-700">
                <FiAlertCircle size={18} />
              </span>
              <div>
                <p className="text-sm text-red-700">Failed attempts</p>
                <p className="text-2xl font-semibold tracking-tight text-red-950">{failed}</p>
              </div>
            </div>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
            <FiMessageCircle size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-base font-semibold text-slate-900">No WhatsApp attempts logged yet</p>
            <p className="mt-1 text-sm text-slate-500">Create a booking with an assigned supplier to test the notification flow.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => {
              const details = [
                log.reason ? `Reason: ${log.reason}` : '',
                log.twilioSid ? `Twilio SID: ${log.twilioSid}` : '',
                log.responseStatus ? `HTTP: ${log.responseStatus}` : '',
              ].filter(Boolean)
              const responseText = log.responseBody || log.error || ''
              const requestText = formatJson(log.requestPayload)

              return (
                <article key={log.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="min-w-0">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(log.status)}`}>
                          {log.status}
                        </span>
                        {log.bookingType && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                            {log.bookingType}
                          </span>
                        )}
                      </div>
                      <h2 className="mt-3 text-base font-semibold text-slate-950">
                        {log.itemTitle || 'Booking notification'}
                      </h2>
                      <div className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                        {log.bookingRef && <span className="truncate"><strong className="font-medium text-slate-700">Booking:</strong> {log.bookingRef}</span>}
                        {log.supplierName && <span className="truncate"><strong className="font-medium text-slate-700">Supplier:</strong> {log.supplierName}</span>}
                        {log.toNumber && <span className="truncate"><strong className="font-medium text-slate-700">To:</strong> {log.toNumber.replace('whatsapp:', '')}</span>}
                        {log.fromNumber && <span className="truncate"><strong className="font-medium text-slate-700">From:</strong> {log.fromNumber.replace('whatsapp:', '')}</span>}
                      </div>
                      {details.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                          {details.map((detail) => (
                            <span key={detail} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
                              {detail}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                      <span className="flex shrink-0 items-center gap-2 text-sm text-slate-500">
                        <FiClock size={14} />
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </div>

                  {(responseText || requestText) && (
                    <details className="group mt-4 border-t border-slate-100 pt-4">
                      <summary className="cursor-pointer select-none text-sm font-medium text-[#0395d5] hover:text-[#0878ab]">
                        View technical details
                      </summary>
                      <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-2">
                        {responseText && (
                          <div className="min-w-0">
                            <p className="mb-2 text-sm font-medium text-slate-700">Twilio response / error</p>
                            <pre className="max-h-64 min-w-0 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100">
                              {responseText}
                            </pre>
                          </div>
                        )}
                        {requestText && (
                          <div className="min-w-0">
                            <p className="mb-2 text-sm font-medium text-slate-700">Request payload</p>
                            <pre className="max-h-64 min-w-0 overflow-auto whitespace-pre-wrap break-all rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-700">
                              {requestText}
                            </pre>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
