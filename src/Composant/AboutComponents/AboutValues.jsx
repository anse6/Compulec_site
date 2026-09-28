import { useEffect, useRef, useState } from 'react'

// Icônes SVG custom de haute qualité (stables, aucun risque d'export manquant)
const MedalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3 6 6 1-4.5 4.5 1.5 6.5-6-3-6 3 1.5-6.5L2 9l6-1 3-6z" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

const ScalesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="5" y1="7" x2="19" y2="7" />
    <path d="M5 7L2 14h6L5 7z" />
    <path d="M19 7l-3 7h6l-3-7z" />
  </svg>
)

const HeadsetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
)

const BulbIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5.5 5.5 0 0 0 7.5 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
  </svg>
)

const ClipboardCheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M9 14l2 2 4-4" />
  </svg>
)

// Mappage des icônes selon la clé de la valeur
const getValueIcon = (id) => {
  switch (id) {
    case 'expertise': return MedalIcon
    case 'reliability': return ShieldIcon
    case 'integrity': return ScalesIcon
    case 'support': return HeadsetIcon
    case 'innovation': return BulbIcon
    case 'accountable': return ClipboardCheckIcon
    default: return BulbIcon
  }
}

const ValueCard = ({ item, icon: Icon, delay, visible }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col h-full transform ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDuration: '600ms', transitionDelay: `${delay}ms` }}
    >
      <div className="text-2xl text-amber-400 mb-4 flex items-center justify-start">
        <Icon />
      </div>
      <h4 className="text-lg font-bold text-[#023B6A] mb-3">
        {item.title}
      </h4>
      <p className="text-slate-500 text-sm leading-relaxed">
        {item.desc}
      </p>
    </div>
  )
}

export default function AboutValues({ t }) {
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
    <div id="values" ref={sectionRef} className="w-full px-8 sm:px-16 lg:px-24 xl:px-32 py-24 bg-white">
      {/* Section Header */}
      <div className={`max-w-3xl mb-16 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <span className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-4 block">
          {t.aboutPage.valuesTagline}
        </span>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1]">
          {t.aboutPage.valuesTitle}
        </h2>
      </div>

      {/* 6 Blocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {t.aboutPage.values.map((item, index) => (
          <ValueCard
            key={item.id}
            item={item}
            icon={getValueIcon(item.id)}
            delay={index * 100}
            visible={visible}
          />
        ))}
      </div>
    </div>
  )
}
