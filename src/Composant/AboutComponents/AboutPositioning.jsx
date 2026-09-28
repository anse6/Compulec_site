import { useEffect, useRef, useState } from 'react'
import t1 from '../../assets/t1.png'

export default function AboutPositioning({ t }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section 
      ref={ref}
      className="w-full bg-slate-50 py-24 px-8 sm:px-16 lg:px-24 xl:px-32 border-b border-slate-100"
    >
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center transition-all duration-1000 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        
        {/* Left Column: Image t1 */}
        <div className="rounded-[2rem] overflow-hidden shadow-sm relative group aspect-[4/3] sm:aspect-[16/11]">
          <img 
            src={t1} 
            alt="Compulec Technology Positioning" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        {/* Right Column: Text Content */}
        <div className="flex flex-col justify-center">
          <h2 className="text-4xl sm:text-5xl font-black text-[#023b6a] mb-8 leading-[1.1]">
            {t.aboutPage.positioningTitle}
          </h2>

          <div className="space-y-6 text-slate-600 text-base leading-relaxed">
            <p>{t.aboutPage.positioningP1}</p>
            <p>{t.aboutPage.positioningP2}</p>
            
            <div className="py-2">
              <p className="font-bold text-slate-900 mb-3">{t.aboutPage.positioningP3}</p>
              
              {/* Styled Principles Chain */}
              <div className="flex flex-wrap items-center gap-y-3 gap-x-2 text-xs sm:text-sm font-bold text-[#023b6a]  p-4 rounded-2xl">
                {t.aboutPage.positioningPrinciples.split(' → ').map((principle, index, arr) => (
                  <div key={principle} className="flex items-center gap-2">
                      {principle}
                    {index < arr.length - 1 && (
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <p>{t.aboutPage.positioningP4}</p>
          </div>
        </div>

      </div>
    </section>
  )
}
