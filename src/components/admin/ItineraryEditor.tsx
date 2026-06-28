'use client'

import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from 'react-icons/fi'
import MediaUploader from '@/components/admin/MediaUploader'
import SearchableCreatableSelect from '@/components/admin/SearchableCreatableSelect'
import { ACCOMMODATION_OPTIONS, ACTIVITY_OPTIONS, MEAL_OPTIONS } from '@/lib/admin-select-options'

export interface ItineraryFormDay {
  id?: string
  dayNumber: number
  title: string
  description: string
  country?: string
  activities: string[]
  meals: string[]
  accommodation?: string
  imageUrl?: string
}

function blankDay(dayNumber: number): ItineraryFormDay {
  return {
    dayNumber,
    title: '',
    description: '',
    activities: [],
    meals: [],
    accommodation: '',
    imageUrl: '',
  }
}

export function normalizeItineraryDays(days: ItineraryFormDay[]) {
  return days
    .map((day, index) => ({
      dayNumber: Number(day.dayNumber) || index + 1,
      title: day.title.trim(),
      description: day.description.trim(),
      country: day.country?.trim() || undefined,
      activities: day.activities.map(item => item.trim()).filter(Boolean),
      meals: day.meals.map(item => item.trim()).filter(Boolean),
      accommodation: day.accommodation?.trim() || undefined,
      imageUrl: day.imageUrl?.trim() || undefined,
    }))
    .filter(day => day.title || day.description || day.activities.length > 0)
    .map((day, index) => ({ ...day, dayNumber: index + 1 }))
}

export default function ItineraryEditor({
  days,
  onChange,
  showCountry = false,
}: {
  days: ItineraryFormDay[]
  onChange: (days: ItineraryFormDay[]) => void
  showCountry?: boolean
}) {
  const updateDay = (index: number, patch: Partial<ItineraryFormDay>) => {
    onChange(days.map((day, dayIndex) => dayIndex === index ? { ...day, ...patch } : day))
  }

  const addDay = () => onChange([...days, blankDay(days.length + 1)])

  const removeDay = (index: number) => {
    onChange(days.filter((_, dayIndex) => dayIndex !== index).map((day, dayIndex) => ({
      ...day,
      dayNumber: dayIndex + 1,
    })))
  }

  const moveDay = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= days.length) return
    const nextDays = [...days]
    ;[nextDays[index], nextDays[nextIndex]] = [nextDays[nextIndex], nextDays[index]]
    onChange(nextDays.map((day, dayIndex) => ({ ...day, dayNumber: dayIndex + 1 })))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-800">Day-by-Day Itinerary</h3>
          <p className="text-xs text-gray-400 mt-0.5">These days appear on the public Itinerary tab.</p>
        </div>
        <button
          type="button"
          onClick={addDay}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
        >
          <FiPlus size={14} /> Add Day
        </button>
      </div>

      {days.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <p className="text-sm font-semibold text-gray-600">No itinerary days yet</p>
          <p className="mt-1 text-xs text-gray-400">Add day-wise content to show an itinerary on the website.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {days.map((day, index) => (
            <div key={day.id ?? index} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-sm font-black text-indigo-600">
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Day {index + 1}</p>
                    <p className="text-xs text-gray-400">{day.activities.length} activities</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDay(index)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                >
                  <FiTrash2 size={13} /> Remove
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveDay(index, -1)}
                    disabled={index === 0}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-35"
                    title="Move day up"
                  >
                    <FiArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDay(index, 1)}
                    disabled={index === days.length - 1}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 text-gray-500 hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-35"
                    title="Move day down"
                  >
                    <FiArrowDown size={13} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Day Title</label>
                  <input
                    value={day.title}
                    onChange={event => updateDay(index, { title: event.target.value })}
                    placeholder="Arrival in Maldives"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                {showCountry && (
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500">Country / Area</label>
                    <input
                      value={day.country ?? ''}
                      onChange={event => updateDay(index, { country: event.target.value })}
                      placeholder="Thailand"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                )}
                <div className={showCountry ? '' : 'lg:col-span-2'}>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Short Description</label>
                  <textarea
                    rows={3}
                    value={day.description}
                    onChange={event => updateDay(index, { description: event.target.value })}
                    placeholder="Describe the day plan..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <SearchableCreatableSelect
                  label="Activities"
                  hint="Select activities or add custom"
                  value={day.activities}
                  options={ACTIVITY_OPTIONS}
                  onChange={items => updateDay(index, { activities: items })}
                  placeholder="Select activities"
                />
                <SearchableCreatableSelect
                  label="Meals"
                  hint="Select meals or add custom"
                  value={day.meals}
                  options={MEAL_OPTIONS}
                  onChange={items => updateDay(index, { meals: items })}
                  placeholder="Select meals"
                />
                <SearchableCreatableSelect
                  label="Accommodation"
                  value={day.accommodation ? [day.accommodation] : []}
                  options={ACCOMMODATION_OPTIONS}
                  onChange={items => updateDay(index, { accommodation: items[0] ?? '' })}
                  multiple={false}
                  placeholder="Select accommodation"
                />
                <MediaUploader
                  label="Day Image"
                  value={day.imageUrl ?? ''}
                  onChange={url => updateDay(index, { imageUrl: url })}
                  folder="itinerary"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
