import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon } from '../assets/Compulecicons'
import b1 from '../assets/b1.png'
import b2 from '../assets/b2.png'
import b3 from '../assets/b3.png'

const imageMap = { b1, b2, b3 }

const ArticleCard = ({ item, delay, visible }) => {
  const imgSrc = imageMap[item.image]

  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col h-full ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDuration: '600ms', transitionDelay: `${delay}ms` }}
    >
      {/* Image avec effet zoom au hover */}
      <div className="w-full h-52 overflow-hidden flex-shrink-0 relative">
        <img
          src={imgSrc}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Contenu */}
      <div className="p-7 flex flex-col flex-grow">
        {/* Meta Infos */}
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4 font-semibold">
          <span className="text-amber-500 font-extrabold tracking-wider">{item.category}</span>
          <span className="text-slate-300">•</span>
          <span>{item.date}</span>
          <span className="text-slate-300">•</span>
          <span>{item.readTime}</span>
        </div>

        {/* Titre */}
        <h3 className="text-lg font-bold text-[#023B6A] leading-snug mb-3 group-hover:text-[#023B6A] transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed flex-grow">
          {item.desc}
        </p>
      </div>
    </div>
  )
}

export default function NewsGrid({ t }) {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)

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
            <button className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
              {t.newsGrid.allArticles}
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* Grille d'articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {t.newsGrid.items.map((item, index) => (
            <ArticleCard
              key={item.id}
              item={item}
              delay={index * 120}
              visible={visible}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
