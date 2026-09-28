import { useEffect, useRef, useState } from 'react'
import c1 from '../../assets/c1.png'
import c2 from '../../assets/c2.png'
import c3 from '../../assets/c3.png'

export default function AboutMasonry({ t }) {
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
    <div ref={sectionRef} className="w-full px-8 sm:px-16 lg:px-24 xl:px-32 py-24 bg-white">
      {/* Masonry-like Grid layout */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch transition-all duration-1000 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Column 1 */}
        <div className="flex flex-col gap-6 h-full justify-between">
          {/* Established Blue Card */}
          <div className="bg-[#4A8CC3] text-white rounded-3xl p-8 flex flex-col justify-center flex-1 min-h-[220px]">
            <h3 className="text-2xl font-bold mb-4">
              {t.aboutPage.establishedTitle}
            </h3>
            <p className="text-sm text-blue-50/90 leading-relaxed">
              {t.aboutPage.establishedText}
            </p>
          </div>
          
          {/* Image C1 (Woman Laptop) */}
          <div className="rounded-3xl overflow-hidden flex-1 min-h-[220px] shadow-sm relative group">
            <img 
              src={c1} 
              alt="Laptop Office Work" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
            />
          </div>
        </div>
        
        {/* Column 2 - Tall Image C2 (Men Talking) */}
        <div className="rounded-3xl overflow-hidden shadow-sm relative min-h-[460px] md:min-h-full group">
          <img 
            src={c2} 
            alt="Team Discussion" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
          />
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-6 h-full justify-between">
          {/* Image C3 (Meeting Room) */}
          <div className="rounded-3xl overflow-hidden flex-1 min-h-[220px] shadow-sm relative group">
            <img 
              src={c3} 
              alt="Meeting Collaboration" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 absolute inset-0"
            />
          </div>

          {/* Today Yellow Card */}
          <div className="bg-[#ffde58] text-slate-900 rounded-3xl p-8 flex flex-col justify-center flex-1 min-h-[220px]">
            <p className="text-base font-bold leading-relaxed text-[#17253f]">
              {t.aboutPage.todayText}
            </p>
          </div>
        </div>

      </div>

      {/* Bottom Banner */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 mt-24 pt-16 border-t border-slate-100 transition-all duration-1000 delay-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}>
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
            {t.aboutPage.bottomTitle}
          </h2>
        </div>
        <div className="flex items-center">
          <p className="text-slate-500 text-base leading-relaxed">
            {t.aboutPage.bottomText}
          </p>
        </div>
      </div>
    </div>
  )
}
