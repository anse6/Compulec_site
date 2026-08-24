import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon } from '../assets/Compulecicons'

const ServiceCard = ({ item, t, delay, visible }) => {
  return (
    <div
      className={`group bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-transparent transition-all duration-300 transform flex flex-col h-full cursor-pointer ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-5">
        {item.tag}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-900 transition-colors">
        {item.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed flex-grow">
        {item.desc}
      </p>
      
      <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-amber-500 transition-colors">
        {t.servicesGrid.view}
        <ArrowRightIcon size={18} className="transform group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  )
}

export default function ServicesGrid({ t }) {
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
        
        {/* Header Section */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 transition-[transform,opacity] duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="max-w-3xl">
            <div className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-4">
              {t.servicesGrid.tagline}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] mb-4">
              {t.servicesGrid.title}
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
              {t.servicesGrid.subtitle}
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <button className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
              {t.servicesGrid.allServices}
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {t.servicesGrid.items.map((item, index) => (
            <ServiceCard 
              key={item.id} 
              item={item} 
              t={t}
              delay={index * 100}
              visible={visible}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
