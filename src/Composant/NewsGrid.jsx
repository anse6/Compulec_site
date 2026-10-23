import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon } from '../assets/Compulecicons'
import { useGetArticlesPubliesQuery } from '../services/api/newsApi'
import { getMediaUrl, formatPublicDate, readingMinutes } from '../services/publicContent'
import b1 from '../assets/b1.png'
import b2 from '../assets/b2.png'
import b3 from '../assets/b3.png'

/** Nombre d'articles affichés sur la page d'accueil (les plus récemment publiés). */
const HOME_ARTICLES = 3

// Visuels de secours pour un article sans image de couverture
const FALLBACK_IMAGES = [b1, b2, b3]

const ArticleCard = ({ item, index, t, currentLang, delay, visible }) => {
  const navigate = useNavigate()
  const imgSrc = getMediaUrl(item.imageUrl) || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  const minutes = readingMinutes(item.heading, item.overview)
  const open = () => navigate(`/resources/${item.id}`)

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === 'Enter') open() }}
      className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col h-full cursor-pointer ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDuration: '600ms', transitionDelay: `${delay}ms` }}
    >
      {/* Image avec effet zoom au hover */}
      <div className="w-full h-52 overflow-hidden flex-shrink-0 relative bg-slate-100">
        <img
          src={imgSrc}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Contenu */}
      <div className="p-7 flex flex-col flex-grow">
        {/* Meta : date de publication • temps de lecture */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 font-semibold">
          <span className="text-amber-500 font-extrabold tracking-wider">
            {formatPublicDate(item.createdAt, currentLang)}
          </span>
          <span className="text-slate-300">•</span>
          <span>{t.newsGrid.readTime.replace('{n}', minutes)}</span>
        </div>

        {/* Titre */}
        <h3 className="text-lg font-bold text-[#023B6A] leading-snug mb-3 line-clamp-2">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed flex-grow line-clamp-3">
          {item.subtitle || item.overview}
        </p>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="w-full h-52 bg-slate-200 flex-shrink-0" />
      <div className="p-7 flex flex-col flex-grow gap-3">
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  )
}

export default function NewsGrid({ t, currentLang }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)

  const { data, isLoading, isError } = useGetArticlesPubliesQuery({ page: 0, size: HOME_ARTICLES })
  const articles = data?.data?.content ?? []

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="w-full px-8 sm:px-16 lg:px-24 xl:px-32">

        {/* Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 transition-[transform,opacity] duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="max-w-2xl">
            <div className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-4">
              {t.newsGrid.tagline}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1]">
              {t.newsGrid.title}
            </h2>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => navigate('/resources')}
              className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
            >
              {t.newsGrid.allArticles}
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* Grille d'articles */}
        {isError || (!isLoading && articles.length === 0) ? (
          <p className="text-center text-slate-400 text-sm py-12">
            {isError ? t.newsGrid.loadError : t.newsGrid.emptyArticles}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {isLoading
              ? Array.from({ length: HOME_ARTICLES }, (_, i) => <SkeletonCard key={i} />)
              : articles.map((item, index) => (
                  <ArticleCard
                    key={item.id}
                    item={item}
                    index={index}
                    t={t}
                    currentLang={currentLang}
                    delay={index * 120}
                    visible={visible}
                  />
                ))}
          </div>
        )}

      </div>
    </section>
  )
}
