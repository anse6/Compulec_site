import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "../../assets/Compulecicons";

export default function ServiceCategoryBlock({
  categoryTitle,
  categoryDesc,
  bannerImage,
  items,
}) {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white py-16 px-8 sm:px-16 lg:px-24 xl:px-32 border-b border-slate-100">
      {/* Category Header & Banner */}
      <div className="w-full mb-12 flex flex-col">
        {/* Gray title badge with dark accent left border */}
        <div className="flex">
          <div className="bg-[#6E7783] text-white px-8 py-3.5 text-xl sm:text-2xl font-black tracking-wide border-l-8 border-[#374151] uppercase">
            {categoryTitle}
          </div>
        </div>

        {/* Banner image */}
        <div
          className={`w-full h-48 sm:h-64 md:h-80 overflow-hidden relative shadow-sm ${categoryDesc ? "mb-6" : ""}`}
        >
          <img
            src={bannerImage}
            alt={categoryTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Optional Category Description */}
        {categoryDesc && (
          <p className="text-slate-500 text-sm leading-relaxed max-w-3xl">
            {categoryDesc}
          </p>
        )}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-slate-200/60 transition-all duration-300 flex flex-col h-full group"
          >
            {/* Tag */}
            <span className="text-[11px] font-extrabold tracking-[0.2em] text-slate-400 uppercase mb-4 block">
              {item.tag}
            </span>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 group-hover:text-[#023B6A] transition-colors">
              {item.title}
            </h3>

            {/* Description */}
            <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">
              {item.desc}
            </p>

            {/* View Link */}
            <button
              onClick={() => item.slug && navigate(`/services/${item.slug}`)}
              className="flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-amber-500 transition-colors cursor-pointer mt-auto bg-transparent border-0 p-0"
            >
              <span>{item.linkText}</span>
              <ArrowRightIcon
                size={16}
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
