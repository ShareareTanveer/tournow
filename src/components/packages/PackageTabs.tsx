'use client'

import { useState } from 'react'
import {
  FiStar, FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo,
  FiMapPin, FiFlag, FiUsers, FiPackage, FiMessageSquare,
} from 'react-icons/fi'
import { MdHotel } from 'react-icons/md'

const STAR_MAP: Record<string, number> = { THREE: 3, FOUR: 4, FIVE: 5 }

const TABS = [
  { id: 'overview',      label: 'Overview' },
  { id: 'itinerary',     label: 'Itinerary' },
  { id: 'accommodation', label: 'Accommodation' },
  { id: 'inclusions',    label: 'Inclusions' },
  { id: 'info',          label: 'Important Info' },
  { id: 'reviews',       label: 'Reviews' },
]

export default function PackageTabs({ pkg, stars }: { pkg: any; stars: number }) {
  const [active, setActive] = useState('overview')

  const activeTabs = TABS.filter(t => {
    if (t.id === 'itinerary' && !pkg.itinerary?.length) return false
    if (t.id === 'accommodation' && !pkg.accommodations?.length) return false
    if (t.id === 'reviews' && !pkg.reviews?.length) return false
    return true
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-gray-100 scrollbar-none">
        {activeTabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px"
            style={active === t.id
              ? { borderColor: 'var(--brand)', color: 'var(--brand-dark)' }
              : { borderColor: 'transparent', color: '#6b7280' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">

        {/* ── OVERVIEW ── */}
        {active === 'overview' && (
          <div className="space-y-6">
            {/* Description */}
            {pkg.description && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-3">About This Experience</h2>
                {pkg.description.startsWith('<') ? (
                  <div className="prose prose-sm max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: pkg.description }} />
                ) : (
                  <p className="text-gray-600 leading-relaxed">{pkg.description}</p>
                )}
              </div>
            )}

            {/* Highlights */}
            {pkg.highlights?.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3">Highlights</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pkg.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <FiCheckCircle size={15} className="shrink-0 mt-0.5" style={{ color: 'var(--teal)' }} />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick facts grid */}
            <div>
              <h3 className="text-base font-bold text-gray-800 mb-3">Quick Facts</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Fact icon={<FiCheckCircle size={15} style={{ color: pkg.isFoodIncluded ? 'var(--teal)' : '#d1d5db' }} />}
                  label="Food" value={pkg.isFoodIncluded ? 'Included' : 'Not included'}
                  positive={pkg.isFoodIncluded} />
                <Fact icon={<FiCheckCircle size={15} style={{ color: pkg.isTransportIncluded ? 'var(--teal)' : '#d1d5db' }} />}
                  label="Transport" value={pkg.isTransportIncluded ? 'Included' : 'Not included'}
                  positive={pkg.isTransportIncluded} />
                {pkg.minAge != null && <Fact icon={<FiUsers size={15} style={{ color: 'var(--brand)' }} />} label="Min Age" value={`${pkg.minAge}+`} />}
                {pkg.maxGroupSize && <Fact icon={<FiUsers size={15} style={{ color: 'var(--brand)' }} />} label="Group Size" value={`Max ${pkg.maxGroupSize}`} />}
                {pkg.difficulty && <Fact icon={<FiFlag size={15} style={{ color: 'var(--brand)' }} />} label="Difficulty"
                  value={pkg.difficulty.charAt(0) + pkg.difficulty.slice(1).toLowerCase()} />}
                <Fact icon={<FiStar size={15} style={{ color: '#0a83f5' }} />} label="Hotel" value={`${stars} Star`} />
              </div>
            </div>
          </div>
        )}

        {/* ── ITINERARY ── */}
        {active === 'itinerary' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-5">Day-by-Day Itinerary</h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gray-100" />

              <div className="space-y-4">
                {pkg.itinerary
                  .sort((a: any, b: any) => a.dayNumber - b.dayNumber)
                  .map((day: any, idx: number) => (
                    <ItineraryDay key={day.id} day={day} last={idx === pkg.itinerary.length - 1} />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACCOMMODATION ── */}
        {active === 'accommodation' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-5">Accommodation</h2>
            <div className="space-y-4">
              {pkg.accommodations?.map((acc: any) => (
                <div key={acc.id} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                  {acc.imageUrl ? (
                    <img src={acc.imageUrl} alt={acc.name} className="w-24 h-20 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-24 h-20 rounded-lg shrink-0 flex items-center justify-center bg-gray-50">
                      <MdHotel size={24} className="text-gray-300" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{acc.name}</h3>
                      {acc.starRating && (
                        <div className="flex gap-0.5 shrink-0">
                          {Array.from({ length: acc.starRating }).map((_, i) => (
                            <FiStar key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                    {acc.location && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><FiMapPin size={10} />{acc.location}</p>}
                    {acc.nightsStay > 0 && <p className="text-xs text-gray-500 mt-1">{acc.nightsStay} night{acc.nightsStay > 1 ? 's' : ''}</p>}
                    {acc.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{acc.description}</p>}
                  </div>
                </div>
              ))}
              {(!pkg.accommodations || pkg.accommodations.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-6">Accommodation details will be provided upon booking.</p>
              )}
            </div>
          </div>
        )}

        {/* ── INCLUSIONS ── */}
        {active === 'inclusions' && (
          <div className="space-y-6">
            {/* Included */}
            {(pkg.inclusionService?.length > 0 || pkg.inclusions?.length > 0) && (
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FiCheckCircle size={16} style={{ color: 'var(--teal)' }} /> What's Included
                </h3>
                <ul className="space-y-2">
                  {(pkg.inclusionService?.length ? pkg.inclusionService : pkg.inclusions).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <FiCheckCircle size={14} className="shrink-0 mt-0.5 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Not included */}
            {(pkg.exclusionService?.length > 0 || pkg.exclusions?.length > 0) && (
              <div>
                <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <FiXCircle size={16} className="text-red-400" /> Not Included
                </h3>
                <ul className="space-y-2">
                  {(pkg.exclusionService?.length ? pkg.exclusionService : pkg.exclusions).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <FiXCircle size={14} className="shrink-0 mt-0.5 text-red-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── IMPORTANT INFO ── */}
        {active === 'info' && (
          <div className="space-y-6">
            {pkg.importantInfo && (
              <InfoBlock icon={<FiInfo size={15} style={{ color: 'var(--brand)' }} />} title="Important Information" color="amber">
                <RichContent content={pkg.importantInfo} />
              </InfoBlock>
            )}
            {pkg.meetingPoint && (
              <InfoBlock icon={<FiMapPin size={15} style={{ color: 'var(--teal)' }} />} title="Meeting Point" color="teal">
                <p className="text-sm text-gray-600">{pkg.meetingPoint}</p>
              </InfoBlock>
            )}
            {pkg.dropOff && (
              <InfoBlock icon={<FiMapPin size={15} style={{ color: 'var(--teal)' }} />} title="Drop-Off Point" color="teal">
                <p className="text-sm text-gray-600">{pkg.dropOff}</p>
              </InfoBlock>
            )}
            {pkg.mustCarryItem?.length > 0 && (
              <InfoBlock icon={<FiPackage size={15} style={{ color: 'var(--brand)' }} />} title="Must Carry Items" color="amber">
                <ul className="space-y-1">
                  {pkg.mustCarryItem.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--brand)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </InfoBlock>
            )}
            {pkg.notSuitable?.length > 0 && (
              <InfoBlock icon={<FiAlertCircle size={15} className="text-indigo-500" />} title="Not Suitable For" color="indigo">
                <ul className="space-y-1">
                  {pkg.notSuitable.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <FiXCircle size={12} className="text-indigo-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </InfoBlock>
            )}
            {pkg.notAllowed?.length > 0 && (
              <InfoBlock icon={<FiAlertCircle size={15} className="text-red-500" />} title="Not Allowed" color="red">
                <ul className="space-y-1">
                  {pkg.notAllowed.map((item: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <FiXCircle size={12} className="text-red-400 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </InfoBlock>
            )}
            {pkg.cancellationPolicy && (
              <InfoBlock icon={<FiInfo size={15} className="text-blue-500" />} title="Cancellation Policy" color="blue">
                <RichContent content={pkg.cancellationPolicy} />
              </InfoBlock>
            )}
            {pkg.emergencyContact && (
              <InfoBlock icon={<FiMessageSquare size={15} className="text-red-500" />} title="Emergency Contact" color="red">
                <p className="text-sm text-gray-600 font-medium">{pkg.emergencyContact}</p>
              </InfoBlock>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {active === 'reviews' && (
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              Reviews
              {pkg.reviews?.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">({pkg.reviews.length})</span>
              )}
            </h2>
            {pkg.reviews?.length > 0 ? (
              <div className="space-y-4">
                {pkg.reviews.map((r: any) => (
                  <div key={r.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{r.name}</p>
                        {r.location && <p className="text-xs text-gray-400">{r.location}</p>}
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} size={12}
                            className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Be the first!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function Fact({ icon, label, value, positive }: { icon: React.ReactNode; label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
      {icon}
      <div>
        <p className="text-[10px] text-gray-400 leading-none">{label}</p>
        <p className={`text-xs font-semibold mt-0.5 ${positive === false ? 'text-gray-400' : 'text-gray-700'}`}>{value}</p>
      </div>
    </div>
  )
}

function ItineraryDay({ day, last }: { day: any; last: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative pl-12">
      {/* Circle */}
      <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full border-2 z-10"
        style={{ borderColor: 'var(--brand)', background: open ? 'var(--brand)' : '#fff' }} />

      <div className="border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0"
              style={{ background: 'var(--brand-muted)', color: 'var(--brand-dark)' }}>
              {day.dayNumber}
            </span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">{day.title}</p>
              {!open && day.activities?.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{day.activities.length} activities</p>
              )}
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-400 shrink-0 transition-transform" style={{ transform: open ? 'rotate(180deg)' : '' }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {day.imageUrl && (
              <img src={day.imageUrl} alt={day.title} className="w-full h-32 object-cover rounded-lg mt-3 mb-3" />
            )}
            <p className="text-sm text-gray-600 leading-relaxed mt-3">{day.description}</p>
            {day.activities?.length > 0 && (
              <ul className="mt-3 space-y-1">
                {day.activities.map((act: string, i: number) => (
                  <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--brand)' }} />
                    {act}
                  </li>
                ))}
              </ul>
            )}
            {day.meals?.length > 0 && (
              <p className="mt-3 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                Meals: {day.meals.join(' · ')}
              </p>
            )}
            {day.accommodation && (
              <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                <MdHotel size={12} /> {day.accommodation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoBlock({ icon, title, color, children }: {
  icon: React.ReactNode
  title: string
  color: 'amber' | 'teal' | 'indigo' | 'red' | 'blue'
  children: React.ReactNode
}) {
  const bg = { amber: '#fffbeb', teal: '#f0fdf9', indigo: '#fff7ed', red: '#fef2f2', blue: '#eff6ff' }[color]
  const border = { amber: '#fde68a', teal: '#99f6e4', indigo: '#fed7aa', red: '#fecaca', blue: '#bfdbfe' }[color]
  return (
    <div className="rounded-xl p-4 border" style={{ background: bg, borderColor: border }}>
      <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">{icon}{title}</h3>
      {children}
    </div>
  )
}

function RichContent({ content }: { content: string }) {
  if (content.startsWith('<')) {
    return <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
  }
  return <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
}
