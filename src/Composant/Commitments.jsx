import { useEffect, useRef, useState } from 'react'
import {
  SafetyCertificateOutlined,
  SafetyOutlined,
  ToolOutlined,
  CustomerServiceOutlined,
  BulbOutlined,
  FolderOpenOutlined
} from '@ant-design/icons'

// Composant bloc réutilisable avec effet Hover Dark Mode
const CommitmentBlock = ({ icon: Icon, title, desc, link, delay, visible }) => {
  return (
    <div
      className={`group relative overflow-hidden bg-white hover:bg-slate-900 rounded-xl p-8 border border-slate-100 hover:border-transparent shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-xl transition-[transform,opacity,box-shadow] duration-500 transform flex flex-col justify-center ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Dégradé de fond subtil activé instantanément au survol */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#023B6A]/30 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-2xl text-amber-400 mb-6">
          <Icon />
        </div>
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-white mb-3">
          {title}
        </h3>
        <p className="text-slate-500 group-hover:text-slate-300 leading-relaxed text-sm flex-grow">
          {desc}
        </p>
        
        {/* Affichage conditionnel du lien s'il existe */}
        {link && (
          <div className="mt-8">
            <a 
              href="#projects" 
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="inline-flex items-center gap-2 text-amber-400 font-semibold text-sm hover:text-amber-300 transition-colors cursor-pointer"
            >
              {link}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Commitments({ t }) {
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

  const items = t.commitments.items
  
  // Mapping des icônes selon l'ID
  const getIcon = (id) => {
    switch (id) {
      case 'expertise': return SafetyCertificateOutlined
      case 'reliability': return SafetyOutlined
      case 'experience': return ToolOutlined
      case 'support': return CustomerServiceOutlined
      case 'innovation': return BulbOutlined
      default: return BulbOutlined
    }
  }

  // Création du 6ème item basé sur l'objet achievements
  const allItems = [
    ...items,
    {
      id: 'achievements',
      title: t.commitments.achievements.title,
      desc: t.commitments.achievements.desc,
      link: t.commitments.achievements.link,
      icon: FolderOpenOutlined
    }
  ]

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="w-full px-8 sm:px-16 lg:px-24 xl:px-32">
        
        {/* Header Section */}
        <div className={`max-w-3xl mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-4">
            {t.commitments.tagline}
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
            {t.commitments.title}
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
            {t.commitments.subtitle}
          </p>
        </div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          
          {/* Les 6 blocs réutilisables avec effet au survol */}
          {allItems.map((item, index) => (
            <CommitmentBlock
              key={item.id}
              icon={item.id === 'achievements' ? item.icon : getIcon(item.id)}
              title={item.title}
              desc={item.desc}
              link={item.link}
              delay={index * 100}
              visible={visible}
            />
          ))}

        </div>
      </div>
    </section>
  )
}
