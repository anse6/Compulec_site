import { ArrowRightIcon } from '../../assets/Compulecicons'
import r1 from '../../assets/r1.png'
import r2 from '../../assets/r2.png'
import r3 from '../../assets/r3.png'
import e1 from '../../assets/e1.png'
import e2 from '../../assets/e2.png'
import e3 from '../../assets/e3.png'
import rect5 from '../../assets/rect5.png'
import g1 from '../../assets/g1.png'
import g2 from '../../assets/g2.png'
import g3 from '../../assets/g3.png'
import g4 from '../../assets/g4.png'
import g5 from '../../assets/g5.png'
import g6 from '../../assets/g6.png'
import z1 from '../../assets/z1.png'
import z2 from '../../assets/z2.png'
import m1 from '../../assets/m1.png'
import n1 from '../../assets/n1.png'
import n2 from '../../assets/n2.png'

import software4 from '../../assets/software4.png'

const imageMap = { r1, r2, r3, e1, e2, e3, rect5, g1, g2, g3, g4, g5, g6, z1, z2, m1, n1, n2, software4 }

export default function RelatedProjects({ title, tagline, projects, viewCaseText }) {
  if (!projects || projects.length === 0) return null

  return (
    <div className="w-full bg-[#f8fafc] py-20 px-8 sm:px-16 lg:px-24 xl:px-32 border-t border-slate-100">
      <div className="w-full">
        {/* Section Header */}
        <div className="mb-12">
          <span className="text-[11px] font-extrabold tracking-[0.25em] text-[#023B6A] uppercase mb-3 block">
            {tagline || 'RELATED WORK'}
          </span>
          <h2 className="text-3xl font-black text-slate-900">
            {title || 'Projects using this service'}
          </h2>
        </div>

        {/* Projects Grid (matching layout and style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const imgSrc = imageMap[project.image] || e1
            return (
              <div
                key={index}
                className="group bg-white rounded-xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="w-full h-52 overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={imgSrc}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-7 flex flex-col flex-grow">
                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-[10px] font-black tracking-[0.15em] text-slate-800 uppercase">
                      {project.mainTag}
                    </span>
                    <span className="text-[10px] text-slate-400 italic">
                      {project.subTag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-[#023B6A] transition-colors">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-xs leading-relaxed flex-grow">
                    {project.desc}
                  </p>

                  {/* View Link */}
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-amber-500 transition-colors">
                    <span>{viewCaseText || 'View case study'}</span>
                    <ArrowRightIcon size={14} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
