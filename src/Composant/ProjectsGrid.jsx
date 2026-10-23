import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon } from "../assets/Compulecicons";
import { useGetProjetsPubliesQuery } from "../services/api/projetApi";
import { getMediaUrl, categoryLabel, servicesLabel } from "../services/publicContent";
import r1 from "../assets/r1.png";
import r2 from "../assets/r2.png";
import r3 from "../assets/r3.png";

/** Nombre de projets affichés sur la page d'accueil (les plus récemment publiés). */
const HOME_PROJECTS = 3;

// Visuels de secours pour un projet sans image
const FALLBACK_IMAGES = [r1, r2, r3];

const ProjectCard = ({ item, index, t, currentLang, delay, visible }) => {
  const navigate = useNavigate();
  const imgSrc = getMediaUrl(item.images?.[0]) || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const category = categoryLabel(item.categorie, currentLang);
  const services = servicesLabel(item.service, currentLang);
  const open = () => navigate(`/projects/${item.id}`);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => { if (e.key === "Enter") open(); }}
      className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col cursor-pointer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* Image */}
      <div className="w-full h-52 overflow-hidden flex-shrink-0 bg-slate-100">
        <img
          src={imgSrc}
          alt={item.titre}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Contenu */}
      <div className="p-7 flex flex-col flex-grow">
        {/* Catégorie + services */}
        {(category || services) && (
          <div className="flex items-center gap-2 mb-5 min-w-0">
            {category && (
              <span className="text-xs font-black tracking-[0.18em] text-slate-800 uppercase shrink-0">
                {category}
              </span>
            )}
            {services && (
              <span className="text-xs text-slate-400 italic truncate">{services}</span>
            )}
          </div>
        )}

        {/* Titre */}
        <h3 className="text-[1.15rem] font-bold text-[#023B6A] leading-snug mb-4 line-clamp-2">
          {item.titre}
        </h3>

        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed flex-grow line-clamp-3">
          {item.sousTitre || item.overview}
        </p>

        {/* Lien */}
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-amber-500 transition-colors">
          {t.projectsGrid.viewCase}
          <ArrowRightIcon
            size={18}
            className="transform group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </div>
  );
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="w-full h-52 bg-slate-200 flex-shrink-0" />
      <div className="p-7 flex flex-col flex-grow gap-3">
        <div className="h-3 w-24 rounded bg-slate-200" />
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export default function ProjectsGrid({ t, currentLang, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const { data, isLoading, isError } = useGetProjetsPubliesQuery({ page: 0, size: HOME_PROJECTS });
  const projects = data?.data?.content ?? [];

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
    <section
      ref={sectionRef}
      className="py-24 bg-white relative overflow-hidden"
    >
      <div className="w-full px-8 sm:px-16 lg:px-24 xl:px-32">
        {/* Header */}
        <div
          className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 transition-[transform,opacity] duration-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="max-w-2xl">
            <div className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase mb-4">
              {t.projectsGrid.tagline}
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1]">
              {t.projectsGrid.title}
            </h2>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={() => onNavigate("projects")}
              className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-bold text-sm text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
            >
              {t.projectsGrid.allProjects}
              <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>

        {/* Grille de 3 colonnes */}
        {isError || (!isLoading && projects.length === 0) ? (
          <p className="text-center text-slate-400 text-sm py-12">
            {isError ? t.projectsGrid.loadError : t.projectsGrid.emptyProjects}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {isLoading
              ? Array.from({ length: HOME_PROJECTS }, (_, i) => <SkeletonCard key={i} />)
              : projects.map((item, index) => (
                  <ProjectCard
                    key={item.id}
                    item={item}
                    index={index}
                    t={t}
                    currentLang={currentLang}
                    delay={index * 120}
                    visible={visible}
                  />
                ))}
          </div>
        )}
      </div>
    </section>
  );
}
