'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiCheck, FiChevronDown, FiPlus, FiSearch, FiX } from 'react-icons/fi'

type Accent = 'indigo' | 'sky'

interface Props {
  label: string
  value: string[]
  options: string[]
  onChange: (value: string[]) => void
  hint?: string
  placeholder?: string
  searchPlaceholder?: string
  allowCustom?: boolean
  multiple?: boolean
  accent?: Accent
}

const accentClasses: Record<Accent, { chip: string; active: string; ring: string }> = {
  indigo: {
    chip: 'bg-indigo-50 text-indigo-700',
    active: 'bg-indigo-50 text-indigo-700',
    ring: 'focus-within:border-indigo-400',
  },
  sky: {
    chip: 'bg-sky-50 text-sky-700',
    active: 'bg-sky-50 text-sky-700',
    ring: 'focus-within:border-sky-400',
  },
}

function unique(items: string[]) {
  return Array.from(new Set(items.map(item => item.trim()).filter(Boolean)))
}

interface DropdownPosition {
  left: number
  top: number
  width: number
  maxHeight: number
}

export default function SearchableCreatableSelect({
  label,
  value,
  options,
  onChange,
  hint,
  placeholder = 'Select options',
  searchPlaceholder = 'Search or add custom...',
  allowCustom = true,
  multiple = true,
  accent = 'indigo',
}: Props) {
  const selectId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null)
  const selected = unique(value)
  const styles = accentClasses[accent]
  const mergedOptions = useMemo(() => unique([...selected, ...options]), [options, selected])
  const filtered = useMemo(() => {
    const lower = query.trim().toLowerCase()
    if (!lower) return mergedOptions.slice(0, 80)
    return mergedOptions.filter(option => option.toLowerCase().includes(lower)).slice(0, 80)
  }, [mergedOptions, query])

  const exactMatch = mergedOptions.some(option => option.toLowerCase() === query.trim().toLowerCase())

  const updateDropdownPosition = () => {
    const root = rootRef.current
    if (!root) return

    const rect = root.getBoundingClientRect()
    const viewportPadding = 12
    const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
    const spaceAbove = rect.top - viewportPadding
    const preferredHeight = 320
    const openUpward = spaceBelow < 260 && spaceAbove > spaceBelow
    const maxHeight = Math.max(180, Math.min(preferredHeight, openUpward ? spaceAbove : spaceBelow))
    const left = Math.min(
      Math.max(viewportPadding, rect.left),
      Math.max(viewportPadding, window.innerWidth - rect.width - viewportPadding)
    )

    setDropdownPosition({
      left,
      top: openUpward ? Math.max(viewportPadding, rect.top - maxHeight - 8) : rect.bottom + 8,
      width: rect.width,
      maxHeight,
    })
  }

  useEffect(() => {
    if (!open) return

    updateDropdownPosition()
    window.dispatchEvent(new CustomEvent('admin-creatable-select-open', { detail: selectId }))

    const closeIfAnotherOpened = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (detail !== selectId) setOpen(false)
    }
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || dropdownRef.current?.contains(target)) return
      setOpen(false)
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('resize', updateDropdownPosition)
    window.addEventListener('scroll', updateDropdownPosition, true)
    window.addEventListener('admin-creatable-select-open', closeIfAnotherOpened)
    document.addEventListener('pointerdown', closeOnOutsidePointer)
    document.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition, true)
      window.removeEventListener('admin-creatable-select-open', closeIfAnotherOpened)
      document.removeEventListener('pointerdown', closeOnOutsidePointer)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, selectId])

  const commit = (item: string) => {
    const nextItem = item.trim()
    if (!nextItem) return

    if (multiple) {
      onChange(selected.includes(nextItem)
        ? selected.filter(existing => existing !== nextItem)
        : [...selected, nextItem])
    } else {
      onChange([nextItem])
      setOpen(false)
    }
    setQuery('')
  }

  const remove = (item: string) => {
    onChange(selected.filter(existing => existing !== item))
  }

  const dropdown = open && dropdownPosition ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[9999] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl shadow-slate-900/12"
      style={{
        left: dropdownPosition.left,
        top: dropdownPosition.top,
        width: dropdownPosition.width,
      }}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
        <FiSearch size={14} className="text-gray-400" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault()
              if (allowCustom && query.trim()) commit(query)
              else if (filtered[0]) commit(filtered[0])
            }
            if (event.key === 'Escape') setOpen(false)
          }}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent py-1.5 text-sm outline-none placeholder:text-gray-300"
          autoFocus
        />
      </div>

      <div className="overflow-y-auto p-1" style={{ maxHeight: dropdownPosition.maxHeight - 48 }}>
        {allowCustom && query.trim() && !exactMatch && (
          <button
            type="button"
            onClick={() => commit(query)}
            className="mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            <FiPlus size={14} /> Add &quot;{query.trim()}&quot;
          </button>
        )}

        {filtered.length > 0 ? filtered.map(option => {
          const isSelected = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => commit(option)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                isSelected ? styles.active : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="grid h-4 w-4 place-items-center rounded border border-gray-200 bg-white">
                {isSelected && <FiCheck size={11} className="text-indigo-600" />}
              </span>
              <span className="min-w-0 flex-1 truncate">{option}</span>
            </button>
          )
        }) : (
          <p className="px-3 py-6 text-center text-xs text-gray-400">No matching options.</p>
        )}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div ref={rootRef} className="admin-creatable-select relative" data-open={open ? 'true' : 'false'}>
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">{label}</label>
      {hint && <p className="mb-1 text-xs text-gray-400">{hint}</p>}
      <div className={`rounded-xl border border-gray-200 bg-white p-2 transition-colors ${styles.ring}`}>
        <button
          type="button"
          onClick={() => setOpen(current => !current)}
          className="flex min-h-9 w-full items-center justify-between gap-2 rounded-lg px-2 text-left text-sm text-gray-600 hover:bg-gray-50"
        >
          <span className="line-clamp-1">
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </span>
          <FiChevronDown size={15} className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {selected.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selected.map(item => (
              <span key={item} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles.chip}`}>
                {item}
                <button type="button" onClick={() => remove(item)} className="rounded-full hover:text-red-500">
                  <FiX size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {dropdown}
    </div>
  )
}
