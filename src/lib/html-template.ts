export type HtmlTemplateField = {
  key: string
  label: string
  kind: 'text' | 'textarea' | 'image'
}

const PLACEHOLDER_REGEX = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g

function titleize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function detectFieldKind(key: string): HtmlTemplateField['kind'] {
  if (/(image|img|photo|logo|icon|banner|thumb|thumbnail|picture)$/i.test(key)) return 'image'
  if (/(body|text|description|subtitle|quote|answer|content|paragraph|details)$/i.test(key)) return 'textarea'
  return 'text'
}

export function extractHtmlTemplateFields(html: string): HtmlTemplateField[] {
  const seen = new Set<string>()
  const fields: HtmlTemplateField[] = []

  for (const match of html.matchAll(PLACEHOLDER_REGEX)) {
    const key = match[1]?.trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    fields.push({
      key,
      label: titleize(key),
      kind: detectFieldKind(key),
    })
  }

  return fields
}

export function applyHtmlTemplateBindings(
  html: string,
  bindings?: Record<string, unknown>
) {
  const values = bindings ?? {}
  return html.replace(PLACEHOLDER_REGEX, (_, rawKey: string) => {
    const key = rawKey.trim()
    const value = values[key]
    return value == null ? '' : String(value)
  })
}
