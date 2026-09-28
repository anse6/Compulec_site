import { useEffect, useRef, useState } from 'react'
import c1 from '../../assets/c1.png'

export default function AboutHeader({ t }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className={`w-full bg-gradient-to-br from-slate-900 to-slate-950 text-white pt-40 pb-24 px-8 sm:px-16 lg:px-24 xl:px-32 relative overflow-hidden ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'} transition-all duration-1000`}>
      {/* Glow effect */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#023B6A]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <span className="text-xs font-bold tracking-[0.25em] text-[#ffde58] uppercase mb-4 block">
          {t.aboutPage.tagline}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-white mb-6">
          {t.aboutPage.title}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
          {t.aboutPage.subtitle}
        </p>
      </div>
    </section>
  )
}
