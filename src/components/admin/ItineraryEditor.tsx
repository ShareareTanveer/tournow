'use client'

import { FiPlus, FiTrash2 } from 'react-icons/fi'

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

function toLines(items: string[] | undefined | null) {
  return (items ?? []).join('\n')
}

function fromLines(value: string) {
  return value.split('\n').map(item => item.trim()).filter(Boolean)
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
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Activities</label>
                  <p className="mb-1 text-xs text-gray-400">One activity per line</p>
                  <textarea
                    rows={4}
                    value={toLines(day.activities)}
                    onChange={event => updateDay(index, { activities: fromLines(event.target.value) })}
                    placeholder={'Airport pickup\nHotel check-in\nEvening city walk'}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Meals</label>
                  <p className="mb-1 text-xs text-gray-400">One meal per line</p>
                  <textarea
                    rows={4}
                    value={toLines(day.meals)}
                    onChange={event => updateDay(index, { meals: fromLines(event.target.value) })}
                    placeholder={'Breakfast\nDinner'}
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Accommodation</label>
                  <input
                    value={day.accommodation ?? ''}
                    onChange={event => updateDay(index, { accommodation: event.target.value })}
                    placeholder="Beach resort / 4-star hotel"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500">Image URL</label>
                  <input
                    value={day.imageUrl ?? ''}
                    onChange={event => updateDay(index, { imageUrl: event.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
