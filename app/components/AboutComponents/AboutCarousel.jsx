import { useEffect, useState } from 'react'
import c1 from '../../assets/c1.png'
import c2 from '../../assets/c2.png'
import c3 from '../../assets/c3.png'

export default function AboutCarousel() {
  const images = [c1, c2, c3]
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length)
    }, 5000) // change every 5s
    return () => clearInterval(interval)
  }, [images.length])

  return (
    <section className="w-full bg-white py-24 px-8 sm:px-16 lg:px-24 xl:px-32 border-b border-slate-100">
      <div className="relative w-full max-w-5xl mx-auto">
        <div className="overflow-hidden rounded-[2rem] shadow-sm border border-slate-100 aspect-[16/9] relative bg-slate-50">
          {images.map((img, idx) => (
            <img
              key={img}
              src={img}
              alt={`Slide ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
                idx === current ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            />
          ))}
        </div>
        
        {/* Dots navigation */}
        <div className="flex justify-center mt-6 gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                idx === current ? 'bg-[#ffde58] w-8' : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
