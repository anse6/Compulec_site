import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
import { useGetArticlesPubliesQuery } from "../services/api/newsApi";

//
const BASE_IMG = "http://localhost:8080/api";

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  return `${BASE_IMG}${img.startsWith("/") ? img : `/${img}`}`;
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
// Skeleton Card
//
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col animate-pulse">
      <div className="w-full h-56 bg-slate-200 flex-shrink-0" />
      <div className="p-6 flex flex-col flex-grow gap-3">
        <div className="flex gap-3">
          <div className="h-3 w-20 rounded bg-slate-200" />
          <div className="h-3 w-24 rounded bg-slate-200" />
        </div>
        <div className="h-5 w-4/5 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
      </div>
    </div>
  );
}

//
// Article Card (données réelles)
//
const ArticleCard = ({ item, delay, visible }) => {
  const navigate = useNavigate();
  const imgSrc = getImageUrl(item.imageUrl);

  return (
    <div
      onClick={() => navigate(`/resources/${item.id}`)}
      className={`group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_16px_-8px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col cursor-pointer ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, box-shadow 0.3s ease, border-color 0.3s ease`,
      }}
    >
      {/* Image */}
      <div className="w-full h-56 overflow-hidden flex-shrink-0 bg-slate-100">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.title}
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
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Subtitle + Date */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {item.subtitle && (
            <span className="text-[11px] font-black tracking-[0.18em] uppercase text-[#023B6A]">
              {item.subtitle}
            </span>
          )}
          <span className="text-xs text-slate-800">
            {formatDate(item.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-[1.05rem] font-bold text-[#023B6A] leading-snug mb-3 group-hover:text-[#023B6A] transition-colors line-clamp-2">
          {item.title}
        </h3>

        {/* Overview */}
        <p className="text-slate-800 text-sm leading-relaxed flex-grow line-clamp-3">
          {item.overview}
        </p>

        {/* Lire la suite */}
        <div className="mt-4 flex items-center gap-1 text-[#023B6A] text-sm font-semibold group-hover:gap-2 transition-all">
          Lire la suite
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

//
// Page principale
//
export default function ResourcesPage({ t, onNavigate }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  // ── API
  const { data, isLoading, isError } = useGetArticlesPubliesQuery({
    page: 0,
    size: 50,
  });
  const articles = data?.data?.content ?? [];

  // ── Animation d'entrée
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

  const content = t?.resourcesPage || {};

  return (
    <div className="w-full bg-slate-50 min-h-screen font-['Outfit',sans-serif]">
      <PageHeader
        tagline={content.headerTagline}
        title={content.headerTitle}
        subtitle={content.headerSubtitle}
      />

      <section
        ref={sectionRef}
        className="py-16 px-8 sm:px-16 lg:px-24 xl:px-32 bg-white"
      >
        <div className="max-w-screen-xl mx-auto">
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
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-lg font-semibold">
                Impossible de charger les articles.
              </p>
            </div>
          )}

          {/* Vide */}
          {!isLoading && !isError && articles.length === 0 && (
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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <p className="text-lg font-semibold">
                Aucun article publié pour le moment.
              </p>
            </div>
          )}

          {/* Grille */}
          {!isLoading && !isError && articles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
              {articles.map((item, index) => (
                <ArticleCard
                  key={item.id}
                  item={item}
                  delay={index * 120}
                  visible={visible}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
