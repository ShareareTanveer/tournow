'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import { themeToCSS, parseTheme } from '@/lib/theme'
import { CurrencyProvider } from '@/lib/useCurrency'

function useTheme() {
  const loaded = useRef(false)
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    fetch('/api/settings')
      .then(r => r.json())
      .then((settings: Record<string, string>) => {
        const themeJson = settings.theme
        if (!themeJson) return
        const css = themeToCSS(parseTheme(themeJson))
        let el = document.getElementById('mv-theme') as HTMLStyleElement | null
        if (!el) {
          el = document.createElement('style')
          el.id = 'mv-theme'
          document.head.appendChild(el)
        }
        el.textContent = `:root { ${css} }`
      })
      .catch(() => {})
  }, [])
}

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  useTheme()

  const isAdmin = pathname.startsWith('/admin')
  const isCustomerDashboard = pathname.startsWith('/my')
  if (isAdmin || isCustomerDashboard) return <>{children}</>

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <Layout>{children}</Layout>
    </CurrencyProvider>
  )
}
