'use client'

/**
 * AdminTable — reusable client-side data table with:
 *   • Global search (searches all string/number cell values)
 *   • Column sort (click header to toggle asc/desc)
 *   • Status/tab filter
 *   • Pagination (configurable page size)
 *
 * Usage:
 *   <AdminTable
 *     data={rows}
 *     columns={[
 *       { key: 'name', label: 'Name', sortable: true },
 *       { key: 'status', label: 'Status', render: (row) => <Badge>{row.status}</Badge> },
 *     ]}
 *     filterKey="status"            // which field the tab filters apply to
 *     filterOptions={['ALL','NEW']} // tab labels (first = "show all")
 *     searchKeys={['name','email']} // which fields to search
 *     defaultSort={{ key: 'createdAt', dir: 'desc' }}
 *   />
 */

import { useState, useMemo, ReactNode } from 'react'
import {
  FiSearch, FiChevronUp, FiChevronDown, FiChevronsLeft, FiChevronsRight,
  FiChevronLeft, FiChevronRight, FiSliders,
} from 'react-icons/fi'

export interface Column<T = any> {
  key:        string
  label:      string
  sortable?:  boolean
  align?:     'left' | 'right' | 'center'
  render?:    (row: T) => ReactNode
  /** width hint class e.g. "w-40" */
  width?:     string
}

interface Props<T = any> {
  data:            T[]
  columns:         Column<T>[]
  /** key in row object used for tab filtering */
  filterKey?:      string
  /** first entry = "show all", rest = exact match values */
  filterOptions?:  string[]
  /** optional label overrides for filter tabs, keyed by value */
  filterLabels?:   Record<string, string>
  /** keys to include in global search */
  searchKeys?:     string[]
  defaultSort?:    { key: string; dir: 'asc' | 'desc' }
  pageSize?:       number
  /** row ID field for key= */
  rowKey?:         string
  emptyMessage?:   string
  /** extra content to show in toolbar (right side) */
  toolbarRight?:   ReactNode
}

const PAGE_SIZES = [10, 25, 50, 100]

function getValue(row: any, key: string): any {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

function searchRow(row: any, keys: string[], q: string): boolean {
  const lower = q.toLowerCase()
  return keys.some(k => {
    const v = getValue(row, k)
    if (v == null) return false
    return String(v).toLowerCase().includes(lower)
  })
}

function sortRows<T>(rows: T[], key: string, dir: 'asc' | 'desc'): T[] {
  return [...rows].sort((a, b) => {
    const av = getValue(a, key)
    const bv = getValue(b, key)
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = typeof av === 'number' && typeof bv === 'number'
      ? av - bv
      : String(av).localeCompare(String(bv))
    return dir === 'asc' ? cmp : -cmp
  })
}

export default function AdminTable<T = any>({
  data,
  columns,
  filterKey,
  filterOptions,
  filterLabels,
  searchKeys = [],
  defaultSort,
  pageSize: defaultPageSize = 25,
  rowKey = 'id',
  emptyMessage = 'No records found',
  toolbarRight,
}: Props<T>) {
  const [search,    setSearch]    = useState('')
  const [activeTab, setActiveTab] = useState(filterOptions?.[0] ?? 'ALL')
  const [sortKey,   setSortKey]   = useState(defaultSort?.key ?? '')
  const [sortDir,   setSortDir]   = useState<'asc'|'desc'>(defaultSort?.dir ?? 'asc')
  const [page,      setPage]      = useState(1)
  const [pageSize,  setPageSize]  = useState(defaultPageSize)

  // 1. Tab filter — coerce booleans to string for comparison
  const tabFiltered = useMemo(() => {
    if (!filterKey || !filterOptions || activeTab === filterOptions[0]) return data
    return data.filter(row => String(getValue(row, filterKey)) === activeTab)
  }, [data, filterKey, filterOptions, activeTab])

  // 2. Search
  const searched = useMemo(() => {
    if (!search.trim() || searchKeys.length === 0) return tabFiltered
    return tabFiltered.filter(row => searchRow(row, searchKeys, search))
  }, [tabFiltered, search, searchKeys])

  // 3. Sort
  const sorted = useMemo(() => {
    if (!sortKey) return searched
    return sortRows(searched, sortKey, sortDir)
  }, [searched, sortKey, sortDir])

  // 4. Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage   = Math.min(page, totalPages)
  const pageRows   = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  // Helpers
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  const handleSearch = (v: string) => { setSearch(v); setPage(1) }
  const handleTab    = (v: string) => { setActiveTab(v); setPage(1) }

  const tabCount = (v: string) => {
    if (!filterKey || v === filterOptions?.[0]) return data.length
    return data.filter(r => String(getValue(r, filterKey)) === v).length
  }

  const useSelectFilter = Boolean(filterOptions && filterOptions.length > 10)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

      {/* ── Toolbar ── */}
      <div className="px-5 py-3.5 border-b border-gray-100 space-y-3">

        {/* Search + right slot */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-gray-50 placeholder-gray-400"
            />
            {search && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ×
              </button>
            )}
          </div>

          {/* Page size */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <FiSliders size={12} className="text-gray-400" />
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-indigo-300 cursor-pointer"
            >
              {PAGE_SIZES.map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>

          {toolbarRight && <div className="flex items-center gap-2">{toolbarRight}</div>}
        </div>

        {/* Tab filters */}
        {filterOptions && filterOptions.length > 1 && (
          useSelectFilter ? (
            <div className="flex items-center gap-2">
              <label htmlFor="admin-table-filter" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Filter
              </label>
              <select
                id="admin-table-filter"
                value={activeTab}
                onChange={e => handleTab(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              >
                {filterOptions.map(opt => {
                  const count = tabCount(opt)
                  const label = filterLabels?.[opt] ?? opt
                  return (
                    <option key={opt} value={opt}>
                      {label} {opt !== filterOptions[0] ? `(${count})` : `(${count})`}
                    </option>
                  )
                })}
              </select>
            </div>
          ) : (
            <div className="flex gap-1 overflow-x-auto pb-0.5">
              {filterOptions.map(opt => {
                const count = tabCount(opt)
                const label = filterLabels?.[opt] ?? opt
                return (
                  <button
                    key={opt}
                    onClick={() => handleTab(opt)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                      activeTab === opt
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    {label}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none ${
                      activeTab === opt ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider select-none ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.sortable ? 'cursor-pointer hover:text-gray-600' : ''} ${col.width ?? ''}`}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="flex flex-col gap-0 opacity-40">
                        <FiChevronUp   size={9} className={sortKey === col.key && sortDir === 'asc'  ? 'opacity-100 text-indigo-500' : ''} />
                        <FiChevronDown size={9} className={sortKey === col.key && sortDir === 'desc' ? 'opacity-100 text-indigo-500' : ''} style={{ marginTop: '-3px' }} />
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <p className="text-gray-400 text-sm">{search ? `No results for "${search}"` : emptyMessage}</p>
                </td>
              </tr>
            ) : pageRows.map((row: any) => (
              <tr key={row[rowKey] ?? Math.random()} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={`px-5 py-3.5 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
                  >
                    {col.render ? col.render(row) : (
                      <span className="text-sm text-gray-700">{getValue(row, col.key) ?? '—'}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 || sorted.length > 0 ? (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-gray-400">
            {sorted.length === 0 ? 'No results' : (
              <>
                Showing <strong className="text-gray-600">{(safePage - 1) * pageSize + 1}</strong>–<strong className="text-gray-600">{Math.min(safePage * pageSize, sorted.length)}</strong> of <strong className="text-gray-600">{sorted.length}</strong>
                {search && <span className="text-indigo-500"> (filtered)</span>}
              </>
            )}
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <PageBtn onClick={() => setPage(1)}       disabled={safePage === 1}><FiChevronsLeft size={13} /></PageBtn>
              <PageBtn onClick={() => setPage(p => p - 1)} disabled={safePage === 1}><FiChevronLeft  size={13} /></PageBtn>

              {/* Page numbers */}
              {getPageNumbers(safePage, totalPages).map((n, i) =>
                n === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">…</span>
                ) : (
                  <PageBtn key={n} onClick={() => setPage(Number(n))} active={safePage === Number(n)}>
                    {n}
                  </PageBtn>
                )
              )}

              <PageBtn onClick={() => setPage(p => p + 1)} disabled={safePage === totalPages}><FiChevronRight  size={13} /></PageBtn>
              <PageBtn onClick={() => setPage(totalPages)} disabled={safePage === totalPages}><FiChevronsRight size={13} /></PageBtn>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

function PageBtn({ children, onClick, disabled, active }: {
  children: ReactNode; onClick: () => void; disabled?: boolean; active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'bg-indigo-500 text-white'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  )
}

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = []
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', total)
  } else if (current >= total - 3) {
    pages.push(1, '…', total - 4, total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '…', current - 1, current, current + 1, '…', total)
  }
  return pages
}
