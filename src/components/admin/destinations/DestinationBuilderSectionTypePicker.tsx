'use client'

import { DESTINATION_BUILDER_SECTION_TYPES } from '@/components/admin/destinations/DestinationBuilderSectionTypes'

const CATEGORIES = [
  { key: 'layout', label: 'Layout' },
  { key: 'content', label: 'Content' },
  { key: 'data', label: 'Data-Driven' },
  { key: 'advanced', label: 'Advanced' },
] as const

export default function DestinationBuilderSectionTypePicker({
  onSelect,
}: {
  onSelect: (sectionType: string) => void
}) {
  return (
    <div className="space-y-6 py-2">
      {CATEGORIES.map((category) => {
        const items = DESTINATION_BUILDER_SECTION_TYPES.filter((item) => item.category === category.key)
        if (items.length === 0) return null

        return (
          <div key={category.key}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {category.label}
            </h3>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onSelect(item.type)}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <span className="mt-0.5 text-xl">{item.icon}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="line-clamp-2 text-[11px] text-gray-400">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
