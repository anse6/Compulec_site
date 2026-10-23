import { useEffect, useRef, useState } from 'react'
import a1 from '../assets/a1.png'
import { QuoteIcon } from '../assets/Compulecicons'

// Composant carte de témoignage réutilisable
const TestimonialCard = ({ item, delay, visible }) => {
  return (
    <div
      className={`bg-white rounded-xl p-8 border border-slate-100 flex flex-col h-full transition-[opacity,transform] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDuration: '600ms', transitionDelay: `${delay}ms` }}
    >
      {/* Icône guillemet SVG custom */}
      <div className="mb-5">
        <QuoteIcon size={35} />
      </div>

      {/* Citation */}
      <p className="text-slate-600 text-sm leading-relaxed flex-grow">
        {item.quote}
      </p>

      {/* Séparateur */}
      <div className="w-full h-px bg-slate-100 my-6" />

      {/* Auteur */}
      <div className="flex items-center gap-4">
        <img
          src={a1}
          alt={item.name}
          className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-slate-100"
        />
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">{item.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{item.role}</p>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials({ t }) {
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
    <section ref={sectionRef} className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="w-full px-8 sm:px-16 lg:px-24 xl:px-32">

          {/* Header */}
          <div
            className={`mb-12 transition-[opacity,transform] duration-700 ${
              visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <div className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-4">
              {t.testimonials.tagline}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] max-w-2xl">
              {t.testimonials.title}
            </h2>
          </div>

          {/* Grille 3 colonnes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {t.testimonials.items.map((item, index) => (
              <TestimonialCard
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
