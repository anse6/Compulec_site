import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon } from "../assets/Compulecicons";

const ServiceCard = ({ item, t, onNavigate }) => {
  return (
    <div
      onClick={() => onNavigate("services")}
      className="snap-start flex-shrink-0 basis-[85%] sm:basis-[46%] lg:basis-[calc((100%-3rem)/3)] group bg-white rounded-2xl p-7 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.02)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col h-[280px] cursor-pointer"
    >
      <div className="text-[0.65rem] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">
        {item.tag}
      </div>
      <h3 className="text-lg font-bold text-[#023B6A] mb-3 group-hover:text-amber-500 transition-colors line-clamp-2">
        {item.title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed flex-grow line-clamp-3">
        {item.desc}
      </p>

      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#023B6A] group-hover:text-amber-500 transition-colors">
        {t.servicesGrid.view}
        <ArrowRightIcon
          size={18}
          className="transform group-hover:translate-x-1 transition-transform"
        />
      </div>
    </div>
  );
};

export default function ServicesGrid({ t, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const progress = scrollLeft / (scrollWidth - clientWidth);
    setScrollProgress(progress || 0);
  };

  // avance/recule d'exactement une carte (largeur réelle + gap), au lieu d'un montant arbitraire
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const firstCard = scrollRef.current.querySelector(".snap-start");
    const gap = 24; // correspond à gap-6
    const amount = firstCard ? firstCard.offsetWidth + gap : 350;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-slate-50 relative overflow-hidden"
    >
      <div className="w-full px-8 sm:px-16 lg:px-24 xl:px-32">
        {/* Header Section */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 transition-[transform,opacity] duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="max-w-3xl">
            <div className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-4">
              {t.servicesGrid.tagline}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-[#023B6A] leading-[1.1] mb-4">
              {t.servicesGrid.title}
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed max-w-2xl">
              {t.servicesGrid.subtitle}
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => onNavigate("services")}
              className="group flex items-center gap-2 px-6 py-2.5 bg-transparent border border-[#023B6A]/20 rounded-lg font-bold text-sm text-[#023B6A] hover:bg-[#023B6A] hover:text-white transition-all cursor-pointer"
            >
              {t.servicesGrid.allServices}
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* Carousel Section */}
        <div
          className={`transition-[transform,opacity] duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <style>{`
            .hide-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scroll"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {t.servicesGrid.items.slice(0, 7).map((item) => (
              <ServiceCard
                key={item.id}
                item={item}
                t={t}
                onNavigate={onNavigate}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8">
            {/* Custom Pagination Dashes */}
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4].map((idx) => {
                const isActive = Math.abs(scrollProgress * 4 - idx) < 0.5;
                return (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${isActive ? "w-8 bg-[#023B6A]" : "w-4 bg-slate-300"}`}
                  />
                );
              })}
            </div>

            {/* Arrows */}
            <div className="flex gap-3">
              <button
                onClick={() => scroll("left")}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${scrollProgress <= 0.01 ? "bg-slate-400 cursor-not-allowed text-white" : "bg-[#023B6A] hover:bg-amber-500 text-white cursor-pointer"}`}
                disabled={scrollProgress <= 0.01}
              >
                <ArrowRightIcon size={20} className="rotate-180" />
              </button>
              <button
                onClick={() => scroll("right")}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${scrollProgress >= 0.99 ? "bg-slate-400 cursor-not-allowed text-white" : "bg-[#023B6A] hover:bg-amber-500 text-white cursor-pointer"}`}
                disabled={scrollProgress >= 0.99}
              >
                <ArrowRightIcon size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
