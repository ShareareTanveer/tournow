'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTabNotification } from '@/hooks/useTabNotification'
import {
  FiBell, FiX, FiCheck, FiPackage, FiInbox, FiVideo,
  FiStar, FiDollarSign, FiInfo, FiArrowRight,
} from 'react-icons/fi'

interface Notif {
  id: string
  type: string
  title: string
  body: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

interface Toast extends Notif {
  toastId: string
  exiting: boolean
}

const TYPE_ICON: Record<string, React.ElementType> = {
  NEW_BOOKING:      FiPackage,
  BOOKING_STATUS:   FiPackage,
  NEW_INQUIRY:      FiInbox,
  NEW_CONSULTATION: FiVideo,
  NEW_REVIEW:       FiStar,
  PAYMENT_RECEIVED: FiDollarSign,
  SYSTEM:           FiInfo,
}

const TYPE_COLOR: Record<string, string> = {
  NEW_BOOKING:      'bg-indigo-100 text-indigo-600',
  BOOKING_STATUS:   'bg-teal-100 text-teal-600',
  NEW_INQUIRY:      'bg-purple-100 text-purple-600',
  NEW_CONSULTATION: 'bg-sky-100 text-sky-600',
  NEW_REVIEW:       'bg-amber-100 text-amber-600',
  PAYMENT_RECEIVED: 'bg-emerald-100 text-emerald-600',
  SYSTEM:           'bg-gray-100 text-gray-600',
}

const TYPE_ACCENT: Record<string, string> = {
  NEW_BOOKING:      'border-l-indigo-500',
  BOOKING_STATUS:   'border-l-teal-500',
  NEW_INQUIRY:      'border-l-purple-500',
  NEW_CONSULTATION: 'border-l-sky-500',
  NEW_REVIEW:       'border-l-amber-500',
  PAYMENT_RECEIVED: 'border-l-emerald-500',
  SYSTEM:           'border-l-gray-400',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// Shared AudioContext — created once, unlocked on first user gesture
let _ac: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!_ac) _ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    return _ac
  } catch { return null }
}

// Unlock on any user interaction so chimes work without a gesture at notify time
if (typeof window !== 'undefined') {
  const unlock = () => { getAudioContext()?.resume(); }
  window.addEventListener('click',      unlock, { once: false, passive: true })
  window.addEventListener('keydown',    unlock, { once: false, passive: true })
  window.addEventListener('touchstart', unlock, { once: false, passive: true })
}

function playChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    ctx.resume().then(() => {
      const master = ctx.createGain()
      master.gain.setValueAtTime(0.18, ctx.currentTime)
      master.connect(ctx.destination)
      const notes = [880, 1108]
      notes.forEach((freq, i) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.01 + i * 0.12)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5 + i * 0.12)
        osc.connect(gain)
        gain.connect(master)
        osc.start(ctx.currentTime + i * 0.12)
        osc.stop(ctx.currentTime + 0.6 + i * 0.12)
      })
    })
  } catch {}
}

interface Props {
  apiBase:   string
  streamUrl: string
  dark?:     boolean
}

const PERM_KEY = 'notif_perm_asked'

/** Ask for browser Notification permission at most once per day */
function requestPermissionOncePerDay() {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') return
  if (Notification.permission === 'denied') return  // user hard-blocked — never ask again

  const last = localStorage.getItem(PERM_KEY)
  const now  = Date.now()
  if (last && now - Number(last) < 86_400_000) return  // asked within last 24h

  localStorage.setItem(PERM_KEY, String(now))
  Notification.requestPermission()
}

/** Fire a native browser notification (only when tab is hidden) */
function showNativeNotif(title: string, body: string, link?: string | null) {
  if (typeof window === 'undefined') return
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  if (document.visibilityState === 'visible') return  // tab is in focus — toast is enough

  const n = new Notification(title, {
    body,
    icon: '/favicon.ico',
    tag:  link ?? title,  // deduplicate same-link notifs
  })
  if (link) n.onclick = () => { window.focus(); window.location.href = link }
}

export default function NotificationBell({ apiBase, streamUrl, dark = false }: Props) {
  const router = useRouter()
  const [open,      setOpen]      = useState(false)
  const [notifs,    setNotifs]    = useState<Notif[]>([])
  const [unread,    setUnread]    = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [animating, setAnimating] = useState(false)
  const [toasts,    setToasts]    = useState<Toast[]>([])
  const panelRef  = useRef<HTMLDivElement>(null)
  const esRef     = useRef<EventSource | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  // Open BroadcastChannel once to relay notifications to other tabs
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    channelRef.current = new BroadcastChannel('halo_notifications')
    return () => channelRef.current?.close()
  }, [])

  // Tab title + favicon badge
  useTabNotification(unread)

  // Ask for permission once per day (after a short delay so it's not jarring on load)
  useEffect(() => {
    const t = setTimeout(requestPermissionOncePerDay, 3000)
    return () => clearTimeout(t)
  }, [])

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch(apiBase, { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setNotifs(data.notifications ?? [])
      setUnread(data.unreadCount ?? 0)
    } finally {
      setLoading(false)
    }
  }, [apiBase])

  // SSE connection
  useEffect(() => {
    fetchNotifs()

    const connect = () => {
      const es = new EventSource(streamUrl)
      esRef.current = es

      es.onmessage = (e) => {
        try {
          const notif: Notif = JSON.parse(e.data)

          // Update bell list
          setNotifs(prev => [notif, ...prev].slice(0, 50))
          setUnread(prev => prev + 1)

          // Animate bell
          setAnimating(true)
          setTimeout(() => setAnimating(false), 1000)

          // Play chime
          playChime()

          // Relay to all other open tabs (public site, other admin tabs, etc.)
          channelRef.current?.postMessage(notif)

          // Native browser notification (when tab is backgrounded)
          showNativeNotif(notif.title, notif.body, notif.link)

          // Show toast
          const toastId = `${notif.id}-${Date.now()}`
          setToasts(prev => [...prev, { ...notif, toastId, exiting: false }])

          // Start exit animation after 4.5s, remove at 5s
          setTimeout(() => {
            setToasts(prev => prev.map(t => t.toastId === toastId ? { ...t, exiting: true } : t))
          }, 4500)
          setTimeout(() => {
            setToasts(prev => prev.filter(t => t.toastId !== toastId))
          }, 5000)
        } catch {}
      }

      es.onerror = () => {
        es.close()
        setTimeout(connect, 5000)
      }
    }

    connect()
    return () => { esRef.current?.close() }
  }, [streamUrl, fetchNotifs])

  // Close panel on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  async function markRead(id: string) {
    await fetch(`${apiBase}/${id}`, { method: 'PATCH' })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  async function markAllRead() {
    await fetch(apiBase, { method: 'PATCH' })
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  function handleClick(notif: Notif) {
    if (!notif.isRead) markRead(notif.id)
    if (notif.link) {
      setOpen(false)
      router.push(notif.link)
    }
  }

  function dismissToast(toastId: string) {
    setToasts(prev => prev.map(t => t.toastId === toastId ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.toastId !== toastId)), 350)
  }

  function handleToastClick(toast: Toast) {
    dismissToast(toast.toastId)
    if (!toast.isRead) markRead(toast.id)
    if (toast.link) router.push(toast.link)
  }

  const btnBase = dark
    ? 'text-gray-400 hover:text-white hover:bg-white/10'
    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'

  return (
    <>
      {/* ── Bell + Dropdown ── */}
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen(v => !v)}
          className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${btnBase} ${open ? (dark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700') : ''}`}
          aria-label="Notifications"
        >
          <FiBell size={18} className={animating ? 'animate-bounce' : ''} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 leading-none shadow-sm">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </button>

        {open && (
          <div className={`absolute right-0 top-11 w-80 rounded-2xl shadow-xl border z-50 overflow-hidden ${dark ? 'bg-[#1e1b4b] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${dark ? 'border-white/10' : 'border-gray-100'}`}>
              <div className="flex items-center gap-2">
                <FiBell size={14} className={dark ? 'text-indigo-400' : 'text-indigo-500'} />
                <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Notifications</span>
                {unread > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unread}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${dark ? 'text-indigo-300 hover:bg-white/10' : 'text-indigo-600 hover:bg-indigo-50'}`}>
                    <FiCheck size={10} /> All read
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${dark ? 'text-gray-400 hover:bg-white/10' : 'text-gray-400 hover:bg-gray-100'}`}>
                  <FiX size={13} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="py-12 text-center">
                  <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${dark ? 'border-indigo-400' : 'border-indigo-500'}`} />
                </div>
              ) : notifs.length === 0 ? (
                <div className="py-12 text-center">
                  <FiBell size={28} className={`mx-auto mb-2 ${dark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-sm ${dark ? 'text-gray-500' : 'text-gray-400'}`}>No notifications yet</p>
                </div>
              ) : notifs.map(n => {
                const Icon = TYPE_ICON[n.type] ?? FiInfo
                const colorClass = TYPE_COLOR[n.type] ?? 'bg-gray-100 text-gray-600'
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex gap-3 px-4 py-3 border-b cursor-pointer transition-colors ${
                      dark
                        ? `border-white/5 ${n.isRead ? 'hover:bg-white/5' : 'bg-indigo-900/30 hover:bg-indigo-900/50'}`
                        : `border-gray-50 ${n.isRead ? 'hover:bg-gray-50/60' : 'bg-indigo-50/40 hover:bg-indigo-50/70'}`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className={`text-xs font-semibold leading-tight ${dark ? 'text-white' : 'text-gray-800'} ${!n.isRead ? 'font-bold' : ''}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                      </div>
                      <p className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{n.body}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-[10px] ${dark ? 'text-gray-600' : 'text-gray-400'}`}>{timeAgo(n.createdAt)}</span>
                        {n.link && <FiArrowRight size={10} className={dark ? 'text-gray-600' : 'text-gray-400'} />}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            {notifs.length > 0 && (
              <div className={`px-4 py-2.5 border-t ${dark ? 'border-white/10' : 'border-gray-100'}`}>
                <p className={`text-[10px] text-center ${dark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Showing latest {notifs.length} notifications · Real-time via SSE
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Toast stack — bottom-right, Slack-style ── */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map(toast => {
          const Icon        = TYPE_ICON[toast.type]  ?? FiInfo
          const colorClass  = TYPE_COLOR[toast.type]  ?? 'bg-gray-100 text-gray-600'
          const accentClass = TYPE_ACCENT[toast.type] ?? 'border-l-gray-400'
          return (
            <div
              key={toast.toastId}
              style={{
                transition: 'opacity 350ms ease, transform 350ms cubic-bezier(0.34,1.56,0.64,1)',
                opacity:    toast.exiting ? 0 : 1,
                transform:  toast.exiting ? 'translateX(110%)' : 'translateX(0)',
              }}
              className={`pointer-events-auto w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 border-l-4 ${accentClass} overflow-hidden`}
            >
              <div className="flex gap-3 px-4 py-3.5">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                  <Icon size={15} />
                </div>

                {/* Content */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleToastClick(toast)}
                >
                  <p className="text-sm font-bold text-gray-800 leading-tight">{toast.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{toast.body}</p>
                  {toast.link && (
                    <p className="text-[11px] text-indigo-500 font-semibold mt-1 flex items-center gap-1">
                      View details <FiArrowRight size={10} />
                    </p>
                  )}
                </div>

                {/* Dismiss */}
                <button
                  onClick={() => dismissToast(toast.toastId)}
                  className="p-1 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors shrink-0 self-start mt-0.5"
                >
                  <FiX size={13} />
                </button>
              </div>

              {/* Auto-dismiss progress bar */}
              <div className="h-0.5 bg-gray-100">
                <div
                  className="h-full bg-indigo-400 origin-left"
                  style={{
                    animation: toast.exiting ? 'none' : 'notif-shrink 4.5s linear forwards',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bar animation */}
      <style>{`
        @keyframes notif-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </>
  )
}
