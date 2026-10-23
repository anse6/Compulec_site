import { useState, useEffect, useRef } from 'react'
import {
  EnvironmentOutlined,
  CheckCircleFilled,
  FilterOutlined,
} from '@ant-design/icons'

const categoryColors = {
  cyber: { label: 'Cybersecurity', labelFR: 'Cybersécurité', bg: 'bg-amber-400/10', text: 'text-amber-400', border: 'border-amber-400/20' },
  energy: { label: 'Energy', labelFR: 'Énergie', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  it: { label: 'IT Infrastructure', labelFR: 'Infrastructure IT', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  surv: { label: 'Surveillance', labelFR: 'Surveillance', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  soft: { label: 'Software', labelFR: 'Logiciels', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
}

export default function Projects({ t, currentLang }) {
  const [activeFilter, setActiveFilter] = useState('all')
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

  const categories = ['all', 'cyber', 'energy', 'it', 'surv', 'soft']
  const filtered = activeFilter === 'all'
    ? t.projects.items
    : t.projects.items.filter(p => p.category === activeFilter)

  return (
    <section id="projects" ref={sectionRef} className="py-24 bg-[#020817] relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="inline-block text-xs font-bold tracking-[0.2em] text-amber-400 uppercase mb-3">
            {t.nav.projects}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            {t.projects.title}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            {t.projects.subtitle}
          </p>
        </div>

        {/* Filter bar */}
        <div
          className={`flex flex-wrap justify-center gap-2 mb-12 transition-all duration-700 delay-100 ${visible ? 'opacity-100' : 'opacity-0'}`}
        >
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-amber-400 text-slate-950 border-amber-400'
                : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            <FilterOutlined /> {t.projects.filterAll}
          </button>
          {categories.slice(1).map(cat => {
            const c = categoryColors[cat]
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                  activeFilter === cat
                    ? `${c.bg} ${c.text} ${c.border}`
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {currentLang === 'EN' ? c.label : c.labelFR}
              </button>
            )
          })}
        </div>

        {/* Projects grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, idx) => {
            const c = categoryColors[project.category]
            return (
              <div
                key={project.id}
                className={`group relative glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 hover:shadow-2xl transition-all duration-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                {/* Color accent top bar */}
                <div className={`h-1 w-full ${c.bg.replace('/10', '/60')} transition-all duration-300 group-hover:h-1.5`} style={{ background: `var(--color-accent-${project.category})` }} />
                
                {/* Top accent bar using inline style */}
                <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.text.replace('text', 'bg')}`} />

                <div className="p-7">
                  {/* Category badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text} border ${c.border} mb-4`}>
                    {currentLang === 'EN' ? c.label : c.labelFR}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-white/90 transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed mb-5">
                    {project.desc}
                  </p>

                  {/* Impact */}
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/3 border border-white/5 mb-5">
                    <CheckCircleFilled className="text-emerald-400 text-xs mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      {project.impact}
                    </p>
                  </div>

                  {/* Location + Status footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <EnvironmentOutlined />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {t.projects.statusDone}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            {currentLang === 'EN' ? 'No projects found for this category.' : 'Aucun projet trouvé pour cette catégorie.'}
          </div>
        )}
      </div>
    </section>
  )
}
