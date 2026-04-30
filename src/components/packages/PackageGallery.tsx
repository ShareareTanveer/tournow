'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FiX, FiChevronLeft, FiChevronRight, FiGrid } from 'react-icons/fi'

type GalleryLayout = 'grid-2x2' | 'grid-3col' | 'featured-left' | 'featured-right' | 'strip'

interface Props {
  images: string[]
  title: string
  layout?: GalleryLayout
}

export default function PackageGallery({ images, title, layout = 'grid-2x2' }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  const main = images[0]
  const totalPhotos = images.length

  function prev() {
    if (lightbox === null) return
    setLightbox((lightbox - 1 + images.length) % images.length)
  }
  function next() {
    if (lightbox === null) return
    setLightbox((lightbox + 1) % images.length)
  }

  if (!main) {
    return (
      <div className="w-full h-72 md:h-[460px] flex items-center justify-center rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, var(--brand), var(--teal))' }}>
        <span className="text-white text-6xl font-black opacity-20">{title?.[0] ?? '?'}</span>
      </div>
    )
  }

  function Thumb({ index, className = '' }: { index: number; className?: string }) {
    const img = images[index]
    if (!img) return <div className={`bg-gray-800 ${className}`} />
    return (
      <div className={`relative overflow-hidden cursor-pointer group ${className}`}
        onClick={() => setLightbox(index)}>
        <Image src={img} alt={`${title} ${index + 1}`} fill
          className="object-cover group-hover:brightness-90 transition-all duration-300" />
      </div>
    )
  }

  function ViewAllOverlay({ triggerIndex }: { triggerIndex: number }) {
    const remaining = totalPhotos - triggerIndex - 1
    if (remaining <= 0) return null
    return (
      <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1 hover:bg-black/65 transition-colors cursor-pointer"
        onClick={(e) => { e.stopPropagation(); setLightbox(0) }}>
        <FiGrid size={20} className="text-white" />
        <span className="text-white font-bold text-sm">+{remaining}</span>
        <span className="text-white/80 text-[10px]">View all</span>
      </div>
    )
  }

  const H = 'h-64 sm:h-80 md:h-[460px]'

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl">
        <div>

          {/* ── grid-2x2: large left + 2×2 right (GYG classic) ── */}
          {layout === 'grid-2x2' && (
            <div className={`flex gap-1 ${H}`}>
              <div className="relative flex-[3] overflow-hidden cursor-pointer group" onClick={() => setLightbox(0)}>
                <Image src={main} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>
              {images.length > 1 && (
                <div className="flex-[2] grid grid-cols-2 gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="relative overflow-hidden cursor-pointer group" onClick={() => setLightbox(Math.min(i, totalPhotos - 1))}>
                      {images[i] ? (
                        <>
                          <Image src={images[i]} alt={`${title} ${i + 1}`} fill className="object-cover group-hover:brightness-90 transition-all duration-300" />
                          {i === 4 && <ViewAllOverlay triggerIndex={4} />}
                        </>
                      ) : <div className="w-full h-full bg-gray-800" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── featured-left: big left + 3 stacked right ── */}
          {layout === 'featured-left' && (
            <div className={`flex gap-1 ${H}`}>
              <div className="relative flex-[3] overflow-hidden cursor-pointer group" onClick={() => setLightbox(0)}>
                <Image src={main} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
              </div>
              {images.length > 1 && (
                <div className="flex-[2] flex flex-col gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="relative flex-1 overflow-hidden cursor-pointer group" onClick={() => setLightbox(Math.min(i, totalPhotos - 1))}>
                      {images[i] ? (
                        <>
                          <Image src={images[i]} alt={`${title} ${i + 1}`} fill className="object-cover group-hover:brightness-90 transition-all duration-300" />
                          {i === 3 && <ViewAllOverlay triggerIndex={3} />}
                        </>
                      ) : <div className="w-full h-full bg-gray-800" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── featured-right: 3 stacked left + big right ── */}
          {layout === 'featured-right' && (
            <div className={`flex gap-1 ${H}`}>
              {images.length > 1 && (
                <div className="flex-[2] flex flex-col gap-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="relative flex-1 overflow-hidden cursor-pointer group" onClick={() => setLightbox(Math.min(i, totalPhotos - 1))}>
                      {images[i] ? (
                        <Image src={images[i]} alt={`${title} ${i + 1}`} fill className="object-cover group-hover:brightness-90 transition-all duration-300" />
                      ) : <div className="w-full h-full bg-gray-800" />}
                    </div>
                  ))}
                </div>
              )}
              <div className="relative flex-[3] overflow-hidden cursor-pointer group" onClick={() => setLightbox(0)}>
                <Image src={main} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                {totalPhotos > 4 && <ViewAllOverlay triggerIndex={3} />}
              </div>
            </div>
          )}

          {/* ── grid-3col: 3-column uniform grid ── */}
          {layout === 'grid-3col' && (
            <div className={`grid grid-cols-3 gap-1 ${H}`}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative overflow-hidden cursor-pointer group" onClick={() => setLightbox(Math.min(i, totalPhotos - 1))}>
                  {images[i] ? (
                    <>
                      <Image src={images[i]} alt={`${title} ${i + 1}`} fill className="object-cover group-hover:brightness-90 transition-all duration-300" />
                      {i === 5 && <ViewAllOverlay triggerIndex={5} />}
                    </>
                  ) : <div className="w-full h-full bg-gray-800" />}
                </div>
              ))}
            </div>
          )}

          {/* ── strip: tall featured + horizontal strip below ── */}
          {layout === 'strip' && (
            <div className={`flex flex-col gap-1 ${H}`}>
              <div className="relative flex-[3] overflow-hidden cursor-pointer group" onClick={() => setLightbox(0)}>
                <Image src={main} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>
              {images.length > 1 && (
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="relative flex-1 overflow-hidden cursor-pointer group" onClick={() => setLightbox(Math.min(i, totalPhotos - 1))}>
                      {images[i] ? (
                        <>
                          <Image src={images[i]} alt={`${title} ${i + 1}`} fill className="object-cover group-hover:brightness-90 transition-all duration-300" />
                          {i === 4 && <ViewAllOverlay triggerIndex={4} />}
                        </>
                      ) : <div className="w-full h-full bg-gray-800" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* View all button */}
          {totalPhotos > 1 && (
            <div className="py-2 flex items-center justify-end">
              <button onClick={() => setLightbox(0)}
                className="flex items-center gap-2 bg-white/95 hover:bg-white text-gray-800 text-xs font-semibold px-4 py-2 rounded-xl shadow-lg transition-all hover:shadow-xl">
                <FiGrid size={13} /> View all {totalPhotos} photos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            onClick={() => setLightbox(null)}>
            <FiX size={20} />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); prev() }}>
            <FiChevronLeft size={22} />
          </button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); next() }}>
            <FiChevronRight size={22} />
          </button>
          <div className="relative w-full max-w-5xl max-h-[88vh] mx-12" onClick={(e) => e.stopPropagation()}>
            <Image src={images[lightbox]} alt={`${title} ${lightbox + 1}`}
              width={1400} height={900} className="object-contain w-full h-full max-h-[88vh] rounded-xl" />
            <p className="text-center text-white/40 text-xs mt-3">{lightbox + 1} / {totalPhotos}</p>
          </div>
          {totalPhotos > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 max-w-[90vw] overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); setLightbox(i) }}
                  className={`shrink-0 relative w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                    i === lightbox ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-90'
                  }`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
