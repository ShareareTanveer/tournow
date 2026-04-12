'use client'

/**
 * JsonEditorPanel — floating { } button + 3-tab side panel.
 *
 * Tabs:
 *   1. Edit JSON  — paste/edit JSON, validate, apply to form
 *   2. View Fields — read-only table of all current form values
 *   3. SEO Prompt  — copy-ready AI prompt built from form context
 *
 * Usage:
 *   <JsonEditorPanel
 *     formData={form}
 *     onApply={(patch) => setForm(f => ({ ...f, ...patch }))}
 *     entityLabel="Package"
 *   />
 */

import { useState, useMemo } from 'react'
import { FiCode, FiX, FiCopy, FiCheck, FiAlertCircle, FiCheckCircle, FiList, FiFileText } from 'react-icons/fi'

interface Props {
  formData:    Record<string, unknown>
  onApply:     (patch: Record<string, unknown>) => void
  entityLabel: string
}

type Tab = 'edit' | 'fields' | 'prompt'

export default function JsonEditorPanel({ formData, onApply, entityLabel }: Props) {
  const [open, setOpen]   = useState(false)
  const [tab, setTab]     = useState<Tab>('edit')
  const [jsonText, setJsonText] = useState('')
  const [applyStatus, setApplyStatus] = useState('')
  const [copied, setCopied] = useState(false)

  // Validate JSON
  const jsonStatus = useMemo(() => {
    if (!jsonText.trim()) return null
    try {
      const parsed = JSON.parse(jsonText)
      const count = Object.keys(parsed).length
      return { valid: true, message: `✓ Valid JSON — ${count} field${count !== 1 ? 's' : ''}`, count }
    } catch (e: unknown) {
      return { valid: false, message: `✗ Invalid JSON: ${e instanceof SyntaxError ? e.message : String(e)}` }
    }
  }, [jsonText])

  // Build SEO prompt from form data
  const seoPrompt = useMemo(() => {
    const d = formData as Record<string, string>
    return `You are an expert travel SEO specialist for Halo Holidays.
Generate complete SEO metadata for this ${entityLabel}.

CURRENT VALUES (for reference):
title: ${d.title || ''}
category: ${d.category || ''}
summary: ${d.summary || ''}
description: ${(d.description || '').replace(/<[^>]+>/g, ' ').slice(0, 300)}
focus_keyword: ${d.focusKeyword || ''}

Return a JSON object with these EXACT keys:
{
  "metaTitle": "50-65 chars, keyword-rich",
  "metaDescription": "150-160 chars, includes keyword + CTA",
  "focusKeyword": "single primary keyword phrase",
  "secondaryKeywords": "comma-separated 4-6 keywords",
  "ogTitle": "social share title, max 70 chars",
  "ogDescription": "social share description, max 200 chars",
  "twitterTitle": "twitter card title",
  "twitterDescription": "twitter card description",
  "schemaMarkup": "valid JSON-LD TouristTrip schema as a string"
}

Rules:
- Return ONLY the JSON object, no explanation, no markdown
- All values must be plain strings
- schemaMarkup must itself be valid JSON`
  }, [formData, entityLabel])

  function handleOpen() {
    setOpen(true)
    // Pre-fill with current form JSON
    const clean = Object.fromEntries(
      Object.entries(formData).filter(([, v]) =>
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
      )
    )
    setJsonText(JSON.stringify(clean, null, 2))
    setApplyStatus('')
    setTab('edit')
  }

  function handleApply() {
    if (!jsonStatus?.valid) return
    try {
      const parsed = JSON.parse(jsonText) as Record<string, unknown>
      onApply(parsed)
      setApplyStatus(`✓ Applied ${jsonStatus.count} fields`)
      setTimeout(() => setApplyStatus(''), 3000)
    } catch {
      setApplyStatus('✗ Failed to apply')
    }
  }

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(seoPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleRefreshJson() {
    const clean = Object.fromEntries(
      Object.entries(formData).filter(([, v]) =>
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
      )
    )
    setJsonText(JSON.stringify(clean, null, 2))
    setApplyStatus('')
  }

  const flatFields = Object.entries(formData).filter(([, v]) =>
    typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
  )

  return (
    <>
      {/* Floating { } button */}
      <button
        type="button"
        onClick={handleOpen}
        title="JSON Editor"
        className="fixed bottom-18 right-6 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold text-base shadow-xl transition-colors"
      >
        <FiCode size={18} />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative z-10 w-full max-w-xl max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-black text-gray-900 text-base flex items-center gap-2">
                <FiCode size={16} className="text-emerald-600" /> JSON Editor
              </h2>
              <button type="button" onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                <FiX size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 shrink-0">
              {([
                { id: 'edit',   label: 'Edit JSON',    Icon: FiCode },
                { id: 'fields', label: 'View Fields',  Icon: FiList },
                { id: 'prompt', label: 'SEO Prompt',   Icon: FiFileText },
              ] as const).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold transition-colors border-b-2 ${
                    tab === t.id
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <t.Icon size={13} /> {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Edit JSON */}
            {tab === 'edit' && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 p-4 overflow-hidden flex flex-col gap-3">
                  <textarea
                    value={jsonText}
                    onChange={e => setJsonText(e.target.value)}
                    className="flex-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono focus:outline-none focus:border-emerald-400 resize-none min-h-70"
                    spellCheck={false}
                    placeholder='{ "metaTitle": "...", "description": "..." }'
                  />
                  {/* Validation status */}
                  {jsonStatus && (
                    <div className={`flex items-center gap-2 text-xs font-medium ${jsonStatus.valid ? 'text-emerald-600' : 'text-red-500'}`}>
                      {jsonStatus.valid
                        ? <FiCheckCircle size={13} />
                        : <FiAlertCircle size={13} />
                      }
                      {jsonStatus.message}
                    </div>
                  )}
                  {applyStatus && (
                    <div className="text-xs font-bold text-emerald-700">{applyStatus}</div>
                  )}
                </div>
                <div className="px-4 pb-4 flex gap-2 shrink-0">
                  <button type="button" onClick={handleApply}
                    disabled={!jsonStatus?.valid}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold transition-colors">
                    <FiCheck size={13} /> Apply to Form
                  </button>
                  <button type="button" onClick={handleRefreshJson}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm transition-colors">
                    Refresh from Form
                  </button>
                </div>
              </div>
            )}

            {/* Tab: View Fields */}
            {tab === 'fields' && (
              <div className="flex-1 overflow-y-auto p-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left font-bold text-gray-500 py-2 pr-4 w-1/3">Field</th>
                      <th className="text-left font-bold text-gray-500 py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flatFields.map(([k, v]) => (
                      <tr key={k} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 pr-4 font-mono text-gray-400 align-top">{k}</td>
                        <td className="py-2 text-gray-700 break-all">
                          {String(v).slice(0, 120)}{String(v).length > 120 ? '…' : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: SEO Prompt */}
            {tab === 'prompt' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 gap-3">
                <p className="text-xs text-gray-500 shrink-0">
                  Copy this prompt into any external AI (ChatGPT, Claude, etc.) to generate SEO fields, then paste the JSON back into the Edit tab and apply.
                </p>
                <textarea
                  readOnly
                  value={seoPrompt}
                  className="flex-1 w-full border border-gray-200 rounded-xl px-4 py-3 text-xs font-mono bg-gray-50 focus:outline-none resize-none min-h-60"
                />
                <button type="button" onClick={handleCopyPrompt}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold transition-colors w-fit">
                  {copied ? <><FiCheck size={13} /> Copied!</> : <><FiCopy size={13} /> Copy Prompt</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
