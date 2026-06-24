import AdminShell from '@/components/admin/AdminShell'
import { prisma } from '@/lib/prisma'

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
      subtitle={`${logs.length} latest attempts - ${sent} sent - ${failed} failed`}
    >
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Supplier message attempts</h2>
          <p className="mt-1 text-xs text-gray-500">
            Twilio responses are stored here when a booking tries to notify a supplier.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-medium text-gray-900">No WhatsApp attempts logged yet.</p>
            <p className="mt-1 text-xs text-gray-500">Create a booking with an assigned supplier to test the flow.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {logs.map((log) => {
              const details = [
                log.reason ? `Reason: ${log.reason}` : '',
                log.twilioSid ? `Twilio SID: ${log.twilioSid}` : '',
                log.responseStatus ? `HTTP: ${log.responseStatus}` : '',
              ].filter(Boolean)
              const responseText = log.responseBody || log.error || ''
              const requestText = formatJson(log.requestPayload)

              return (
                <div key={log.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${statusClass(log.status)}`}>
                          {log.status}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(log.createdAt)}</span>
                        {log.bookingType && (
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium capitalize text-gray-600">
                            {log.bookingType}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-semibold text-gray-950">
                        {log.itemTitle || 'Booking notification'}
                      </h3>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        {log.bookingRef && <span>Booking: {log.bookingRef}</span>}
                        {log.supplierName && <span>Supplier: {log.supplierName}</span>}
                        {log.toNumber && <span>To: {log.toNumber}</span>}
                        {log.fromNumber && <span>From: {log.fromNumber}</span>}
                      </div>
                      {details.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                          {details.map((detail) => (
                            <span key={detail} className="rounded-md bg-gray-50 px-2 py-1">
                              {detail}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {(responseText || requestText) && (
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {responseText && (
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-600">Response / error</p>
                          <pre className="max-h-56 overflow-auto rounded-lg bg-gray-950 p-3 text-xs leading-relaxed text-gray-100">
                            {responseText}
                          </pre>
                        </div>
                      )}
                      {requestText && (
                        <div>
                          <p className="mb-1 text-xs font-semibold text-gray-600">Request payload</p>
                          <pre className="max-h-56 overflow-auto rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-700">
                            {requestText}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
