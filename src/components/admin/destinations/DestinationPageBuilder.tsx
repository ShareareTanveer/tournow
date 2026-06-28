/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import DestinationBuilderSectionEditor from '@/components/admin/destinations/DestinationBuilderSectionEditor'
import DestinationBuilderSectionIcon from '@/components/admin/destinations/DestinationBuilderSectionIcon'
import DestinationBuilderSectionTypePicker from '@/components/admin/destinations/DestinationBuilderSectionTypePicker'
import { DESTINATION_BUILDER_SECTION_TYPES } from '@/components/admin/destinations/DestinationBuilderSectionTypes'
import { DESTINATION_SECTION_LIBRARY } from '@/lib/destination-page-builder'
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiEdit3, FiEye, FiEyeOff, FiPlus, FiTrash2 } from 'react-icons/fi'

type BuilderPayload = {
  destination: {
    id: string
    name: string
    slug: string
  }
  sections: any[]
  sectionLibrary: typeof DESTINATION_SECTION_LIBRARY
}

export default function DestinationPageBuilder({ slug }: { slug: string }) {
  const [data, setData] = useState<BuilderPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [showTypePicker, setShowTypePicker] = useState(false)
  const [deleteSectionId, setDeleteSectionId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/destinations/${slug}/sections`, {
        credentials: 'include',
        cache: 'no-store',
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Failed to fetch sections')

      setData(payload)
      setSelectedSectionId((current) => {
        if (current && payload.sections.some((section: any) => section.id === current)) return current
        return payload.sections[0]?.id ?? null
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  const sections = useMemo(() => data?.sections ?? [], [data?.sections])
  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? null,
    [sections, selectedSectionId]
  )

  async function handleAddSection(sectionType: string) {
    const response = await fetch(`/api/admin/destinations/${slug}/sections`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionType }),
    })
    if (!response.ok) return
    setShowTypePicker(false)
    await fetchData()
  }

  async function handleSaveSection(sectionId: string, payload: any) {
    const response = await fetch(`/api/admin/destinations/${slug}/sections/${sectionId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) return
    await fetchData()
    setSelectedSectionId(sectionId)
  }

  async function handleDeleteSection() {
    if (!deleteSectionId) return
    const response = await fetch(`/api/admin/destinations/${slug}/sections/${deleteSectionId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) return
    if (selectedSectionId === deleteSectionId) setSelectedSectionId(null)
    setDeleteSectionId(null)
    await fetchData()
  }

  async function handleToggleVisibility(sectionId: string) {
    const response = await fetch(`/api/admin/destinations/${slug}/sections/${sectionId}/toggle`, {
      method: 'PATCH',
      credentials: 'include',
    })
    if (!response.ok) return
    await fetchData()
  }

  async function handleMove(sectionId: string, direction: -1 | 1) {
    const index = sections.findIndex((section) => section.id === sectionId)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= sections.length) return

    const reordered = [...sections]
    const [item] = reordered.splice(index, 1)
    reordered.splice(nextIndex, 0, item)

    const items = reordered.map((section, order) => ({ id: section.id, order }))
    const response = await fetch(`/api/admin/destinations/${slug}/sections/reorder`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
    if (!response.ok) return
    await fetchData()
    setSelectedSectionId(sectionId)
  }

  if (loading && !data) {
    return <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">Loading builder...</div>
  }

  return (
    <div className="pb-10 pt-5">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/destinations/${slug}`}
            className="rounded-lg p-2 transition hover:bg-gray-100"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {data?.destination.name || 'Destination'} - Section Builder
            </h1>
            <p className="text-sm text-gray-500">/{data?.destination.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/destinations/${slug}`}
            target="_blank"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            View Live Page
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900">Sections ({sections.length})</h2>
              <button
                type="button"
                onClick={() => setShowTypePicker(true)}
                className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
              >
                <FiPlus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="max-h-[calc(100vh-260px)] divide-y divide-gray-100 overflow-y-auto">
              {sections.length === 0 && (
                <div className="p-8 text-center text-sm text-gray-400">
                  No sections yet. Click &quot;Add&quot; to get started.
                </div>
              )}

              {sections.map((section, index) => {
                const isSelected = selectedSectionId === section.id
                const typeConfig = DESTINATION_BUILDER_SECTION_TYPES.find((item) => item.type === section.sectionType)

                return (
                  <div
                    key={section.id}
                    className={`cursor-pointer border-l-2 p-3 transition ${
                      isSelected ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSectionId(section.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <DestinationBuilderSectionIcon iconName={typeConfig?.iconName} className="h-4 w-4 flex-shrink-0 text-gray-400" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">{section.title}</p>
                            <p className="text-[11px] text-gray-400">{section.sectionType}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleToggleVisibility(section.id)
                          }}
                          className={`rounded p-1 ${section.isVisible ? 'text-green-500' : 'text-gray-300'}`}
                          title={section.isVisible ? 'Visible' : 'Hidden'}
                        >
                          {section.isVisible ? <FiEye className="h-3.5 w-3.5" /> : <FiEyeOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleMove(section.id, -1)
                          }}
                          disabled={index === 0}
                          className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <FiChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleMove(section.id, 1)
                          }}
                          disabled={index >= sections.length - 1}
                          className="rounded p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <FiChevronDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            setDeleteSectionId(section.id)
                          }}
                          className="rounded p-1 text-gray-400 hover:text-red-500"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-span-8">
          {selectedSection ? (
            <DestinationBuilderSectionEditor
              section={selectedSection}
              onSave={(payload) => handleSaveSection(selectedSection.id, payload)}
            />
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <FiEdit3 className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">
                Select a section from the left panel to edit it,
                <br />
                or click &quot;Add&quot; to create a new section.
              </p>
            </div>
          )}
        </div>
      </div>

      {showTypePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[80vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add Section</h2>
              <button
                type="button"
                onClick={() => setShowTypePicker(false)}
                className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <DestinationBuilderSectionTypePicker onSelect={handleAddSection} />
          </div>
        </div>
      )}

      {deleteSectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900">Delete Section</h3>
            <p className="mt-2 text-sm text-gray-500">Are you sure you want to delete this section?</p>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteSectionId(null)}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSection}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
