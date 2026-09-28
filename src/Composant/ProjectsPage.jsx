import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PageHeader from "./PageHeader";
import { ArrowRightIcon } from "../assets/Compulecicons";
import {
  useGetProjetsPubliesQuery,
  usePublierProjetMutation,
  useDepublierProjetMutation,
} from "../services/api/projetApi";
import ProjectStatusToggle from "./Admin/Projects/ProjectStatusToggle";
import { StatusTag } from "./Admin/Projects/AdminProjects";
import { selectIsAuthenticated } from "../store/authSlice";

//
// Le backend stocke les images avec /api/ déjà dans le chemin
// ex: "/api/uploads/ecec6725-....png"
// donc l'URL complète = "http://localhost:8080" + "/api/uploads/..."
//
const BASE_HOST = "http://localhost:8080";

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  // Le backend sert les images sur /api/uploads/...
  // Certains chemins viennent sans /api, il faut l'ajouter
  let path = img.startsWith("/") ? img : `/${img}`;
  if (path.startsWith("/uploads/")) {
    path = `/api${path}`;
  }
  return `${BASE_HOST}${path}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

//
// Skeleton
//
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="w-full h-52 bg-slate-200 flex-shrink-0" />
      <div className="p-7 flex flex-col flex-grow gap-3">
        <div className="flex gap-2">
          <div className="h-3 w-24 rounded bg-slate-200" />
          <div className="h-3 w-16 rounded bg-slate-200" />
        </div>
        <div className="h-5 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

//
// Project Card (données réelles)
//
const ProjectCard = ({ item, delay, visible }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [publier] = usePublierProjetMutation();
  const [depublier] = useDepublierProjetMutation();
  const imgSrc = getImageUrl(item.images?.[0]);

  const handleStatusChange = async (nextStatus) => {
    try {
      if (nextStatus === "Completed") {
        await publier(item.id).unwrap();
      } else if (nextStatus === "On Hold") {
        await depublier(item.id).unwrap();
      }
    } catch (err) {
      console.error("Erreur changement statut projet:", err);
    }
  };

  return (
    <div
      onClick={() => navigate(`/projects/${item.id}`)}
      className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col cursor-pointer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* Image */}
      <div className="w-full h-52 overflow-hidden flex-shrink-0 bg-slate-100">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.titre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-7 flex flex-col flex-grow">
        {/* Catégorie + service */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          {item.categorie && (
            <span className="text-xs font-black tracking-[0.18em] text-slate-800 uppercase">
              {item.categorie}
            </span>
          )}
          {item.service && (
            <span className="text-xs text-slate-400 italic line-clamp-1">
              {item.service}
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 className="text-[1.15rem] font-bold text-[#023B6A] leading-snug mb-4 group-hover:text-[#023B6A] transition-colors line-clamp-2">
          {item.titre}
        </h3>

        {/* Overview */}
        <p className="text-slate-500 text-sm leading-relaxed flex-grow line-clamp-3">
          {item.overview}
        </p>

        {/* Métadonnées + Statut */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400 items-center">
          {item.clientName && <span> {item.clientName}</span>}
          {item.localisation && <span> {item.localisation}</span>}
          {/* Toggle statut : interactif pour admin, badge simple pour visiteur */}
          {item.status &&
            (isAuthenticated ? (
              <div onClick={(e) => e.stopPropagation()}>
                <ProjectStatusToggle
                  initialStatus={item.status}
                  onChange={handleStatusChange}
                />
              </div>
            ) : (
              <StatusTag status={item.status} />
            ))}
        </div>

        {/* Lien */}
        <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-700 group-hover:text-amber-500 transition-colors">
          Voir l'étude de cas
          <ArrowRightIcon
            size={18}
            className="transform group-hover:translate-x-1 transition-transform"
          />
        </div>
      </div>
    </div>
  );
};

//
// Page principale
//
export default function ProjectsPage({ t, onNavigate }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  //  API
  const { data, isLoading, isError } = useGetProjetsPubliesQuery({
    page: 0,
    size: 50,
  });
  const projects = data?.data?.content ?? [];

  //  Animation d'entrée
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

  const content = t?.projectsPage || {};

  // Catégories dynamiques extraites des données réelles
  const categories = [
    "all",
    ...new Set(projects.map((p) => p.categorie).filter(Boolean)),
  ];

  const filtered =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.categorie === activeFilter);

  return (
    <div className="w-full bg-slate-50 min-h-screen font-['Outfit',sans-serif]">
      <PageHeader
        tagline={content.headerTagline || "PROJETS"}
        title={content.headerTitle || "Nos réalisations"}
        subtitle={content.headerSubtitle || "Découvrez nos projets récents."}
      />

      <section
        ref={sectionRef}
        className="py-16 px-8 sm:px-16 lg:px-24 xl:px-32 bg-white"
      >
        <div className="max-w-screen-xl mx-auto">
          {/* Filtres par catégorie — uniquement si on a des données */}
          {!isLoading && !isError && categories.length > 1 && (
            <div className="flex flex-wrap gap-3 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer ${
                    activeFilter === cat
                      ? "bg-[#023B6A] text-white border-[#023B6A]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-[#023B6A] hover:text-[#023B6A]"
                  }`}
                >
                  {cat === "all" ? content.filters?.all || "Tous" : cat}
                </button>
              ))}
            </div>
          )}

          {/* Chargement */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Erreur */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-semibold">
                Impossible de charger les projets.
              </p>
            </div>
          )}

          {/* Vide */}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-lg font-semibold">
                Aucun projet disponible pour cette catégorie.
              </p>
            </div>
          )}

          {/* Grille */}
          {!isLoading && !isError && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {filtered.map((item, index) => (
                <ProjectCard
                  key={item.id}
                  item={item}
                  delay={index * 120}
                  visible={visible}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
