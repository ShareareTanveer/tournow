export type ThemeConfig = {
  brand: string
  brandDark: string
  brandLight: string
  brandMuted: string
  teal: string
  tealDark: string
  dark: string
  darkMuted: string
  navy: string
  background: string
  foreground: string
  // Derived
  brandRgb?: string
  tealRgb?: string
}

export const DEFAULT_THEME: ThemeConfig = {
  brand:       '#0a83f5',
  brandDark:   '#d97706',
  brandLight:  '#fffbeb',
  brandMuted:  '#fef3c7',
  teal:        '#0d9488',
  tealDark:    '#0f766e',
  dark:        '#0f172a',
  darkMuted:   '#1e293b',
  navy:        '#1e3a5f',
  background:  '#ffffff',
  foreground:  '#1e293b',
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r} ${g} ${b}`
}

export function themeToCSS(theme: Partial<ThemeConfig>): string {
  const t = { ...DEFAULT_THEME, ...theme }
  return `
    --brand: ${t.brand};
    --brand-dark: ${t.brandDark};
    --brand-light: ${t.brandLight};
    --brand-muted: ${t.brandMuted};
    --teal: ${t.teal};
    --teal-dark: ${t.tealDark};
    --dark: ${t.dark};
    --dark-muted: ${t.darkMuted};
    --navy: ${t.navy};
    --background: ${t.background};
    --foreground: ${t.foreground};
    --brand-rgb: ${hexToRgb(t.brand)};
    --teal-rgb: ${hexToRgb(t.teal)};
  `.trim()
}

export function parseTheme(json: string | null | undefined): Partial<ThemeConfig> {
  if (!json) return {}
  try { return JSON.parse(json) }
  catch { return {} }
}
