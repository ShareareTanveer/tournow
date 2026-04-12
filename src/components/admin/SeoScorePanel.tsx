'use client'

/**
 * SeoScorePanel — floating score badge + full modal.
 *
 * Usage:
 *   <SeoScorePanel input={seoInput} onAutoFixH1={fn} />
 *
 * The score is computed client-side on every render (debounced by the parent).
 * No API call is needed.
 */

import { useMemo, useState } from 'react'
import { computeSeoScore, SeoInput, SeoScoreResult, SeoGroup } from '@/lib/seo-score'
import {
  FiX, FiCheckCircle, FiAlertCircle, FiZap, FiChevronDown, FiChevronUp,
} from 'react-icons/fi'

interface Props {
  input: SeoInput
  /** Called when user clicks "Auto Fix" for the H1-in-content check */
  onAutoFixH1?: () => void
}

// ─── Circular gauge ────────────────────────────────────────────────────────────

function CircleGauge({ score, color }: { score: number; color: string }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  const strokeColor =
    score >= 90 ? '#10b981' :
    score >= 75 ? '#22c55e' :
    score >= 55 ? '#facc15' :
    score >= 35 ? '#f97316' :
    '#ef4444'

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={strokeColor} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-gray-900">{score}</span>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">/100</span>
      </div>
    </div>
  )
}

// ─── Group pills ───────────────────────────────────────────────────────────────

function GroupPill({ name, earned, max }: { name: string; earned: number; max: number }) {
  const pct = max > 0 ? Math.round((earned / max) * 100) : 0
  const cls =
    pct >= 90 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
    pct >= 75 ? 'bg-green-100 text-green-700 border-green-200' :
    pct >= 55 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
    pct >= 35 ? 'bg-orange-100 text-orange-700 border-orange-200' :
    'bg-red-100 text-red-700 border-red-200'
  return (
    <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${cls}`}>
      {name} <span className="opacity-70">{earned}/{max}</span>
    </div>
  )
}

// ─── Check row ─────────────────────────────────────────────────────────────────

function CheckRow({
  check,
  onAutoFixH1,
}: {
  check: SeoScoreResult['checks'][0]
  onAutoFixH1?: () => void
}) {
  return (
    <div className={`flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0 ${check.passed ? 'opacity-70' : ''}`}>
      <div className={`shrink-0 mt-0.5 ${check.passed ? 'text-emerald-500' : 'text-red-400'}`}>
        {check.passed ? <FiCheckCircle size={15} /> : <FiAlertCircle size={15} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{check.label}</p>
          <span className={`text-[11px] font-bold shrink-0 ${check.passed ? 'text-emerald-600' : 'text-gray-400'}`}>
            {check.points}/{check.maxPoints} pts
          </span>
        </div>
        {check.detail && (
          <p className="text-[11px] text-gray-400 mt-0.5">{check.detail}</p>
        )}
        {!check.passed && (
          <p className="text-xs text-orange-600 mt-1 leading-snug">{check.fix}</p>
        )}
        {!check.passed && check.key === 'no_h1' && onAutoFixH1 && (
          <button
            type="button"
            onClick={onAutoFixH1}
            className="mt-1.5 flex items-center gap-1 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-2.5 py-1 rounded-lg transition-colors"
          >
            <FiZap size={11} /> Auto Fix — remove H1 tags
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Group section (collapsible) ──────────────────────────────────────────────

function GroupSection({
  name,
  result,
  onAutoFixH1,
}: {
  name: SeoGroup
  result: SeoScoreResult
  onAutoFixH1?: () => void
}) {
  const [open, setOpen] = useState(true)
  const groupChecks = result.checks.filter(c => c.group === name)
  const g = result.groups[name]

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">{name}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${g.color} text-white`}>
            {g.percent}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{g.earned}/{g.max} pts</span>
          {open ? <FiChevronUp size={14} className="text-gray-400" /> : <FiChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 py-1">
          {groupChecks.map(c => (
            <CheckRow key={c.key} check={c} onAutoFixH1={c.key === 'no_h1' ? onAutoFixH1 : undefined} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function SeoScorePanel({ input, onAutoFixH1 }: Props) {
  const [open, setOpen] = useState(false)

  const result = useMemo(() => computeSeoScore(input), [input])

  const badgeBg =
    result.total >= 90 ? 'bg-emerald-500 hover:bg-emerald-600' :
    result.total >= 75 ? 'bg-green-500 hover:bg-green-600' :
    result.total >= 55 ? 'bg-yellow-400 hover:bg-yellow-500' :
    result.total >= 35 ? 'bg-orange-400 hover:bg-orange-500' :
    'bg-red-500 hover:bg-red-600'

  return (
    <>
      {/* ── Floating badge ── */}
      <button
  type="button"
  onClick={() => setOpen(true)}
  className={`fixed bottom-3 right-6 z-40 flex items-center justify-center w-11 h-11 rounded-full text-white font-bold text-sm shadow-xl transition-colors ${badgeBg}`}
  title="View SEO Score"
>
  <span className="text-lg font-black">{result.total}</span>
</button>

      {/* ── Modal ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-black text-gray-900 text-lg">SEO Score</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Summary row */}
              <div className="flex items-center gap-6 bg-gray-50 rounded-2xl p-5">
                <CircleGauge score={result.total} color={badgeBg} />
                <div className="flex-1">
                  <p className="text-2xl font-black text-gray-900">{result.label}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{result.earned} of {result.possible} points earned</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {result.groupOrder.map(g => (
                      <GroupPill
                        key={g}
                        name={g}
                        earned={result.groups[g].earned}
                        max={result.groups[g].max}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Failed checks first */}
              {result.checks.some(c => !c.passed) && (
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">
                    Needs attention ({result.checks.filter(c => !c.passed).length} issues)
                  </p>
                  <div className="border border-red-100 rounded-xl overflow-hidden">
                    <div className="px-4 py-1">
                      {result.checks
                        .filter(c => !c.passed)
                        .sort((a, b) => b.maxPoints - a.maxPoints)
                        .map(c => (
                          <CheckRow key={c.key} check={c} onAutoFixH1={c.key === 'no_h1' ? onAutoFixH1 : undefined} />
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* All groups */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">All checks by group</p>
                <div className="space-y-2">
                  {result.groupOrder.map(g => (
                    <GroupSection key={g} name={g} result={result} onAutoFixH1={onAutoFixH1} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
