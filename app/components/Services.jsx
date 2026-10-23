import { useEffect, useRef, useState } from 'react'
import {
  WifiOutlined,
  SafetyOutlined,
  CameraOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  CheckCircleFilled,
  ArrowRightOutlined,
} from '@ant-design/icons'

const serviceIcons = {
  it: <WifiOutlined />,
  cyber: <SafetyOutlined />,
  surv: <CameraOutlined />,
  soft: <CodeOutlined />,
  energy: <ThunderboltOutlined />,
}

const serviceColors = {
  it: { glow: 'group-hover:shadow-blue-500/20', accent: 'text-blue-400', bg: 'bg-blue-500/10', border: 'group-hover:border-blue-500/40' },
  cyber: { glow: 'group-hover:shadow-amber-400/20', accent: 'text-amber-400', bg: 'bg-amber-400/10', border: 'group-hover:border-amber-400/40' },
  surv: { glow: 'group-hover:shadow-emerald-500/20', accent: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'group-hover:border-emerald-500/40' },
  soft: { glow: 'group-hover:shadow-violet-500/20', accent: 'text-violet-400', bg: 'bg-violet-500/10', border: 'group-hover:border-violet-500/40' },
  energy: { glow: 'group-hover:shadow-orange-500/20', accent: 'text-orange-400', bg: 'bg-orange-500/10', border: 'group-hover:border-orange-500/40' },
}

export default function Services({ t }) {
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
    <section id="services" ref={sectionRef} className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background decorative orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-block text-xs font-bold tracking-[0.2em] text-amber-400 uppercase mb-3">
            {t.nav.services}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            {t.services.title}
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base">
            {t.services.subtitle}
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.services.items.map((service, idx) => {
            const color = serviceColors[service.id]
            return (
              <div
                key={service.id}
                className={`group relative glass-panel rounded-2xl p-7 border border-white/5 ${color.border} hover:shadow-2xl ${color.glow} transition-all duration-400 cursor-pointer
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                {/* Glowing corner accent on hover */}
                <div className={`absolute top-0 right-0 w-24 h-24 ${color.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color.bg} ${color.accent} text-xl mb-5 transition-transform duration-300 group-hover:scale-110`}>
                  {serviceIcons[service.id]}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-slate-400 text-sm leading-relaxed mb-5">
                  {service.desc}
                </p>

                {/* Features list */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircleFilled className={`${color.accent} text-xs flex-shrink-0`} />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Learn more link */}
                <div className={`flex items-center gap-1.5 text-xs font-semibold ${color.accent} group-hover:gap-2.5 transition-all duration-200`}>
                  {t.projects.viewMore} <ArrowRightOutlined />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
