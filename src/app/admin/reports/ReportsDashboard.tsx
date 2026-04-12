'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  FiDownload, FiCalendar, FiTrendingUp, FiUsers, FiDollarSign,
  FiPackage, FiInbox, FiVideo, FiMail, FiHeart, FiBarChart2,
  FiPieChart, FiFilter, FiRefreshCw, FiChevronDown,
} from 'react-icons/fi'

/* ─── Types ─────────────────────────────────────────────────── */
interface Booking {
  id: string; bookingRef: string; customerName: string; customerEmail: string
  travelDate: string; createdAt: string; status: string; paymentStatus: string
  totalPrice: number; discount: number; paxAdult: number; paxChild: number; paxInfant: number
  title: string; category: string; destination: string; region: string; _type: 'package' | 'tour'
}
interface Inquiry       { id: string; createdAt: string; status: string; destination?: string | null; package?: { title: string } | null }
interface Consultation  { id: string; createdAt: string; status: string; method: string }
interface Subscriber    { id: string; email: string; isActive: boolean; createdAt: string }
interface Donation      { id: string; amount: number; status: string; createdAt: string; donorName?: string | null; donorEmail?: string | null }

interface ReportData {
  bookings:      Booking[]
  inquiries:     Inquiry[]
  consultations: Consultation[]
  newsletter:    Subscriber[]
  donations:     Donation[]
}

/* ─── Constants ─────────────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const BOOKING_STATUS_COLOR: Record<string, string> = {
  REQUESTED: '#6366f1', CALL_REQUIRED: '#a855f7', EDIT_RESEND: '#eab308',
  AWAITING_CONFIRM: '#8b5cf6', CONFIRMED: '#14b8a6', RECEIPT_UPLOADED: '#06b6d4',
  ADMIN_CONFIRMING: '#ec4899', ALL_CONFIRMED: '#22c55e', MAIL_SENT: '#16a34a',
  CANCELLED: '#ef4444', COMPLETED: '#9ca3af',
}

const PAY_COLOR: Record<string, string> = {
  UNPAID: '#ef4444', PARTIAL: '#f59e0b', PAID: '#22c55e', REFUNDED: '#9ca3af',
}

/* ─── Helpers ────────────────────────────────────────────────── */
function fmt(n: number) { return n.toLocaleString() }
function fmtK(n: number) { return n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(0)}k` : String(n) }
function dateInRange(iso: string, from: string, to: string) {
  if (!from && !to) return true
  const d = iso.slice(0,10)
  if (from && d < from) return false
  if (to   && d > to)   return false
  return true
}
function groupBy<T>(arr: T[], key: (x: T) => string): Record<string, T[]> {
  return arr.reduce((acc, x) => { const k = key(x); (acc[k] ??= []).push(x); return acc }, {} as Record<string, T[]>)
}
function countBy<T>(arr: T[], key: (x: T) => string): { label: string; count: number }[] {
  const map = groupBy(arr, key)
  return Object.entries(map).map(([label, items]) => ({ label, count: items.length }))
    .sort((a, b) => b.count - a.count)
}

/* ─── CSV / Excel export ─────────────────────────────────────── */
function toCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const lines = [headers.join(','), ...rows.map(r =>
    headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
  )]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function toHTML(title: string, tableHTML: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 0; margin: 0; color: #111827; background: white; }
  .cover { background: linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%); color: white; padding: 40px 32px 32px; margin-bottom: 32px; }
  .cover h1 { font-size: 26px; font-weight: 900; margin: 0 0 6px; }
  .cover p { font-size: 12px; opacity: 0.8; margin: 0; }
  .section { margin: 0 32px 28px; }
  .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #4f46e5; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; margin-bottom: 14px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
  .kpi { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; }
  .kpi-val { font-size: 22px; font-weight: 900; color: #1e1b4b; line-height: 1; }
  .kpi-label { font-size: 10px; font-weight: 600; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
  .kpi-sub { font-size: 10px; color: #9ca3af; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 4px; }
  th { background: #4f46e5; color: white; padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; }
  tr:nth-child(even) td { background: #fafafa; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-amber { background: #fef3c7; color: #92400e; }
  .badge-indigo { background: #e0e7ff; color: #3730a3; }
  .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 11px; }
  .bar-track { flex: 1; height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; background: #4f46e5; border-radius: 4px; }
  .bar-label { min-width: 120px; font-weight: 600; color: #374151; }
  .bar-count { min-width: 50px; text-align: right; font-weight: 700; color: #1e1b4b; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .insight-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; margin-bottom: 10px; }
  .insight-box h4 { font-size: 11px; font-weight: 700; color: #065f46; margin: 0 0 4px; }
  .insight-box p { font-size: 11px; color: #166534; margin: 0; }
  .footer { margin: 32px 32px 0; padding: 16px 0; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; text-align: center; }
  @media print { .no-print { display: none; } }
</style></head><body>
${tableHTML}
</body></html>`
}

function buildFullReportHTML(
  from: string, to: string,
  bookings: Booking[], inquiries: Inquiry[], consultations: Consultation[],
  newsletter: Subscriber[], donations: Donation[],
  totalRevenue: number, partialRevenue: number, avgBookingVal: number, totalPax: number, conversionRate: number
): string {
  const paidBookings = bookings.filter(b => b.paymentStatus === 'PAID')
  const now = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  const period = from && to ? `${from} → ${to}` : from ? `from ${from}` : to ? `up to ${to}` : 'All time'

  // top packages
  const pkgMap: Record<string, number> = {}
  bookings.forEach(b => { pkgMap[b.title] = (pkgMap[b.title] ?? 0) + 1 })
  const topPkg = Object.entries(pkgMap).sort((a,b)=>b[1]-a[1]).slice(0,8)
  const maxPkg = Math.max(...topPkg.map(p=>p[1]), 1)

  // top destinations
  const destMap: Record<string, number> = {}
  bookings.filter(b=>b.destination).forEach(b => { destMap[b.destination] = (destMap[b.destination] ?? 0) + 1 })
  const topDest = Object.entries(destMap).sort((a,b)=>b[1]-a[1]).slice(0,6)
  const maxDest = Math.max(...topDest.map(d=>d[1]), 1)

  // status dist
  const statusMap: Record<string,number> = {}
  bookings.forEach(b => { statusMap[b.status] = (statusMap[b.status]??0)+1 })

  // inquiry funnel
  const inqMap: Record<string,number> = {}
  inquiries.forEach(i => { inqMap[i.status] = (inqMap[i.status]??0)+1 })

  // category
  const catMap: Record<string,number> = {}
  bookings.forEach(b => { catMap[b.category] = (catMap[b.category]??0)+1 })

  // monthly bookings (last 6)
  const mBookMap: Record<string,number> = {}
  bookings.forEach(b => { const d=new Date(b.createdAt); const k=`${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${d.getFullYear()}`; mBookMap[k]=(mBookMap[k]??0)+1 })
  const mBookEntries = Object.entries(mBookMap).slice(-6)
  const maxMBook = Math.max(...mBookEntries.map(e=>e[1]),1)

  // cancelled rate
  const cancelRate = bookings.length ? Math.round((bookings.filter(b=>b.status==='CANCELLED').length/bookings.length)*100) : 0
  const completedCount = bookings.filter(b=>b.status==='COMPLETED').length

  const kpiSection = `
  <div class="section">
    <div class="section-title">Key Performance Indicators</div>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-val">${bookings.length}</div><div class="kpi-label">Total Bookings</div><div class="kpi-sub">${paidBookings.length} paid · ${completedCount} completed</div></div>
      <div class="kpi"><div class="kpi-val">LKR ${fmt(totalRevenue)}</div><div class="kpi-label">Confirmed Revenue</div><div class="kpi-sub">${paidBookings.length} paid bookings</div></div>
      <div class="kpi"><div class="kpi-val">LKR ${fmt(avgBookingVal)}</div><div class="kpi-label">Avg Booking Value</div><div class="kpi-sub">Paid bookings only</div></div>
      <div class="kpi"><div class="kpi-val">${totalPax}</div><div class="kpi-label">Total Passengers</div><div class="kpi-sub">Adults + Children + Infants</div></div>
      <div class="kpi"><div class="kpi-val">${inquiries.length}</div><div class="kpi-label">Inquiries Received</div><div class="kpi-sub">${conversionRate}% conversion rate</div></div>
      <div class="kpi"><div class="kpi-val">${newsletter.filter(n=>n.isActive).length}</div><div class="kpi-label">Active Subscribers</div><div class="kpi-sub">${newsletter.length} total in period</div></div>
    </div>
  </div>`

  const insightsSection = `
  <div class="section">
    <div class="section-title">Business Insights</div>
    <div class="two-col">
      <div>
        <div class="insight-box">
          <h4>Revenue Health</h4>
          <p>Confirmed: LKR ${fmt(totalRevenue)} &nbsp;|&nbsp; Partial: LKR ${fmt(partialRevenue)}<br/>
          Potential total: LKR ${fmt(totalRevenue + partialRevenue)}</p>
        </div>
        <div class="insight-box" style="background:#eff6ff;border-color:#bfdbfe">
          <h4 style="color:#1e40af">Booking Pipeline</h4>
          <p style="color:#1e40af">Active: ${bookings.filter(b=>!['CANCELLED','COMPLETED'].includes(b.status)).length} &nbsp;|&nbsp; Cancelled: ${bookings.filter(b=>b.status==='CANCELLED').length} (${cancelRate}%) &nbsp;|&nbsp; Completed: ${completedCount}</p>
        </div>
      </div>
      <div>
        <div class="insight-box" style="background:#fdf4ff;border-color:#e9d5ff">
          <h4 style="color:#6b21a8">Lead Generation</h4>
          <p style="color:#6b21a8">Total inquiries: ${inquiries.length} &nbsp;|&nbsp; Converted: ${inquiries.filter(i=>i.status==='CONVERTED').length}<br/>
          Consultations booked: ${consultations.length}</p>
        </div>
        <div class="insight-box" style="background:#fff7ed;border-color:#fed7aa">
          <h4 style="color:#9a3412">Engagement</h4>
          <p style="color:#9a3412">Newsletter subscribers: ${newsletter.length} (${newsletter.filter(n=>n.isActive).length} active)<br/>
          Unsubscribed: ${newsletter.filter(n=>!n.isActive).length}</p>
        </div>
      </div>
    </div>
  </div>`

  const packagesSection = `
  <div class="section">
    <div class="section-title">Top Packages &amp; Tours by Bookings</div>
    ${topPkg.map(([name, count], i) => `
      <div class="bar-row">
        <span style="min-width:20px;font-size:10px;font-weight:900;color:#d1d5db">${i+1}</span>
        <span class="bar-label">${name.length > 40 ? name.slice(0,38)+'…' : name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.round((count/maxPkg)*100)}%"></div></div>
        <span class="bar-count">${count}</span>
      </div>`).join('')}
  </div>
  <div class="section">
    <div class="section-title">Top Destinations</div>
    ${topDest.length ? topDest.map(([name, count], i) => `
      <div class="bar-row">
        <span style="min-width:20px;font-size:10px;font-weight:900;color:#d1d5db">${i+1}</span>
        <span class="bar-label">${name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.round((count/maxDest)*100)}%;background:#7c3aed"></div></div>
        <span class="bar-count">${count}</span>
      </div>`).join('') : '<p style="color:#9ca3af;font-size:12px">No destination data available</p>'}
  </div>`

  const inquirySection = `
  <div class="section">
    <div class="section-title">Inquiry Funnel &amp; Lead Pipeline</div>
    <div class="two-col">
      <div>
        ${Object.entries(inqMap).map(([s, c]) => {
          const pct = inquiries.length ? Math.round((c/inquiries.length)*100) : 0
          return `<div class="bar-row">
            <span class="bar-label">${s}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:#a855f7"></div></div>
            <span class="bar-count">${c} (${pct}%)</span>
          </div>`
        }).join('')}
        <div style="margin-top:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 14px;display:flex;justify-content:space-between">
          <span style="font-size:11px;font-weight:700;color:#065f46">Conversion Rate</span>
          <span style="font-size:14px;font-weight:900;color:#065f46">${conversionRate}%</span>
        </div>
      </div>
      <div>
        <p style="font-size:11px;font-weight:700;color:#374151;margin-bottom:8px">By Category</p>
        ${Object.entries(catMap).map(([c, n]) => `
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f3f4f6;font-size:11px">
            <span style="color:#6b7280">${c}</span><span style="font-weight:700">${n}</span>
          </div>`).join('')}
        <p style="font-size:11px;font-weight:700;color:#374151;margin:12px 0 8px">Consultations (${consultations.length})</p>
        ${Object.entries(consultations.reduce((a: Record<string,number>,c) => { a[c.method]=(a[c.method]??0)+1; return a }, {})).map(([m,n]) => `
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f3f4f6;font-size:11px">
            <span style="color:#6b7280">${m}</span><span style="font-weight:700">${n}</span>
          </div>`).join('')}
      </div>
    </div>
  </div>`

  const monthlySection = `
  <div class="section">
    <div class="section-title">Monthly Booking Volume (Last 6 Months)</div>
    ${mBookEntries.map(([month, count]) => `
      <div class="bar-row">
        <span class="bar-label">${month}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.round((count/maxMBook)*100)}%;background:#06b6d4"></div></div>
        <span class="bar-count">${count} bookings</span>
      </div>`).join('')}
  </div>`

  const bookingsTableSection = `
  <div class="section">
    <div class="section-title">Booking Details (Top 30)</div>
    <table>
      <thead><tr><th>Ref</th><th>Customer</th><th>Package / Tour</th><th>Travel Date</th><th>Status</th><th>Payment</th><th>Total (LKR)</th></tr></thead>
      <tbody>
        ${bookings.slice(0,30).map(b => `
          <tr>
            <td style="font-family:monospace;color:#9ca3af">${b.bookingRef.slice(-8).toUpperCase()}</td>
            <td style="font-weight:600">${b.customerName}</td>
            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${b.title}</td>
            <td>${b.travelDate.slice(0,10)}</td>
            <td><span class="badge badge-indigo">${b.status.replace(/_/g,' ')}</span></td>
            <td><span class="badge ${b.paymentStatus==='PAID'?'badge-green':b.paymentStatus==='UNPAID'?'badge-red':'badge-amber'}">${b.paymentStatus}</span></td>
            <td style="text-align:right;font-weight:700">${fmt(b.totalPrice)}</td>
          </tr>`).join('')}
        ${bookings.length > 30 ? `<tr><td colspan="7" style="text-align:center;color:#9ca3af;font-style:italic">+ ${bookings.length - 30} more bookings — export CSV for complete data</td></tr>` : ''}
      </tbody>
      <tfoot>
        <tr style="background:#eef2ff">
          <td colspan="6" style="font-weight:800;color:#4f46e5">TOTALS</td>
          <td style="text-align:right;font-weight:900;color:#4f46e5">LKR ${fmt(paidBookings.reduce((s,b)=>s+b.totalPrice,0))}</td>
        </tr>
      </tfoot>
    </table>
  </div>`

  const body = `
  <div class="cover">
    <div style="font-size:11px;opacity:0.7;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.1em">Halo Holidays / Metro Voyage</div>
    <h1>Business Analytics Report</h1>
    <p>Period: ${period} &nbsp;·&nbsp; Generated: ${now}</p>
    <div style="margin-top:16px;display:flex;gap:24px;font-size:12px">
      <span><strong>${bookings.length}</strong> Bookings</span>
      <span><strong>LKR ${fmt(totalRevenue)}</strong> Revenue</span>
      <span><strong>${inquiries.length}</strong> Inquiries</span>
      <span><strong>${conversionRate}%</strong> Conversion</span>
    </div>
  </div>
  ${kpiSection}
  ${insightsSection}
  ${packagesSection}
  ${inquirySection}
  ${monthlySection}
  ${bookingsTableSection}
  <div class="footer">Halo Holidays / Metro Voyage &nbsp;·&nbsp; Analytics Report &nbsp;·&nbsp; ${now} &nbsp;·&nbsp; Confidential</div>`

  return toHTML(`Analytics Report — ${period}`, body)
}

function printReport(title: string, rows: Record<string, any>[]) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const th = headers.map(h => `<th>${h}</th>`).join('')
  const trs = rows.map(r =>
    `<tr>${headers.map(h => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`
  ).join('')
  const html = toHTML(title, `
    <div style="padding:32px">
      <h2 style="font-size:18px;font-weight:900;color:#1e1b4b;margin-bottom:4px">${title}</h2>
      <p style="color:#6b7280;font-size:11px;margin-bottom:20px">Generated ${new Date().toLocaleString()}</p>
      <table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>
    </div>`)
  const win = window.open('', '_blank')!
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 600)
}

/* ─── Bar chart (SVG with axes, gridlines, hover tooltips) ──── */
function BarChart({ data, height = 160, color = '#6366f1', valuePrefix = '' }: {
  data: { label: string; value: number }[]
  height?: number; color?: string; valuePrefix?: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const activeHover = mounted ? hovered : null
  const max    = Math.max(...data.map(d => d.value), 1)
  const W      = 100        // % viewBox width per bar slot
  const padL   = 38         // left axis padding (px in viewBox)
  const padB   = 22         // bottom axis padding
  const padT   = 16
  const padR   = 8
  const vbW    = data.length * W + padL + padR
  const vbH    = height
  const chartH = vbH - padT - padB
  const chartW = vbW - padL - padR

  const TICKS = 4
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => Math.round((max / TICKS) * i))
  const yPos  = (v: number) => padT + chartH - (v / max) * chartH

  if (!data.length) return <p className="text-xs text-gray-400 py-8 text-center">No data in selected range</p>

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full" style={{ height }}>
      {/* Gridlines + Y-axis ticks */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={padL} x2={vbW - padR} y1={yPos(t)} y2={yPos(t)}
            stroke="#f1f5f9" strokeWidth="1" />
          <text x={padL - 4} y={yPos(t) + 3.5} textAnchor="end"
            fontSize="8" fill="#94a3b8" fontFamily="system-ui">
            {valuePrefix}{fmtK(t)}
          </text>
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        const bW    = W * 0.55
        const bX    = padL + i * W + (W - bW) / 2
        const bH    = Math.max(3, (d.value / max) * chartH)
        const bY    = yPos(d.value)
        const isHov = activeHover === i

        return (
          <g key={d.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}>
            {/* Bar bg (hover) */}
            <rect x={padL + i * W} y={padT} width={W} height={chartH}
              fill={isHov ? '#f8fafc' : 'transparent'} rx="4" />
            {/* Bar */}
            <rect x={bX} y={bY} width={bW} height={bH}
              fill={color} rx="3" opacity={isHov ? 1 : 0.82}
              style={{ transition: 'opacity 0.15s' }} />
            {/* Tooltip */}
            {isHov && (
              <g>
                <rect x={bX + bW/2 - 22} y={bY - 20} width={44} height={16} rx="4"
                  fill="#1e1b4b" opacity={0.92} />
                <text x={bX + bW/2} y={bY - 9} textAnchor="middle"
                  fontSize="8" fill="white" fontWeight="bold" fontFamily="system-ui">
                  {valuePrefix}{fmtK(d.value)}
                </text>
              </g>
            )}
            {/* X label */}
            <text x={padL + i * W + W / 2} y={vbH - 5}
              textAnchor="middle" fontSize="8" fill={isHov ? '#6366f1' : '#94a3b8'}
              fontFamily="system-ui" fontWeight={isHov ? 'bold' : 'normal'}>
              {d.label}
            </text>
          </g>
        )
      })}

      {/* Y axis line */}
      <line x1={padL} x2={padL} y1={padT} y2={vbH - padB} stroke="#e2e8f0" strokeWidth="1" />
      {/* X axis line */}
      <line x1={padL} x2={vbW - padR} y1={vbH - padB} y2={vbH - padB} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  )
}

/* ─── Line chart (SVG with area fill) ───────────────────────── */
function LineChart({ data, height = 160, color = '#6366f1', valuePrefix = '' }: {
  data: { label: string; value: number }[]
  height?: number; color?: string; valuePrefix?: string
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const activeHover = mounted ? hovered : null
  const max   = Math.max(...data.map(d => d.value), 1)
  const padL  = 38; const padB = 22; const padT = 20; const padR = 12
  const vbW   = 600; const vbH = height
  const chartH = vbH - padT - padB
  const chartW = vbW - padL - padR
  const TICKS  = 4

  if (!data.length) return <p className="text-xs text-gray-400 py-8 text-center">No data in selected range</p>

  const pts = data.map((d, i) => ({
    x: padL + (i / Math.max(data.length - 1, 1)) * chartW,
    y: padT + chartH - (d.value / max) * chartH,
    ...d,
  }))

  const linePath  = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath  = `${linePath} L ${pts[pts.length-1].x} ${padT+chartH} L ${pts[0].x} ${padT+chartH} Z`
  const ticks     = Array.from({ length: TICKS + 1 }, (_, i) => Math.round((max / TICKS) * i))

  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Gridlines */}
      {ticks.map(t => {
        const y = padT + chartH - (t / max) * chartH
        return (
          <g key={t}>
            <line x1={padL} x2={vbW - padR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="#94a3b8">{valuePrefix}{fmtK(t)}</text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#lineArea)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

      {/* Points + tooltips */}
      {pts.map((p, i) => (
        <g key={p.label}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'pointer' }}>
          <circle cx={p.x} cy={p.y} r={activeHover === i ? 5 : 3.5}
            fill={color} stroke="white" strokeWidth="1.5"
            style={{ transition: 'r 0.1s' }} />
          {activeHover === i && (
            <g>
              <rect x={p.x - 22} y={p.y - 22} width={44} height={16} rx="4" fill="#1e1b4b" opacity={0.92} />
              <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">{valuePrefix}{fmtK(p.value)}</text>
            </g>
          )}
          <text x={p.x} y={vbH - 5} textAnchor="middle" fontSize="8"
            fill={activeHover === i ? color : '#94a3b8'} fontWeight={activeHover === i ? 'bold' : 'normal'}>
            {p.label}
          </text>
        </g>
      ))}

      <line x1={padL} x2={padL} y1={padT} y2={vbH - padB} stroke="#e2e8f0" strokeWidth="1" />
      <line x1={padL} x2={vbW - padR} y1={vbH - padB} y2={vbH - padB} stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  )
}

/* ─── Donut chart (SVG with hover) ──────────────────────────── */
function DonutChart({ segments, size = 120 }: {
  segments: { label: string; value: number; color: string }[]; size?: number
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const activeHover = mounted ? hovered : null
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = 36; const cx = 50; const cy = 50
  let cumulative = 0

  const arcs = segments.filter(s => s.value > 0).map((seg, idx) => {
    const pct   = seg.value / total
    const start = cumulative * 2 * Math.PI - Math.PI / 2
    cumulative += pct
    const end   = cumulative * 2 * Math.PI - Math.PI / 2
    const large = pct > 0.5 ? 1 : 0
    const rr    = activeHover === idx ? r + 4 : r
    const x1    = cx + rr * Math.cos(start); const y1 = cy + rr * Math.sin(start)
    const x2    = cx + rr * Math.cos(end);   const y2 = cy + rr * Math.sin(end)
    return { ...seg, d: `M ${cx} ${cy} L ${x1} ${y1} A ${rr} ${rr} 0 ${large} 1 ${x2} ${y2} Z`, idx, pct }
  })

  const hovSeg = activeHover !== null ? arcs[activeHover] : null

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ overflow: 'visible' }}>
      {arcs.map((a) => (
        <path key={a.label} d={a.d} fill={a.color}
          opacity={activeHover === null || activeHover === a.idx ? 0.88 : 0.35}
          style={{ cursor: 'pointer', transition: 'opacity 0.15s, d 0.15s' }}
          onMouseEnter={() => setHovered(a.idx)}
          onMouseLeave={() => setHovered(null)}>
          <title>{a.label}: {a.value} ({Math.round(a.pct*100)}%)</title>
        </path>
      ))}
      <circle cx={cx} cy={cy} r={22} fill="white" />
      {hovSeg ? (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#111827">{hovSeg.value}</text>
          <text x={cx} y={cy + 6} textAnchor="middle" fontSize="5.5" fill="#6b7280">{Math.round(hovSeg.pct*100)}%</text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#111827">{fmt(total)}</text>
          <text x={cx} y={cy + 7} textAnchor="middle" fontSize="5.5" fill="#9ca3af">total</text>
        </>
      )}
    </svg>
  )
}

/* ─── KPI Card ───────────────────────────────────────────────── */
function KPI({ label, value, sub, icon: Icon, color }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-gray-900 leading-none">{typeof value === 'number' ? fmt(value) : value}</p>
        <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

/* ─── Section header ─────────────────────────────────────────── */
function SectionHeader({ title, icon: Icon, onExportCSV, onExportPDF }: {
  title: string; icon: React.ElementType; onExportCSV?: () => void; onExportPDF?: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-indigo-500" />
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      <div className="flex gap-1.5">
        {onExportCSV && (
          <button onClick={onExportCSV}
            className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors">
            <FiDownload size={10} /> CSV
          </button>
        )}
        {onExportPDF && (
          <button onClick={onExportPDF}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 border border-indigo-200 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
            <FiDownload size={10} /> PDF
          </button>
        )}
      </div>
    </div>
  )
}

/* ─── Date range picker ──────────────────────────────────────── */
const PRESETS = [
  { label: 'All time',      from: '',                    to: '' },
  { label: 'Today',         from: 'd0',                  to: 'd0' },
  { label: 'Last 7 days',   from: 'd7',                  to: 'd0' },
  { label: 'Last 30 days',  from: 'd30',                 to: 'd0' },
  { label: 'This month',    from: 'monthStart',          to: 'd0' },
  { label: 'Last month',    from: 'lastMonthStart',      to: 'lastMonthEnd' },
  { label: 'This year',     from: 'yearStart',           to: 'd0' },
  { label: 'Last year',     from: 'lastYearStart',       to: 'lastYearEnd' },
]

function resolvePreset(val: string): string {
  if (!val || !val.startsWith('d') && !val.includes('month') && !val.includes('year')) return val
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
  if (val === 'd0')            return iso(now)
  if (val.startsWith('d'))     { const d = new Date(now); d.setDate(d.getDate() - parseInt(val.slice(1))); return iso(d) }
  if (val === 'monthStart')    return `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`
  if (val === 'lastMonthStart'){ const d = new Date(now.getFullYear(), now.getMonth()-1, 1); return iso(d) }
  if (val === 'lastMonthEnd')  { const d = new Date(now.getFullYear(), now.getMonth(), 0);   return iso(d) }
  if (val === 'yearStart')     return `${now.getFullYear()}-01-01`
  if (val === 'lastYearStart') return `${now.getFullYear()-1}-01-01`
  if (val === 'lastYearEnd')   return `${now.getFullYear()-1}-12-31`
  return val
}

/* ─── Rank table ─────────────────────────────────────────────── */
function RankTable({ rows, valueLabel = 'Count' }: {
  rows: { label: string; count: number; extra?: string }[]; valueLabel?: string
}) {
  const max = Math.max(...rows.map(r => r.count), 1)
  return (
    <div className="space-y-1.5">
      {rows.slice(0, 10).map((r, i) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-300 w-4 shrink-0">{i+1}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold text-gray-700 truncate">{r.label}</span>
              <span className="text-[11px] font-black text-gray-800 ml-2 shrink-0">{fmt(r.count)}{r.extra ? ` ${r.extra}` : ''}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-400 transition-all" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function ReportsDashboard({ data }: { data: ReportData }) {
  const today = new Date()
  const pad   = (n: number) => String(n).padStart(2, '0')

  const [preset,   setPreset]   = useState('Last 30 days')
  const [fromRaw,  setFromRaw]  = useState('d30')
  const [toRaw,    setToRaw]    = useState('d0')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo,   setCustomTo]   = useState('')
  const [activeTab,  setActiveTab]  = useState<'overview'|'bookings'|'revenue'|'inquiries'|'subscribers'|'donations'>('overview')

  const from = customFrom || resolvePreset(fromRaw)
  const to   = customTo   || resolvePreset(toRaw)

  /* ── Filtered datasets ── */
  const bookings      = useMemo(() => data.bookings.filter(b      => dateInRange(b.createdAt,      from, to)), [data, from, to])
  const inquiries     = useMemo(() => data.inquiries.filter(i     => dateInRange(i.createdAt,      from, to)), [data, from, to])
  const consultations = useMemo(() => data.consultations.filter(c => dateInRange(c.createdAt,      from, to)), [data, from, to])
  const newsletter    = useMemo(() => data.newsletter.filter(n    => dateInRange(n.createdAt,      from, to)), [data, from, to])
  const donations     = useMemo(() => data.donations.filter(d     => dateInRange(d.createdAt,      from, to)), [data, from, to])

  /* ── Revenue ── */
  const paidBookings   = bookings.filter(b => b.paymentStatus === 'PAID')
  const totalRevenue   = paidBookings.reduce((s, b) => s + b.totalPrice, 0)
  const partialRevenue = bookings.filter(b => b.paymentStatus === 'PARTIAL').reduce((s, b) => s + b.totalPrice, 0)
  const donationTotal  = donations.filter(d => d.status === 'COMPLETED').reduce((s, d) => s + d.amount, 0)
  const totalPax       = bookings.reduce((s, b) => s + b.paxAdult + b.paxChild + b.paxInfant, 0)
  const avgBookingVal  = bookings.length ? Math.round(totalRevenue / (paidBookings.length || 1)) : 0

  /* ── Monthly revenue for bar chart ── */
  const monthlyRevenue = useMemo(() => {
    const map: Record<string, number> = {}
    paidBookings.forEach(b => {
      const d = new Date(b.createdAt)
      const k = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      map[k] = (map[k] ?? 0) + b.totalPrice
    })
    return Object.entries(map).slice(-12).map(([label, value]) => ({ label: label.split(' ')[0], value }))
  }, [paidBookings])

  /* ── Monthly bookings count ── */
  const monthlyBookings = useMemo(() => {
    const map: Record<string, number> = {}
    bookings.forEach(b => {
      const d = new Date(b.createdAt)
      const k = MONTHS[d.getMonth()]
      map[k] = (map[k] ?? 0) + 1
    })
    return Object.entries(map).slice(-12).map(([label, value]) => ({ label, value }))
  }, [bookings])

  /* ── Status distribution ── */
  const statusDist = useMemo(() =>
    countBy(bookings, b => b.status).map(s => ({ ...s, color: BOOKING_STATUS_COLOR[s.label] ?? '#6b7280' }))
  , [bookings])

  const payDist = useMemo(() =>
    countBy(bookings, b => b.paymentStatus).map(s => ({ ...s, color: PAY_COLOR[s.label] ?? '#6b7280' }))
  , [bookings])

  /* ── Top packages ── */
  const topPackages = useMemo(() =>
    countBy(bookings, b => b.title).map(r => ({
      ...r,
      extra: `· LKR ${fmtK(bookings.filter(b => b.title === r.label && b.paymentStatus === 'PAID').reduce((s,b) => s+b.totalPrice, 0))}`
    }))
  , [bookings])

  /* ── Destination breakdown ── */
  const topDestinations = useMemo(() =>
    countBy(bookings.filter(b => b.destination), b => b.destination)
  , [bookings])

  /* ── Category breakdown ── */
  const categoryBreakdown = useMemo(() =>
    countBy(bookings, b => b.category)
  , [bookings])

  /* ── Inquiry funnel ── */
  const inquiryByStatus    = useMemo(() => countBy(inquiries, i => i.status),    [inquiries])
  const conversionRate     = inquiries.length ? Math.round((inquiries.filter(i => i.status === 'CONVERTED').length / inquiries.length) * 100) : 0

  /* ── Subscriber growth ── */
  const subGrowth = useMemo(() => {
    const map: Record<string, number> = {}
    newsletter.forEach(n => {
      const d = new Date(n.createdAt)
      const k = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
      map[k] = (map[k] ?? 0) + 1
    })
    return Object.entries(map).slice(-12).map(([label, value]) => ({ label: label.split(' ')[0], value }))
  }, [newsletter])

  /* ─── Export helpers ─── */
  const exportBookingsCSV = () => toCSV(bookings.map(b => ({
    'Booking Ref':    b.bookingRef,
    'Customer':       b.customerName,
    'Email':          b.customerEmail,
    'Package/Tour':   b.title,
    'Type':           b._type,
    'Category':       b.category,
    'Destination':    b.destination,
    'Travel Date':    b.travelDate.slice(0,10),
    'Created':        b.createdAt.slice(0,10),
    'Status':         b.status,
    'Payment':        b.paymentStatus,
    'Adults':         b.paxAdult,
    'Children':       b.paxChild,
    'Total (LKR)':    b.totalPrice,
    'Discount (LKR)': b.discount,
  })), `bookings-${from}-to-${to}.csv`)

  const exportRevenueCSV = () => toCSV(paidBookings.map(b => ({
    'Date':      b.createdAt.slice(0,10),
    'Ref':       b.bookingRef,
    'Customer':  b.customerName,
    'Package':   b.title,
    'Amount':    b.totalPrice,
    'Discount':  b.discount,
    'Net':       b.totalPrice - b.discount,
  })), `revenue-${from}-to-${to}.csv`)

  const exportInquiriesCSV = () => toCSV(inquiries.map(i => ({
    'Date':        i.createdAt.slice(0,10),
    'Status':      i.status,
    'Package':     i.package?.title ?? '',
    'Destination': i.destination ?? '',
  })), `inquiries-${from}-to-${to}.csv`)

  const exportSubscribersCSV = () => toCSV(newsletter.map(n => ({
    'Email':    n.email,
    'Status':   n.isActive ? 'Active' : 'Unsubscribed',
    'Joined':   n.createdAt.slice(0,10),
  })), `subscribers-${from}-to-${to}.csv`)

  const exportDonationsCSV = () => toCSV(donations.map(d => ({
    'Date':   d.createdAt.slice(0,10),
    'Donor':  d.donorName ?? 'Anonymous',
    'Email':  d.donorEmail ?? '',
    'Amount': d.amount,
    'Status': d.status,
  })), `donations-${from}-to-${to}.csv`)

  const exportBookingsPDF = () => printReport(`Bookings Report (${from} → ${to})`, bookings.map(b => ({
    'Ref':       b.bookingRef.slice(-8).toUpperCase(),
    'Customer':  b.customerName,
    'Package':   b.title,
    'Date':      b.travelDate.slice(0,10),
    'Status':    b.status,
    'Payment':   b.paymentStatus,
    'LKR':       fmt(b.totalPrice),
  })))

  const exportRevenuePDF = () => printReport(`Revenue Report (${from} → ${to})`, paidBookings.map(b => ({
    'Date':     b.createdAt.slice(0,10),
    'Customer': b.customerName,
    'Package':  b.title,
    'Amount':   `LKR ${fmt(b.totalPrice)}`,
    'Discount': b.discount ? `LKR ${fmt(b.discount)}` : '—',
    'Net':      `LKR ${fmt(b.totalPrice - b.discount)}`,
  })))

  const exportFullPDF = () => {
    const html = buildFullReportHTML(from, to, bookings, inquiries, consultations, newsletter, donations, totalRevenue, partialRevenue, avgBookingVal, totalPax, conversionRate)
    const win = window.open('', '_blank')!
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 800)
  }

  const TABS = [
    { key: 'overview',     label: 'Overview',     icon: FiBarChart2 },
    { key: 'bookings',     label: 'Bookings',      icon: FiPackage },
    { key: 'revenue',      label: 'Revenue',       icon: FiDollarSign },
    { key: 'inquiries',    label: 'Inquiries',     icon: FiInbox },
    { key: 'subscribers',  label: 'Subscribers',   icon: FiMail },
    { key: 'donations',    label: 'Donations',     icon: FiHeart },
  ] as const

  return (
    <div className="space-y-5">

      {/* ── Date filter bar ── */}
      <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <FiCalendar size={14} className="text-indigo-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Date Range</span>
          </div>

          {/* Preset pills */}
          <div className="flex gap-1.5 flex-wrap">
            {PRESETS.map(p => (
              <button key={p.label}
                onClick={() => { setPreset(p.label); setFromRaw(p.from); setToRaw(p.to); setCustomFrom(''); setCustomTo('') }}
                className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap ${
                  preset === p.label && !customFrom
                    ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="flex items-center gap-2 ml-auto">
            <input type="date" value={customFrom}
              onChange={e => { setCustomFrom(e.target.value); setPreset('Custom') }}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-300 bg-white" />
            <span className="text-gray-400 text-xs">to</span>
            <input type="date" value={customTo}
              onChange={e => { setCustomTo(e.target.value); setPreset('Custom') }}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-300 bg-white" />
          </div>

          {/* Export all button */}
          <button onClick={exportFullPDF}
            className="flex items-center gap-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl transition-colors shadow-sm shadow-indigo-200 shrink-0">
            <FiDownload size={13} /> Export Full PDF
          </button>
        </div>

        {/* Active range indicator */}
        {(from || to) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <FiFilter size={11} className="text-gray-400" />
            <span className="text-[11px] text-gray-500">
              Showing data{from ? <> from <strong className="text-gray-700">{from}</strong></> : ''}{to ? <> to <strong className="text-gray-700">{to}</strong></> : ''}
              {' '}—{' '}
              <strong className="text-indigo-600">{bookings.length}</strong> bookings,{' '}
              <strong className="text-indigo-600">{inquiries.length}</strong> inquiries
            </span>
          </div>
        )}
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI label="Total Bookings"   value={bookings.length}         icon={FiPackage}    color="bg-indigo-50 text-indigo-600" />
        <KPI label="Revenue (LKR)"    value={fmtK(totalRevenue)}       icon={FiDollarSign} color="bg-emerald-50 text-emerald-600" sub={`${paidBookings.length} paid`} />
        <KPI label="Total Pax"        value={totalPax}                  icon={FiUsers}      color="bg-blue-50 text-blue-600" />
        <KPI label="Avg Booking"      value={`LKR ${fmtK(avgBookingVal)}`} icon={FiTrendingUp} color="bg-amber-50 text-amber-600" />
        <KPI label="Inquiries"        value={inquiries.length}          icon={FiInbox}      color="bg-purple-50 text-purple-600" sub={`${conversionRate}% converted`} />
        <KPI label="Subscribers"      value={newsletter.length}         icon={FiMail}       color="bg-pink-50 text-pink-600" sub={`${newsletter.filter(n=>n.isActive).length} active`} />
      </div>

      {/* ── Tab nav ── */}
      <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1.5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* ════════════ OVERVIEW ════════════ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Monthly bookings bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <SectionHeader title="Monthly Bookings" icon={FiBarChart2} />
            <BarChart data={monthlyBookings} color="#6366f1" height={160} />
          </div>

          {/* Monthly revenue line */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <SectionHeader title="Monthly Revenue (LKR)" icon={FiDollarSign} />
            <LineChart data={monthlyRevenue} color="#22c55e" height={160} valuePrefix="LKR " />
          </div>

          {/* Booking status donut */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <SectionHeader title="Booking Status Distribution" icon={FiPieChart} />
            <div className="flex items-center gap-5 flex-wrap">
              <DonutChart segments={statusDist.map(s => ({ label: s.label, value: s.count, color: s.color }))} size={110} />
              <div className="flex-1 space-y-1.5 min-w-40">
                {statusDist.slice(0,8).map(s => (
                  <div key={s.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-[11px] text-gray-600 capitalize">{s.label.replace(/_/g,' ').toLowerCase()}</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-800">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment status donut */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <SectionHeader title="Payment Status" icon={FiPieChart} />
            <div className="flex items-center gap-5 flex-wrap">
              <DonutChart segments={payDist.map(s => ({ label: s.label, value: s.count, color: s.color }))} size={110} />
              <div className="flex-1 space-y-1.5 min-w-40">
                {payDist.map(s => (
                  <div key={s.label} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
                      <span className="text-[11px] text-gray-600 capitalize">{s.label.toLowerCase()}</span>
                    </div>
                    <span className="text-[11px] font-bold text-gray-800">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top packages */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <SectionHeader title="Top Packages / Tours" icon={FiPackage} />
            {topPackages.length ? <RankTable rows={topPackages} /> : <p className="text-xs text-gray-400 py-6 text-center">No data</p>}
          </div>

          {/* Inquiry funnel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <SectionHeader title="Inquiry Funnel" icon={FiInbox} />
            <div className="space-y-3 mb-4">
              {inquiryByStatus.map(s => {
                const pct = inquiries.length ? Math.round((s.count / inquiries.length) * 100) : 0
                return (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-600 capitalize">{s.label.toLowerCase()}</span>
                      <span className="font-bold text-gray-800">{s.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex justify-between text-xs">
              <span className="font-semibold text-emerald-700">Conversion Rate</span>
              <span className="font-black text-emerald-700">{conversionRate}%</span>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ BOOKINGS ════════════ */}
      {activeTab === 'bookings' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionHeader title="Top Packages / Tours" icon={FiPackage} onExportCSV={exportBookingsCSV} onExportPDF={exportBookingsPDF} />
              <RankTable rows={topPackages} />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionHeader title="By Category" icon={FiPieChart} />
              <RankTable rows={categoryBreakdown} />
            </div>
            {topDestinations.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <SectionHeader title="By Destination" icon={FiBarChart2} />
                <RankTable rows={topDestinations} />
              </div>
            )}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionHeader title="Monthly Volume" icon={FiTrendingUp} />
              <BarChart data={monthlyBookings} color="#6366f1" height={160} />
            </div>
          </div>

          {/* Bookings table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-800 text-sm">All Bookings ({bookings.length})</p>
              <div className="flex gap-2">
                <button onClick={exportBookingsCSV} className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <FiDownload size={12} /> Export CSV
                </button>
                <button onClick={exportBookingsPDF} className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-500 text-white px-3 py-1.5 rounded-xl hover:bg-indigo-600 transition-colors">
                  <FiDownload size={12} /> Export PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                    {['Ref','Customer','Package','Travel Date','Created','Status','Payment','LKR'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 50).map(b => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-2.5 font-mono text-gray-400">{b.bookingRef.slice(-8).toUpperCase()}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800 whitespace-nowrap">{b.customerName}</td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-40 truncate">{b.title}</td>
                      <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{b.travelDate.slice(0,10)}</td>
                      <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">{b.createdAt.slice(0,10)}</td>
                      <td className="px-4 py-2.5"><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{b.status}</span></td>
                      <td className="px-4 py-2.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.paymentStatus==='PAID'?'bg-emerald-50 text-emerald-600':b.paymentStatus==='UNPAID'?'bg-red-50 text-red-600':'bg-amber-50 text-amber-600'}`}>{b.paymentStatus}</span></td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800 text-right">{fmtK(b.totalPrice)}</td>
                    </tr>
                  ))}
                  {bookings.length > 50 && (
                    <tr><td colSpan={8} className="px-4 py-3 text-center text-xs text-gray-400">Showing 50 of {bookings.length} — export CSV for full data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ REVENUE ════════════ */}
      {activeTab === 'revenue' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPI label="Confirmed Revenue"  value={`LKR ${fmtK(totalRevenue)}`}   icon={FiDollarSign}  color="bg-emerald-50 text-emerald-600" sub={`${paidBookings.length} paid bookings`} />
            <KPI label="Partial Revenue"    value={`LKR ${fmtK(partialRevenue)}`} icon={FiTrendingUp}  color="bg-amber-50 text-amber-600"    sub="Awaiting full payment" />
            <KPI label="Avg Booking Value"  value={`LKR ${fmtK(avgBookingVal)}`}  icon={FiBarChart2}   color="bg-indigo-50 text-indigo-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionHeader title="Monthly Revenue Trend" icon={FiTrendingUp} onExportCSV={exportRevenueCSV} onExportPDF={exportRevenuePDF} />
              <LineChart data={monthlyRevenue} color="#22c55e" height={160} valuePrefix="LKR " />
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionHeader title="Revenue by Package" icon={FiPackage} />
              <RankTable rows={topPackages.map(r => ({
                label: r.label,
                count: bookings.filter(b=>b.title===r.label&&b.paymentStatus==='PAID').reduce((s,b)=>s+b.totalPrice,0),
                extra: 'LKR'
              }))} valueLabel="LKR" />
            </div>
          </div>

          {/* Revenue table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-800 text-sm">Paid Bookings ({paidBookings.length})</p>
              <div className="flex gap-2">
                <button onClick={exportRevenueCSV} className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                  <FiDownload size={12} /> CSV
                </button>
                <button onClick={exportRevenuePDF} className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600">
                  <FiDownload size={12} /> PDF
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                    {['Date','Customer','Package','Pax','Total','Discount','Net'].map(h => (
                      <th key={h} className={`px-4 py-2.5 ${h==='Total'||h==='Net'?'text-right':'text-left'} whitespace-nowrap`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paidBookings.slice(0, 50).map(b => (
                    <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-gray-400">{b.createdAt.slice(0,10)}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800">{b.customerName}</td>
                      <td className="px-4 py-2.5 text-gray-600 max-w-40 truncate">{b.title}</td>
                      <td className="px-4 py-2.5 text-gray-500">{b.paxAdult+b.paxChild+b.paxInfant}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-800 text-right">LKR {fmt(b.totalPrice)}</td>
                      <td className="px-4 py-2.5 text-red-500 text-right">{b.discount ? `LKR ${fmt(b.discount)}` : '—'}</td>
                      <td className="px-4 py-2.5 font-black text-emerald-600 text-right">LKR {fmt(b.totalPrice - b.discount)}</td>
                    </tr>
                  ))}
                  {paidBookings.length > 50 && (
                    <tr><td colSpan={7} className="px-4 py-3 text-center text-xs text-gray-400">Showing 50 of {paidBookings.length} — export for full data</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-indigo-100 bg-indigo-50/30">
                    <td colSpan={4} className="px-4 py-3 text-xs font-bold text-indigo-700">Total</td>
                    <td className="px-4 py-3 font-black text-indigo-700 text-right">LKR {fmt(paidBookings.reduce((s,b)=>s+b.totalPrice,0))}</td>
                    <td className="px-4 py-3 font-black text-red-500 text-right">LKR {fmt(paidBookings.reduce((s,b)=>s+b.discount,0))}</td>
                    <td className="px-4 py-3 font-black text-emerald-700 text-right">LKR {fmt(paidBookings.reduce((s,b)=>s+b.totalPrice-b.discount,0))}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ INQUIRIES ════════════ */}
      {activeTab === 'inquiries' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['NEW','CONTACTED','CONVERTED','CLOSED'].map(s => (
              <KPI key={s} label={s.charAt(0)+s.slice(1).toLowerCase()} value={inquiries.filter(i=>i.status===s).length}
                icon={FiInbox} color="bg-indigo-50 text-indigo-600" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionHeader title="Inquiry Funnel" icon={FiInbox} onExportCSV={exportInquiriesCSV} />
              {inquiryByStatus.map(s => {
                const pct = inquiries.length ? Math.round((s.count / inquiries.length) * 100) : 0
                return (
                  <div key={s.label} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-600">{s.label}</span>
                      <span className="font-bold text-gray-800">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              <div className="mt-4 bg-emerald-50 rounded-xl px-3 py-2 flex justify-between text-xs">
                <span className="font-semibold text-emerald-700">Conversion Rate</span>
                <span className="font-black text-emerald-700">{conversionRate}%</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <SectionHeader title="Consultation Methods" icon={FiVideo} />
              <RankTable rows={countBy(consultations, c => c.method)} />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-2">Consultation Status</p>
                <RankTable rows={countBy(consultations, c => c.status)} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ SUBSCRIBERS ════════════ */}
      {activeTab === 'subscribers' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPI label="New Subscribers"  value={newsletter.length}                           icon={FiMail}       color="bg-pink-50 text-pink-600" />
            <KPI label="Active"           value={newsletter.filter(n=>n.isActive).length}     icon={FiUsers}      color="bg-emerald-50 text-emerald-600" />
            <KPI label="Unsubscribed"     value={newsletter.filter(n=>!n.isActive).length}    icon={FiTrendingUp} color="bg-red-50 text-red-600" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <SectionHeader title="Subscriber Growth" icon={FiTrendingUp} onExportCSV={exportSubscribersCSV} />
            <LineChart data={subGrowth} color="#ec4899" height={160} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-800 text-sm">Subscriber List ({newsletter.length})</p>
              <button onClick={exportSubscribersCSV} className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                <FiDownload size={12} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase">
                    {['Email','Status','Joined'].map(h => <th key={h} className="px-4 py-2.5 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {newsletter.slice(0, 50).map(n => (
                    <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-medium text-gray-700">{n.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.isActive?'bg-emerald-50 text-emerald-600':'bg-gray-100 text-gray-500'}`}>
                          {n.isActive ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-gray-400">{n.createdAt.slice(0,10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ DONATIONS ════════════ */}
      {activeTab === 'donations' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KPI label="Total Donations"   value={donations.length}                                                           icon={FiHeart}      color="bg-red-50 text-red-600" />
            <KPI label="Confirmed (LKR)"   value={`LKR ${fmtK(donationTotal)}`}                                               icon={FiDollarSign} color="bg-emerald-50 text-emerald-600" />
            <KPI label="Avg Donation"      value={donations.length ? `LKR ${fmtK(Math.round(donationTotal/(donations.filter(d=>d.status==='COMPLETED').length||1)))}` : '—'} icon={FiTrendingUp} color="bg-pink-50 text-pink-600" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="font-bold text-gray-800 text-sm">Donations ({donations.length})</p>
              <button onClick={exportDonationsCSV} className="flex items-center gap-1.5 text-xs font-semibold bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl hover:bg-gray-50">
                <FiDownload size={12} /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase">
                    {['Date','Donor','Email','Amount','Status'].map(h => <th key={h} className="px-4 py-2.5 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {donations.slice(0, 50).map(d => (
                    <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-gray-400">{d.createdAt.slice(0,10)}</td>
                      <td className="px-4 py-2.5 font-semibold text-gray-700">{d.donorName ?? 'Anonymous'}</td>
                      <td className="px-4 py-2.5 text-gray-500">{d.donorEmail ?? '—'}</td>
                      <td className="px-4 py-2.5 font-bold text-gray-800">LKR {fmt(d.amount)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.status==='COMPLETED'?'bg-emerald-50 text-emerald-600':d.status==='PENDING'?'bg-amber-50 text-amber-600':'bg-gray-100 text-gray-500'}`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {donations.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-indigo-100 bg-indigo-50/30">
                      <td colSpan={3} className="px-4 py-3 text-xs font-bold text-indigo-700">Total Confirmed</td>
                      <td className="px-4 py-3 font-black text-emerald-700">LKR {fmt(donationTotal)}</td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
