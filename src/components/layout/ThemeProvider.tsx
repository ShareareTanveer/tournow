'use client'

import { useEffect } from 'react'
import { themeToCSS, parseTheme, DEFAULT_THEME, type ThemeConfig } from '@/lib/theme'

interface Props {
  themeJson?: string | null
}

export default function ThemeProvider({ themeJson }: Props) {
  useEffect(() => {
    const theme = parseTheme(themeJson)
    const css = themeToCSS(theme)
    // Inject into :root
    let styleEl = document.getElementById('mv-theme') as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'mv-theme'
      document.head.appendChild(styleEl)
    }
    styleEl.textContent = `:root { ${css} }`
  }, [themeJson])

  return null
}

// Server-side: renders inline <style> for SSR (no flash)
export function ThemeStyle({ themeJson }: Props) {
  const theme = parseTheme(themeJson)
  const css = themeToCSS(theme)
  return (
    <style id="mv-theme" dangerouslySetInnerHTML={{ __html: `:root { ${css} }` }} />
  )
}
