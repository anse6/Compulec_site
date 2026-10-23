import { useEffect, useRef, useState } from 'react'

export default function AboutMission({ t }) {
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
    <div ref={sectionRef} id="mission-vision" className="w-full px-8 sm:px-16 lg:px-24 xl:px-32 py-24 bg-slate-50 border-y border-slate-100">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 transition-all duration-1000 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div>
          <h3 className="text-3xl font-black text-slate-900 mb-6">
            {t.aboutPage.missionTitle}
          </h3>
          <p className="text-slate-500 text-base leading-relaxed">
            {t.aboutPage.missionText}
          </p>
        </div>
        
        <div>
          <h3 className="text-3xl font-black text-slate-900 mb-6">
            {t.aboutPage.visionTitle}
          </h3>
          <p className="text-slate-500 text-base leading-relaxed">
            {t.aboutPage.visionText}
          </p>
        </div>
      </div>
    </div>
  )
}
