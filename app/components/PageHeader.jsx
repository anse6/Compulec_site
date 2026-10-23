export default function PageHeader({ tagline, title, subtitle, children }) {
  return (
<div className="w-full bg-[linear-gradient(112.61deg,_#185486_6.44%,_#123455_23.86%,_#0E2037_65.02%,_#0D1C31_81.45%)] text-white pt-40 pb-24 px-8 sm:px-16 lg:px-24 xl:px-32 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#023B6A]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        <span className="text-xs font-bold tracking-[0.25em] text-[#ffde58] uppercase mb-4 block">
          {tagline}
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] text-white mb-6">
          {title}
        </h1>

        <p className={`text-slate-400 text-lg leading-relaxed max-w-3xl ${children ? 'mb-8' : ''}`}>
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  )
}