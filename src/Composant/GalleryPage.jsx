import { useState, useEffect, useRef } from 'react'
import PageHeader from './PageHeader'
import { useGetAllGalleriesQuery } from '../services/api/galleryApi'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const BASE_IMG = 'http://localhost:8080/api'

function getImageUrl(img) {
  if (!img) return null
  if (img.startsWith('http')) return img
  return `${BASE_IMG}${img.startsWith('/') ? img : `/${img}`}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Card
// ─────────────────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col p-3 animate-pulse">
      <div className="w-full h-56 rounded-xl mb-3 bg-slate-200" />
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="h-20 rounded-lg bg-slate-200" />
        <div className="h-20 rounded-lg bg-slate-200" />
        <div className="h-20 rounded-lg bg-slate-200" />
      </div>
      <div className="flex items-center justify-between px-1 pb-1 mt-auto">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-4 w-10 rounded bg-slate-200" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Gallery Card (données réelles)
// ─────────────────────────────────────────────────────────────────────────────
function GalleryCard({ item, delay, visible }) {
  const images = item.images || []
  const [activeIndex, setActiveIndex] = useState(0)

  const mainSrc = getImageUrl(images[activeIndex])
  const thumbnails = images.slice(0, 4) // on affiche jusqu'à 4 miniatures

  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_2px_16px_-8px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col p-3 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* ── Image principale ── */}
      <div className="w-full h-56 overflow-hidden rounded-xl mb-3 bg-slate-100">
        {mainSrc ? (
          <img
            src={mainSrc}
            alt={item.titre || item.projetTitre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Aucune image
          </div>
        )}
      </div>

      {/* ── Miniatures cliquables ── */}
      {thumbnails.length > 1 && (
        <div className={`grid gap-3 mb-4 ${thumbnails.length >= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
          {thumbnails.map((img, idx) => {
            const src = getImageUrl(img)
            const isLast = idx === thumbnails.length - 1 && images.length > 4
            return (
              <div
                key={idx}
                className={`h-20 overflow-hidden rounded-lg cursor-pointer relative ${
                  activeIndex === idx ? 'ring-2 ring-[#023B6A]' : ''
                }`}
                onClick={() => setActiveIndex(idx)}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                />
                {isLast && (
                  <div className="absolute inset-0 bg-[#023B6A]/60 flex items-center justify-center text-white font-bold text-sm">
                    +{images.length - 4}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Footer titre + compteur ── */}
      <div className="flex items-center justify-between px-1 pb-1 mt-auto">
        <h3 className="text-[0.95rem] font-bold text-[#023B6A] leading-snug line-clamp-1">
          {item.titre || item.projetTitre || 'Galerie'}
        </h3>
        <div className="flex items-center text-slate-500 text-sm font-semibold gap-1 whitespace-nowrap pl-4">
          +{images.length}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 ml-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page principale
// ─────────────────────────────────────────────────────────────────────────────
export default function GalleryPage({ t }) {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)

  // ── API call ──────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetAllGalleriesQuery()
  // Le backend renvoie { success, data: [...], ... }
  const galleries = data?.data ?? []

  // ── Intersection Observer pour les animations d'entrée ───────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const content = t?.galleryPage || {}

  return (
    <div className="w-full bg-slate-50 min-h-screen font-['Outfit',sans-serif]">
      <PageHeader
        tagline={content.headerTagline || 'GALERIE'}
        title={content.headerTitle || 'Notre galerie de projets'}
        subtitle={content.headerSubtitle || 'Découvrez nos réalisations en images.'}
      />

      <section
        ref={sectionRef}
        className="py-20 px-8 sm:px-16 lg:px-24 xl:px-32 bg-white"
      >
        <div className="max-w-screen-xl mx-auto">

          {/* ── Chargement ── */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* ── Erreur ── */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold">Impossible de charger la galerie.</p>
              <p className="text-sm mt-1">Veuillez vérifier votre connexion et réessayer.</p>
            </div>
          )}

          {/* ── Aucun résultat ── */}
          {!isLoading && !isError && galleries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-semibold">Aucune galerie disponible pour le moment.</p>
            </div>
          )}

          {/* ── Grille des galeries ── */}
          {!isLoading && !isError && galleries.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-fr">
              {galleries.map((item, index) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  delay={index * 150}
                  visible={visible}
                />
              ))}
            </div>
          )}

        </div>
      </section>
    </div>
  )
}
