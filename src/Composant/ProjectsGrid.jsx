import { useEffect, useRef, useState } from 'react'
import { ArrowRightIcon } from '../assets/Compulecicons'
import r1 from '../assets/r1.png'
import r2 from '../assets/r2.png'
import r3 from '../assets/r3.png'

const imageMap = { r1, r2, r3 }

// Composant carte réutilisable
const ProjectCard = ({ item, t, delay, visible }) => {
  const imgSrc = imageMap[item.image]

  return (
    <div
      className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms`, transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease` }}
    >
      {/* Image */}
      <div className="w-full h-52 overflow-hidden flex-shrink-0">
        <img
          src={imgSrc}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Contenu */}
      <div className="p-7 flex flex-col flex-grow">
        {/* Double tag */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-xs font-black tracking-[0.18em] text-slate-800 uppercase">
            {item.mainTag}
          </span>
          <span className="text-xs text-slate-400 italic">
            {item.subTag}
          </span>
        </div>

        {/* Titre */}
        <h3 className="text-[1.15rem] font-bold text-blue-900 leading-snug mb-4 group-hover:text-blue-700 transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed flex-grow">
          {item.desc}
        </p>

        {/* Lien View case study */}
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-amber-500 transition-colors">
          {t.projectsGrid.viewCase}
          <ArrowRightIcon size={18} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}

export default function ProjectsGrid({ t }) {
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
              {t.projectsGrid.tagline}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1]">
              {t.projectsGrid.title}
            </h2>
          </div>

          <div className="flex-shrink-0">
            <button className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
              {t.projectsGrid.allProjects}
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* Grille de 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {t.projectsGrid.items.map((item, index) => (
            <ProjectCard
              key={item.id}
              item={item}
              t={t}
              delay={index * 120}
              visible={visible}
            />
          ))}
        </div>

      </div>
    </section>
  )
}
