'use client'

import { useEffect, useRef } from 'react'

/**
 * Updates the browser tab title and favicon badge when unread > 0.
 * - Title:   "(3) Metro Voyage – Admin" style prefix
 * - Favicon: red dot drawn over the original favicon via Canvas
 */
export function useTabNotification(unread: number) {
  const originalTitle   = useRef<string | null>(null)
  const originalFavicon = useRef<string | null>(null)
  const badgedFavicons  = useRef<Map<number, string>>(new Map())

  // ── Title ──────────────────────────────────────────────────────────────
  useEffect(() => {
    // Store original title once
    if (originalTitle.current === null) {
      originalTitle.current = document.title
    }

    if (unread > 0) {
      // Strip any existing count prefix before adding new one
      const base = (originalTitle.current ?? document.title).replace(/^\(\d+\)\s*/, '')
      document.title = `(${unread > 99 ? '99+' : unread}) ${base}`
    } else {
      document.title = originalTitle.current ?? document.title
    }
  }, [unread])

  // ── Favicon ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    function getOrCreateLink(): HTMLLinkElement {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      return link
    }

    function drawBadgedFavicon(src: string, count: number): Promise<string> {
      return new Promise(resolve => {
        const img    = new Image()
        img.crossOrigin = 'anonymous'
        img.onload  = () => {
          const size   = 32
          const canvas = document.createElement('canvas')
          canvas.width  = size
          canvas.height = size
          const ctx = canvas.getContext('2d')!

          // Draw original favicon (slightly dimmed when badged)
          ctx.globalAlpha = 0.85
          ctx.drawImage(img, 0, 0, size, size)
          ctx.globalAlpha = 1

          if (count > 0) {
            // Red badge circle — bottom-right quadrant
            const bx = size - 8
            const by = size - 8
            const r  = 7.5

            // White outline ring
            ctx.beginPath()
            ctx.arc(bx, by, r + 1.5, 0, Math.PI * 2)
            ctx.fillStyle = '#ffffff'
            ctx.fill()

            // Red fill
            ctx.beginPath()
            ctx.arc(bx, by, r, 0, Math.PI * 2)
            ctx.fillStyle = '#ef4444'
            ctx.fill()

            // Count text
            const label = count > 9 ? '9+' : String(count)
            ctx.fillStyle = '#ffffff'
            ctx.font      = `bold ${label.length > 1 ? 8 : 10}px -apple-system, sans-serif`
            ctx.textAlign    = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(label, bx, by + 0.5)
          }

          resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = () => resolve(src) // fallback — use original on error
        img.src = src
      })
    }

    async function apply() {
      const link = getOrCreateLink()

      // Store original href once
      if (originalFavicon.current === null) {
        originalFavicon.current = link.href || '/favicon.ico'
      }

      if (unread === 0) {
        link.href = originalFavicon.current
        return
      }

      // Cache badged favicons so we don't redraw every render
      const cacheKey = Math.min(unread, 10) // 1–9 individual, 10 = "9+"
      if (badgedFavicons.current.has(cacheKey)) {
        link.href = badgedFavicons.current.get(cacheKey)!
        return
      }

      const badged = await drawBadgedFavicon(originalFavicon.current, unread)
      badgedFavicons.current.set(cacheKey, badged)
      link.href = badged
    }

    apply()
  }, [unread])

  // Restore originals on unmount
  useEffect(() => {
    return () => {
      if (originalTitle.current)   document.title = originalTitle.current
      const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
      if (link && originalFavicon.current) link.href = originalFavicon.current
    }
  }, [])
}
