import { useEffect, useRef, useState } from "react";

const ExpertiseIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const NeedsIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const SupportIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6M23 11h-6" />
  </svg>
);

const CapabilitiesIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const ReliabilityIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ScalableIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const getFactorIcon = (id) => {
  switch (id) {
    case "expertise":
      return ExpertiseIcon;
    case "needs":
      return NeedsIcon;
    case "support":
      return SupportIcon;
    case "capabilities":
      return CapabilitiesIcon;
    case "reliability":
      return ReliabilityIcon;
    case "scalable":
      return ScalableIcon;
    default:
      return ExpertiseIcon;
  }
};

const FactorCard = ({ item, icon: Icon, delay, visible }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 flex flex-col h-full transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDuration: "600ms", transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#023b6a] mb-6 border border-slate-100/50">
        <Icon />
      </div>
      <h4 className="text-lg font-bold text-[#023B6A] mb-3">{item.title}</h4>
      <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
    </div>
  );
};

export default function AboutFactors({ t }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full px-8 sm:px-16 lg:px-24 xl:px-32 py-24 bg-white border-b border-slate-100"
    >
      {/* Section Header */}
      <div
        className={`max-w-3xl mb-16 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* <span className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-4 block">
          COMPULEC SARL
        </span> */}
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1]">
          {t.aboutPage.factorsTitle}
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {t.aboutPage.factors.map((item, index) => (
          <FactorCard
            key={item.id}
            item={item}
            icon={getFactorIcon(item.id)}
            delay={index * 100}
            visible={visible}
          />
        ))}
      </div>
    </div>
  );
}
