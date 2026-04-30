'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  FiTrendingUp, FiTrendingDown, FiUsers, FiInbox, FiTarget, FiZap,
  FiBarChart2, FiCalendar, FiMail, FiArrowUp, FiArrowDown, FiMinus,
  FiPackage, FiVideo, FiActivity,
} from 'react-icons/fi'

/* ─── Types ── */
interface Booking {
  id: string; createdAt: string; status: string; paymentStatus: string
  totalPrice: number; discount: number; paxAdult: number; paxChild: number; paxInfant: number
  travelDate: string; customerEmail: string; title: string; category: string
  destination: string; region: string
}
interface Inquiry      { id: string; createdAt: string; status: string; destination?: string | null; package?: { title: string } | null }
interface Consultation { id: string; createdAt: string; status: string; method: string }
interface Sub          { id: string; isActive: boolean; createdAt: string }

interface Props {
  data: { bookings: Booking[]; inquiries: Inquiry[]; consultations: Consultation[]; newsletter: Sub[] }
}

/* ─── Constants ── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/* ─── Helpers ── */
function fmt(n: number) { return n.toLocaleString() }
function fmtK(n: number) { return n >= 1_000_000 ? `${(n/1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n) }
function isoMonth(iso: string) { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` }
function monthLabel(ym: string) { const [y,m] = ym.split('-'); return `${MONTHS[parseInt(m)-1]} ${y.slice(2)}` }

function getLast12Months(): string[] {
  const now = new Date()
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
}

function getPctChange(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0
  return Math.round(((curr - prev) / prev) * 100)
}

/* ─── SVG Line chart ── */
function MiniLine({ data, color = '#6366f1', height = 48 }: { data: number[]; color?: string; height?: number }) {
  const uid = React.useId()
  const gradId = `ml-${uid.replace(/:/g, '')}`
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!data.length || data.every(v => v === 0)) return <div style={{ height }} className="flex items-center justify-center text-xs text-gray-300">No data</div>
  const max = Math.max(...data, 1)
  const W = 200; const H = height; const pad = 4
  const pts = data.map((v, i) => ({ x: pad + (i / Math.max(data.length-1,1)) * (W - pad*2), y: H - pad - ((v/max)*(H-pad*2)) }))
  const line = pts.map((p,i) => `${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ')
  const area = `${line} L ${pts[pts.length-1].x} ${H-pad} L ${pts[0].x} ${H-pad} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {mounted && pts.map((p,i) => <circle key={i} cx={p.x} cy={p.y} r="2.5" fill={color} />)}
    </svg>
  )
}

/* ─── Full SVG Bar chart ── */
function FullBar({ data, color = '#6366f1', height = 180 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  const [hov, setHov] = useState<number|null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const ah = mounted ? hov : null
  if (!data.length) return <p className="text-xs text-gray-400 py-8 text-center">No data</p>
  const max = Math.max(...data.map(d=>d.value), 1)
  const W = 80; const padL = 34; const padB = 22; const padT = 12; const padR = 6
  const vbW = data.length * W + padL + padR; const vbH = height
  const cH = vbH - padT - padB
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(max * f))
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full" style={{ height }}>
      {ticks.map((t, ti) => {
        const y = padT + cH - (t/max)*cH
        return <g key={ti}>
          <line x1={padL} x2={vbW-padR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
          <text x={padL-4} y={y+3.5} textAnchor="end" fontSize="7" fill="#94a3b8">{fmtK(t)}</text>
        </g>
      })}
      {data.map((d,i) => {
        const bW = W*0.55; const bX = padL+i*W+(W-bW)/2
        const bH = Math.max(2,(d.value/max)*cH); const bY = padT+cH-bH
        const isH = ah === i
        return (
          <g key={d.label} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{cursor:'pointer'}}>
            <rect x={padL+i*W} y={padT} width={W} height={cH} fill={isH?'#f8fafc':'transparent'} rx="3"/>
            <rect x={bX} y={bY} width={bW} height={bH} fill={color} rx="2.5" opacity={isH?1:0.8}/>
            {isH && <g>
              <rect x={bX+bW/2-20} y={bY-18} width={40} height={14} rx="3" fill="#1e1b4b" opacity={0.9}/>
              <text x={bX+bW/2} y={bY-8} textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">{fmtK(d.value)}</text>
            </g>}
            <text x={padL+i*W+W/2} y={vbH-5} textAnchor="middle" fontSize="7" fill={isH?color:'#94a3b8'} fontWeight={isH?'bold':'normal'}>{d.label}</text>
          </g>
        )
      })}
      <line x1={padL} x2={padL} y1={padT} y2={vbH-padB} stroke="#e2e8f0" strokeWidth="1"/>
      <line x1={padL} x2={vbW-padR} y1={vbH-padB} y2={vbH-padB} stroke="#e2e8f0" strokeWidth="1"/>
    </svg>
  )
}

/* ─── Stacked bar (2 series) ── */
function StackedBar({ data, colors, height = 160 }: {
  data: { label: string; values: number[] }[]; colors: string[]; height?: number
}) {
  const [hov, setHov] = useState<number|null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const ah = mounted ? hov : null
  if (!data.length) return <p className="text-xs text-gray-400 py-8 text-center">No data</p>
  const max = Math.max(...data.map(d=>d.values.reduce((s,v)=>s+v,0)),1)
  const W = 80; const padL = 34; const padB = 22; const padT = 12; const padR = 6
  const vbW = data.length*W+padL+padR; const vbH = height; const cH = vbH-padT-padB
  const ticks = [0,0.5,1].map(f=>Math.round(max*f))
  return (
    <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full" style={{height}}>
      {ticks.map((t, ti) => {
        const y = padT+cH-(t/max)*cH
        return <g key={ti}>
          <line x1={padL} x2={vbW-padR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1"/>
          <text x={padL-4} y={y+3.5} textAnchor="end" fontSize="7" fill="#94a3b8">{fmtK(t)}</text>
        </g>
      })}
      {data.map((d,i) => {
        const bW=W*0.55; const bX=padL+i*W+(W-bW)/2
        const total=d.values.reduce((s,v)=>s+v,0)
        const isH=ah===i
        let curY=padT+cH
        return (
          <g key={d.label} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{cursor:'pointer'}}>
            <rect x={padL+i*W} y={padT} width={W} height={cH} fill={isH?'#f8fafc':'transparent'} rx="3"/>
            {d.values.map((v,j) => {
              const bH=Math.max(v>0?2:0,(v/max)*cH); curY-=bH
              return <rect key={j} x={bX} y={curY} width={bW} height={bH} fill={colors[j]??'#6b7280'} rx={j===d.values.length-1?'2.5 2.5 0 0':'0'} opacity={isH?1:0.82}/>
            })}
            {isH && <g>
              <rect x={bX+bW/2-20} y={padT+cH-(total/max)*cH-18} width={40} height={14} rx="3" fill="#1e1b4b" opacity={0.9}/>
              <text x={bX+bW/2} y={padT+cH-(total/max)*cH-8} textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">{total}</text>
            </g>}
            <text x={padL+i*W+W/2} y={vbH-5} textAnchor="middle" fontSize="7" fill={isH?colors[0]:'#94a3b8'} fontWeight={isH?'bold':'normal'}>{d.label}</text>
          </g>
        )
      })}
      <line x1={padL} x2={padL} y1={padT} y2={vbH-padB} stroke="#e2e8f0" strokeWidth="1"/>
      <line x1={padL} x2={vbW-padR} y1={vbH-padB} y2={vbH-padB} stroke="#e2e8f0" strokeWidth="1"/>
    </svg>
  )
}

/* ─── Funnel chart ── */
function FunnelChart({ steps }: { steps: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...steps.map(s=>s.value), 1)
  return (
    <div className="space-y-2">
      {steps.map((s,i) => {
        const pct = Math.round((s.value/max)*100)
        const dropPct = i > 0 && steps[i-1].value > 0 ? Math.round(((steps[i-1].value - s.value)/steps[i-1].value)*100) : 0
        return (
          <div key={s.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{background:s.color}}/>
                {s.label}
              </span>
              <div className="flex items-center gap-2">
                {i > 0 && dropPct > 0 && <span className="text-[10px] text-red-400 font-semibold">-{dropPct}%</span>}
                <span className="font-black text-gray-800">{fmt(s.value)}</span>
              </div>
            </div>
            <div className="h-6 bg-gray-100 rounded-lg overflow-hidden flex items-center">
              <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all"
                style={{width:`${pct}%`, background:s.color, minWidth: s.value > 0 ? '2rem' : 0}}>
                <span className="text-[9px] font-black text-white/90">{pct}%</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Trend badge ── */
function Trend({ pct }: { pct: number }) {
  if (pct > 0) return <span className="flex items-center gap-0.5 text-emerald-600 text-[11px] font-bold"><FiArrowUp size={10}/>{pct}%</span>
  if (pct < 0) return <span className="flex items-center gap-0.5 text-red-500 text-[11px] font-bold"><FiArrowDown size={10}/>{Math.abs(pct)}%</span>
  return <span className="flex items-center gap-0.5 text-gray-400 text-[11px] font-bold"><FiMinus size={10}/>0%</span>
}

/* ─── Metric card ── */
function MetricCard({ label, value, sub, trend, icon: Icon, color, sparkData, sparkColor }:{
  label: string; value: string|number; sub?: string; trend?: number
  icon: React.ElementType; color: string; sparkData?: number[]; sparkColor?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={16}/>
        </div>
        {trend !== undefined && <Trend pct={trend}/>}
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 leading-none">{typeof value==='number'?fmt(value):value}</p>
        <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {sparkData && sparkData.length > 0 && <MiniLine data={sparkData} color={sparkColor??'#6366f1'} height={40}/>}
    </div>
  )
}

/* ─── Section wrapper ── */
function Section({ title, icon: Icon, children, className = '' }: {
  title: string; icon: React.ElementType; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className="text-indigo-500"/>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

/* ─── Inquiry temperature badge ── */
function TempBadge({ temp }: { temp: 'HOT'|'WARM'|'COLD' }) {
  const map = {
    HOT:  { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500',    label: 'Hot' },
    WARM: { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-400',  label: 'Warm' },
    COLD: { bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-400',   label: 'Cold' },
  }
  const s = map[temp]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`}/>
      {s.label}
    </span>
  )
}

/* ─── Main Component ── */
export default function GrowthAnalytics({ data }: Props) {
  const [period, setPeriod] = useState<'3m'|'6m'|'12m'|'all'>('6m')

  const months12 = useMemo(() => getLast12Months(), [])

  /* Period cutoff */
  const cutoff = useMemo(() => {
    if (period === 'all') return ''
    const n = period === '3m' ? 3 : period === '6m' ? 6 : 12
    const d = new Date(); d.setMonth(d.getMonth() - n)
    return d.toISOString()
  }, [period])

  const inPeriod = (iso: string) => !cutoff || iso >= cutoff

  /* ── Filtered data ── */
  const bookings      = useMemo(() => data.bookings.filter(b      => inPeriod(b.createdAt)),      [data, cutoff])
  const inquiries     = useMemo(() => data.inquiries.filter(i     => inPeriod(i.createdAt)),      [data, cutoff])
  const consultations = useMemo(() => data.consultations.filter(c => inPeriod(c.createdAt)),      [data, cutoff])
  const subscribers   = useMemo(() => data.newsletter.filter(n    => inPeriod(n.createdAt)),      [data, cutoff])

  /* Previous period for comparison */
  const prevCutoff = useMemo(() => {
    if (period === 'all') return ''
    const n = period === '3m' ? 3 : period === '6m' ? 6 : 12
    const start = new Date(); start.setMonth(start.getMonth() - n*2)
    const end   = new Date(); end.setMonth(end.getMonth() - n)
    return { start: start.toISOString(), end: end.toISOString() }
  }, [period])

  const prevBookings  = useMemo(() => typeof prevCutoff === 'object' ? data.bookings.filter(b  => b.createdAt >= prevCutoff.start && b.createdAt < prevCutoff.end) : [], [data, prevCutoff])
  const prevInquiries = useMemo(() => typeof prevCutoff === 'object' ? data.inquiries.filter(i => i.createdAt >= prevCutoff.start && i.createdAt < prevCutoff.end) : [], [data, prevCutoff])
  const prevRevenue   = prevBookings.filter(b => b.paymentStatus === 'PAID').reduce((s,b) => s + b.totalPrice, 0)

  /* ── Core metrics ── */
  const paidBookings    = bookings.filter(b => b.paymentStatus === 'PAID')
  const totalRevenue    = paidBookings.reduce((s,b) => s + b.totalPrice, 0)
  const convertedInq    = inquiries.filter(i => i.status === 'CONVERTED').length
  const conversionRate  = inquiries.length ? Math.round((convertedInq / inquiries.length) * 100) : 0
  const prevConvRate    = prevInquiries.length ? Math.round((prevInquiries.filter(i=>i.status==='CONVERTED').length / prevInquiries.length) * 100) : 0
  const totalPax        = bookings.reduce((s,b) => s + b.paxAdult + b.paxChild + b.paxInfant, 0)
  const cancelRate      = bookings.length ? Math.round((bookings.filter(b=>b.status==='CANCELLED').length/bookings.length)*100) : 0

  /* ── Monthly series ── */
  const monthlyData = useMemo(() => {
    const months = period === '3m' ? months12.slice(-3) : period === '6m' ? months12.slice(-6) : months12
    const bookMap: Record<string,number> = {}
    const revMap:  Record<string,number> = {}
    const inqMap:  Record<string,number> = {}
    const subMap:  Record<string,number> = {}
    bookings.forEach(b  => { const m=isoMonth(b.createdAt); bookMap[m]=(bookMap[m]??0)+1; if(b.paymentStatus==='PAID') revMap[m]=(revMap[m]??0)+b.totalPrice })
    inquiries.forEach(i => { const m=isoMonth(i.createdAt); inqMap[m]=(inqMap[m]??0)+1 })
    subscribers.forEach(s => { const m=isoMonth(s.createdAt); subMap[m]=(subMap[m]??0)+1 })
    return months.map(m => ({
      label:  monthLabel(m),
      books:  bookMap[m] ?? 0,
      rev:    revMap[m]  ?? 0,
      inq:    inqMap[m]  ?? 0,
      subs:   subMap[m]  ?? 0,
    }))
  }, [bookings, inquiries, subscribers, period, months12])

  /* ── Lead source funnel ── */
  const totalLeads    = inquiries.length + consultations.length
  const consultBooked = bookings.filter(b => consultations.some(c => c.status === 'COMPLETED')).length
  const funnelSteps = [
    { label: 'Total Leads',          value: totalLeads,                         color: '#6366f1' },
    { label: 'Inquiries Received',   value: inquiries.length,                   color: '#8b5cf6' },
    { label: 'Consultations Done',   value: consultations.filter(c=>c.status==='COMPLETED').length, color: '#a855f7' },
    { label: 'Converted to Booking', value: convertedInq,                       color: '#22c55e' },
    { label: 'Paid Bookings',        value: paidBookings.length,                color: '#16a34a' },
  ]

  /* ── Lead rate per month ── */
  const leadRate = useMemo(() => {
    return monthlyData.map(m => ({ label: m.label, value: m.inq }))
  }, [monthlyData])

  /* ── Inquiry temperature classification ──
     HOT  = NEW or within 3 days of creation
     WARM = CONTACTED or within 7 days
     COLD = CLOSED or old
  */
  const classifyInquiry = (i: Inquiry): 'HOT'|'WARM'|'COLD' => {
    if (i.status === 'CONVERTED') return 'HOT'
    if (i.status === 'CLOSED') return 'COLD'
    const age = (Date.now() - new Date(i.createdAt).getTime()) / (1000*60*60*24)
    if (i.status === 'NEW' || age <= 3) return 'HOT'
    if (i.status === 'CONTACTED' || age <= 7) return 'WARM'
    return 'COLD'
  }

  const hotInq  = inquiries.filter(i => classifyInquiry(i) === 'HOT')
  const warmInq = inquiries.filter(i => classifyInquiry(i) === 'WARM')
  const coldInq = inquiries.filter(i => classifyInquiry(i) === 'COLD')

  /* ── Repeat customers ── */
  const emailCount: Record<string,number> = {}
  data.bookings.forEach(b => { emailCount[b.customerEmail] = (emailCount[b.customerEmail]??0)+1 })
  const repeatCustomers = Object.values(emailCount).filter(c => c > 1).length
  const totalUniqueCustomers = Object.keys(emailCount).length
  const repeatRate = totalUniqueCustomers ? Math.round((repeatCustomers/totalUniqueCustomers)*100) : 0

  /* ── Revenue by category ── */
  const catRev = useMemo(() => {
    const m: Record<string,number> = {}
    paidBookings.forEach(b => { m[b.category]=(m[b.category]??0)+b.totalPrice })
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([label,value]) => ({ label, value }))
  }, [paidBookings])

  /* ── Top performing packages ── */
  const topPkgs = useMemo(() => {
    const m: Record<string,{count:number;rev:number}> = {}
    bookings.forEach(b => {
      if (!m[b.title]) m[b.title]={count:0,rev:0}
      m[b.title].count++
      if (b.paymentStatus==='PAID') m[b.title].rev+=b.totalPrice
    })
    return Object.entries(m).sort((a,b)=>b[1].count-a[1].count).slice(0,8).map(([label,v]) => ({label,...v}))
  }, [bookings])
  const maxPkg = Math.max(...topPkgs.map(p=>p.count),1)

  /* ── Growth velocity (MoM for last 2 complete months) ── */
  const lastTwoMonths = months12.slice(-2)
  const [prevM, currM] = lastTwoMonths
  const booksThisMonth = bookings.filter(b=>isoMonth(b.createdAt)===currM).length
  const booksPrevMonth = bookings.filter(b=>isoMonth(b.createdAt)===prevM).length
  const inqThisMonth   = inquiries.filter(i=>isoMonth(i.createdAt)===currM).length
  const inqPrevMonth   = inquiries.filter(i=>isoMonth(i.createdAt)===prevM).length

  /* ── Spark data for cards ── */
  const bookSpark = monthlyData.map(m=>m.books)
  const inqSpark  = monthlyData.map(m=>m.inq)
  const revSpark  = monthlyData.map(m=>m.rev)

  /* ── Stacked bookings vs inquiries ── */
  const stackedData = monthlyData.map(m => ({ label: m.label, values: [m.books, m.inq] }))

  return (
    <div className="space-y-5">

      {/* ── Period selector ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-5 py-3.5 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider shrink-0">
          <FiCalendar size={13} className="text-indigo-500"/>
          Analysis Period
        </div>
        <div className="flex gap-1.5">
          {(['3m','6m','12m','all'] as const).map(p => (
            <button key={p}
              onClick={() => setPeriod(p)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors ${
                period === p ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {p === '3m' ? 'Last 3 Months' : p === '6m' ? 'Last 6 Months' : p === '12m' ? 'Last 12 Months' : 'All Time'}
            </button>
          ))}
        </div>
        <div className="ml-auto text-[11px] text-gray-400">
          vs previous period: <span className="font-semibold text-gray-600">{prevBookings.length} bookings &nbsp;·&nbsp; LKR {fmtK(prevRevenue)} revenue</span>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard label="Bookings" value={bookings.length} trend={getPctChange(bookings.length, prevBookings.length)}
          icon={FiPackage} color="bg-indigo-50 text-indigo-600" sparkData={bookSpark} sparkColor="#6366f1" sub={`${booksThisMonth} this month`}/>
        <MetricCard label="Revenue (LKR)" value={fmtK(totalRevenue)} trend={getPctChange(totalRevenue, prevRevenue)}
          icon={FiTrendingUp} color="bg-emerald-50 text-emerald-600" sparkData={revSpark} sparkColor="#22c55e" sub={`${paidBookings.length} paid`}/>
        <MetricCard label="Total Inquiries" value={inquiries.length} trend={getPctChange(inquiries.length, prevInquiries.length)}
          icon={FiInbox} color="bg-purple-50 text-purple-600" sparkData={inqSpark} sparkColor="#a855f7" sub={`${inqThisMonth} this month`}/>
        <MetricCard label="Conversion Rate" value={`${conversionRate}%`} trend={getPctChange(conversionRate, prevConvRate)}
          icon={FiTarget} color="bg-amber-50 text-amber-600" sub={`${convertedInq} converted`}/>
        <MetricCard label="Total Pax" value={totalPax}
          icon={FiUsers} color="bg-blue-50 text-blue-600" sub="Passengers booked"/>
        <MetricCard label="Repeat Rate" value={`${repeatRate}%`}
          icon={FiZap} color="bg-rose-50 text-rose-600" sub={`${repeatCustomers} of ${totalUniqueCustomers} customers`}/>
      </div>

      {/* ── Hot / Warm / Cold inquiries ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center">
                <FiZap size={14} className="text-white"/>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Hot Leads</p>
                <p className="text-[10px] text-gray-500">New · Recently active · Converted</p>
              </div>
            </div>
            <span className="text-3xl font-black text-red-600">{hotInq.length}</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {hotInq.slice(0,5).map(i => (
              <div key={i.id} className="flex items-center justify-between bg-white/60 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-gray-700 font-medium truncate">{i.package?.title ?? i.destination ?? 'General'}</span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <TempBadge temp="HOT"/>
                  <span className="text-gray-400">{i.status}</span>
                </div>
              </div>
            ))}
            {hotInq.length > 5 && <p className="text-center text-[10px] text-red-400 font-semibold">+{hotInq.length-5} more</p>}
            {hotInq.length === 0 && <p className="text-center text-xs text-gray-400 py-2">No hot leads in this period</p>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center">
                <FiActivity size={14} className="text-white"/>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Warm Leads</p>
                <p className="text-[10px] text-gray-500">Contacted · 4–7 days old</p>
              </div>
            </div>
            <span className="text-3xl font-black text-amber-600">{warmInq.length}</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {warmInq.slice(0,5).map(i => (
              <div key={i.id} className="flex items-center justify-between bg-white/60 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-gray-700 font-medium truncate">{i.package?.title ?? i.destination ?? 'General'}</span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <TempBadge temp="WARM"/>
                  <span className="text-gray-400">{i.status}</span>
                </div>
              </div>
            ))}
            {warmInq.length > 5 && <p className="text-center text-[10px] text-amber-500 font-semibold">+{warmInq.length-5} more</p>}
            {warmInq.length === 0 && <p className="text-center text-xs text-gray-400 py-2">No warm leads in this period</p>}
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
                <FiMinus size={14} className="text-white"/>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">Cold Leads</p>
                <p className="text-[10px] text-gray-500">Closed · 8+ days no action</p>
              </div>
            </div>
            <span className="text-3xl font-black text-blue-600">{coldInq.length}</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {coldInq.slice(0,5).map(i => (
              <div key={i.id} className="flex items-center justify-between bg-white/60 rounded-xl px-2.5 py-1.5 text-xs">
                <span className="text-gray-700 font-medium truncate">{i.package?.title ?? i.destination ?? 'General'}</span>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <TempBadge temp="COLD"/>
                  <span className="text-gray-400">{i.status}</span>
                </div>
              </div>
            ))}
            {coldInq.length > 5 && <p className="text-center text-[10px] text-blue-500 font-semibold">+{coldInq.length-5} more</p>}
            {coldInq.length === 0 && <p className="text-center text-xs text-gray-400 py-2">No cold leads in this period</p>}
          </div>
        </div>
      </div>

      {/* ── Lead conversion funnel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Lead-to-Booking Conversion Funnel" icon={FiTarget}>
          <FunnelChart steps={funnelSteps}/>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-indigo-50 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-indigo-700">{conversionRate}%</p>
              <p className="text-[10px] font-semibold text-indigo-500 mt-0.5">Lead Conversion Rate</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-xl font-black text-emerald-700">{inquiries.length > 0 ? Math.round((paidBookings.length/inquiries.length)*100) : 0}%</p>
              <p className="text-[10px] font-semibold text-emerald-500 mt-0.5">Inquiry → Paid Rate</p>
            </div>
          </div>
        </Section>

        <Section title="Monthly Bookings vs Inquiries" icon={FiBarChart2}>
          <div className="flex gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-indigo-400"/>Bookings
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
              <span className="w-3 h-3 rounded-sm bg-purple-300"/>Inquiries
            </div>
          </div>
          <StackedBar data={stackedData} colors={['#6366f1','#c4b5fd']} height={160}/>
        </Section>
      </div>

      {/* ── Growth trends ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Booking Growth Trend" icon={FiTrendingUp}>
          <FullBar data={monthlyData.map(m=>({label:m.label,value:m.books}))} color="#6366f1" height={160}/>
          <div className="mt-3 flex gap-3 flex-wrap">
            <div className="flex-1 bg-gray-50 rounded-xl p-3 min-w-24">
              <p className="text-lg font-black text-gray-800">{booksThisMonth}</p>
              <p className="text-[10px] text-gray-500 font-semibold">This month</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 min-w-24">
              <p className="text-lg font-black text-gray-800">{booksPrevMonth}</p>
              <p className="text-[10px] text-gray-500 font-semibold">Last month</p>
            </div>
            <div className="flex-1 bg-indigo-50 rounded-xl p-3 min-w-24">
              <div className="flex items-center gap-1"><Trend pct={getPctChange(booksThisMonth, booksPrevMonth)}/></div>
              <p className="text-[10px] text-indigo-500 font-semibold">MoM Change</p>
            </div>
          </div>
        </Section>

        <Section title="Lead Generation Rate" icon={FiInbox}>
          <FullBar data={leadRate} color="#a855f7" height={160}/>
          <div className="mt-3 flex gap-3 flex-wrap">
            <div className="flex-1 bg-gray-50 rounded-xl p-3 min-w-24">
              <p className="text-lg font-black text-gray-800">{inqThisMonth}</p>
              <p className="text-[10px] text-gray-500 font-semibold">This month</p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl p-3 min-w-24">
              <p className="text-lg font-black text-gray-800">{inqPrevMonth}</p>
              <p className="text-[10px] text-gray-500 font-semibold">Last month</p>
            </div>
            <div className="flex-1 bg-purple-50 rounded-xl p-3 min-w-24">
              <div className="flex items-center gap-1"><Trend pct={getPctChange(inqThisMonth, inqPrevMonth)}/></div>
              <p className="text-[10px] text-purple-500 font-semibold">MoM Change</p>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Top packages + Revenue by category ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Top Performing Packages" icon={FiPackage}>
          <div className="space-y-2">
            {topPkgs.map((p,i) => (
              <div key={p.label} className="flex items-center gap-2">
                <span className="text-[10px] font-black text-gray-300 w-4 shrink-0">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-gray-700 truncate">{p.label}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] text-gray-400">LKR {fmtK(p.rev)}</span>
                      <span className="text-[11px] font-black text-gray-800">{p.count}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-indigo-400" style={{width:`${(p.count/maxPkg)*100}%`}}/>
                  </div>
                </div>
              </div>
            ))}
            {topPkgs.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">No bookings in this period</p>}
          </div>
        </Section>

        <Section title="Revenue by Category" icon={FiBarChart2}>
          <FullBar data={catRev.map(r=>({label:r.label,value:r.value}))} color="#22c55e" height={160}/>
          <div className="mt-3 space-y-1.5">
            {catRev.map(r => (
              <div key={r.label} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-600">{r.label}</span>
                <span className="font-black text-gray-800">LKR {fmtK(r.value)}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Consultation & subscriber growth ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Section title="Consultation Channel Mix" icon={FiVideo}>
          <div className="space-y-2">
            {(() => {
              const methodMap: Record<string,number> = {}
              consultations.forEach(c => { methodMap[c.method]=(methodMap[c.method]??0)+1 })
              const total = consultations.length || 1
              const colors: Record<string,string> = { VIDEO:'#6366f1', PHONE:'#22c55e', IN_PERSON:'#f59e0b', CHAT:'#a855f7' }
              return Object.entries(methodMap).sort((a,b)=>b[1]-a[1]).map(([m,n]) => (
                <div key={m}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-600 capitalize">{m.replace(/_/g,' ').toLowerCase()}</span>
                    <span className="font-bold text-gray-800">{n} <span className="text-gray-400 font-normal">({Math.round((n/total)*100)}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{width:`${(n/total)*100}%`,background:colors[m]??'#6b7280'}}/>
                  </div>
                </div>
              ))
            })()}
            {consultations.length === 0 && <p className="text-xs text-gray-400 py-4 text-center">No consultations in this period</p>}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-500 font-semibold">Completion rate</span>
            <span className="text-sm font-black text-emerald-600">
              {consultations.length ? Math.round((consultations.filter(c=>c.status==='COMPLETED').length/consultations.length)*100) : 0}%
            </span>
          </div>
        </Section>

        <Section title="Subscriber Growth" icon={FiMail} className="lg:col-span-2">
          <FullBar data={monthlyData.map(m=>({label:m.label,value:m.subs}))} color="#ec4899" height={160}/>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="bg-pink-50 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-pink-700">{subscribers.length}</p>
              <p className="text-[10px] text-pink-500 font-semibold">New in period</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-emerald-700">{data.newsletter.filter(n=>n.isActive).length}</p>
              <p className="text-[10px] text-emerald-500 font-semibold">Total active</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-gray-700">
                {data.newsletter.length ? Math.round((data.newsletter.filter(n=>n.isActive).length/data.newsletter.length)*100) : 0}%
              </p>
              <p className="text-[10px] text-gray-500 font-semibold">Retention rate</p>
            </div>
          </div>
        </Section>
      </div>

      {/* ── Business health scorecard ── */}
      <Section title="Business Health Scorecard" icon={FiActivity}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Booking Health',
              score: Math.min(100, Math.round((bookings.length / Math.max(bookings.length + coldInq.length, 1)) * 100)),
              note: `${cancelRate}% cancel rate`,
              color: cancelRate < 10 ? '#22c55e' : cancelRate < 25 ? '#f59e0b' : '#ef4444',
            },
            {
              label: 'Lead Quality',
              score: Math.round(((hotInq.length + warmInq.length) / Math.max(inquiries.length, 1)) * 100),
              note: `${hotInq.length} hot · ${warmInq.length} warm`,
              color: hotInq.length > coldInq.length ? '#22c55e' : '#f59e0b',
            },
            {
              label: 'Conversion',
              score: conversionRate,
              note: `${convertedInq} of ${inquiries.length} leads`,
              color: conversionRate >= 20 ? '#22c55e' : conversionRate >= 10 ? '#f59e0b' : '#ef4444',
            },
            {
              label: 'Repeat Business',
              score: repeatRate,
              note: `${repeatCustomers} repeat customers`,
              color: repeatRate >= 20 ? '#22c55e' : repeatRate >= 10 ? '#f59e0b' : '#6366f1',
            },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={s.color} strokeWidth="3"
                  strokeDasharray={`${s.score} ${100 - s.score}`} strokeLinecap="round"
                  style={{transition:'stroke-dasharray 0.6s ease'}}/>
              </svg>
              <div className="text-center -mt-1">
                <p className="text-lg font-black text-gray-800 leading-none">{s.score}%</p>
                <p className="text-[11px] font-bold text-gray-600 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-gray-400">{s.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

    </div>
  )
}
