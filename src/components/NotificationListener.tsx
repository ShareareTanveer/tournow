'use client'

/**
 * Mounted in the root layout — present on every page including the public site.
 * Listens on BroadcastChannel('halo_notifications') and plays the chime
 * + shows a toast whenever another tab (admin panel) fires a notification.
 * Does nothing if BroadcastChannel is unsupported.
 */

import { useEffect, useRef, useState } from 'react'
import { FiBell, FiX, FiArrowRight, FiPackage, FiInbox, FiVideo, FiStar, FiDollarSign, FiInfo } from 'react-icons/fi'

const CHANNEL = 'halo_notifications'

interface Notif {
  id: string
  type: string
  title: string
  body: string
  link?: string | null
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
  SYSTEM:           FiBell,
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

let _ac: AudioContext | null = null
function getAudioContext(): AudioContext | null {
  try {
    if (!_ac) _ac = new (window.AudioContext || (window as any).webkitAudioContext)()
    return _ac
  } catch { return null }
}
if (typeof window !== 'undefined') {
  const unlock = () => { getAudioContext()?.resume() }
  window.addEventListener('click',      unlock, { passive: true })
  window.addEventListener('keydown',    unlock, { passive: true })
  window.addEventListener('touchstart', unlock, { passive: true })
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

export default function NotificationListener() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const channelRef = useRef<BroadcastChannel | null>(null)

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return

    const ch = new BroadcastChannel(CHANNEL)
    channelRef.current = ch

    ch.onmessage = (e: MessageEvent<Notif>) => {
      const notif = e.data
      if (!notif?.id) return

      playChime()

      const toastId = `${notif.id}-${Date.now()}`
      setToasts(prev => [...prev, { ...notif, toastId, exiting: false }])

      setTimeout(() => {
        setToasts(prev => prev.map(t => t.toastId === toastId ? { ...t, exiting: true } : t))
      }, 4500)
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.toastId !== toastId))
      }, 5000)
    }

    return () => ch.close()
  }, [])

  function dismiss(toastId: string) {
    setToasts(prev => prev.map(t => t.toastId === toastId ? { ...t, exiting: true } : t))
    setTimeout(() => setToasts(prev => prev.filter(t => t.toastId !== toastId)), 350)
  }

  if (toasts.length === 0) return null

  return (
    <>
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
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                  <Icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 leading-tight">{toast.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{toast.body}</p>
                  {toast.link && (
                    <p className="text-[11px] text-indigo-500 font-semibold mt-1 flex items-center gap-1">
                      View details <FiArrowRight size={10} />
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(toast.toastId)}
                  className="p-1 text-gray-300 hover:text-gray-500 rounded-lg hover:bg-gray-100 transition-colors shrink-0 self-start mt-0.5"
                >
                  <FiX size={13} />
                </button>
              </div>
              <div className="h-0.5 bg-gray-100">
                <div
                  className="h-full bg-indigo-400 origin-left"
                  style={{ animation: toast.exiting ? 'none' : 'notif-shrink 4.5s linear forwards' }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <style>{`
        @keyframes notif-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </>
  )
}
