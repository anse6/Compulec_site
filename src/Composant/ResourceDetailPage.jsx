import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
import { Button } from "antd";
import {
  useGetArticleByIdQuery,
  useGetArticlesPubliesQuery,
} from "../services/api/newsApi";

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
// Skeleton pleine page
//
function SkeletonDetail() {
  return (
    <div className="w-full bg-slate-50 min-h-screen animate-pulse">
      {/* Fake header */}
      <div className="w-full bg-[#023B6A] py-24 px-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-3 w-24 rounded bg-white/30" />
          <div className="h-8 w-3/4 rounded bg-white/30" />
          <div className="h-5 w-1/2 rounded bg-white/20" />
        </div>
      </div>
      {/* Fake content */}
      <section className="w-full bg-white py-16 px-8 sm:px-16 lg:px-24 xl:px-32">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="w-full h-80 rounded-2xl bg-slate-200" />
          <div className="h-6 w-3/5 rounded bg-slate-200" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-4 rounded bg-slate-200 ${i === 4 ? "w-2/3" : "w-full"}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

//
// Carte "article connexe" (petite)
//
const RelatedArticleCard = ({ item }) => {
  const navigate = useNavigate();
  const imgSrc = getImageUrl(item.imageUrl);

  return (
    <div
      onClick={() => navigate(`/resources/${item.id}`)}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-[0_2px_16px_-8px_rgba(0,0,0,0.06)] hover:shadow-xl hover:border-transparent transition-all duration-300 flex flex-col cursor-pointer"
    >
      <div className="w-full h-48 overflow-hidden flex-shrink-0 bg-slate-100">
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
              className="h-10 w-10"
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
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {item.subtitle && (
            <span className="text-[11px] font-black tracking-[0.18em] uppercase text-[#023B6A]">
              {item.subtitle}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {formatDate(item.createdAt)}
          </span>
        </div>
        <h3 className="text-[1rem] font-bold text-[#023B6A] leading-snug mb-2 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed flex-grow line-clamp-3">
          {item.overview}
        </p>
      </div>
    </div>
  );
};

//
// Page détail
//
export default function ResourceDetailPage({ id, t }) {
  const navigate = useNavigate();

  // ── Article courant
  const {
    data: articleData,
    isLoading,
    isError,
  } = useGetArticleByIdQuery(id, { skip: !id });
  const article = articleData?.data;

  // ── Articles connexes (publiés)
  const { data: allData } = useGetArticlesPubliesQuery({ page: 0, size: 10 });
  const relatedArticles = (allData?.data?.content ?? [])
    .filter((a) => a.id !== id)
    .slice(0, 3);

  // ── États
  if (isLoading) return <SkeletonDetail />;

  if (isError || !article) {
    return (
      <div className="w-full bg-slate-50 min-h-screen flex items-center justify-center font-['Outfit',sans-serif]">
        <div className="text-center">
          <p className="text-slate-500 text-lg mb-4">Article introuvable.</p>

          {/* Bouton natif → plus de conflit avec Ant Design */}
          <button
            onClick={() => navigate("/resources")}
            style={{ cursor: "pointer" }}
            className="!cursor-pointer bg-[#023B6A] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:bg-[#012a50] transition-colors"
          >
            Retour aux ressources
          </button>
        </div>
      </div>
    );
  }

  const heroImg = getImageUrl(article.imageUrl);

  return (
    <div className="w-full bg-slate-50 min-h-screen font-['Outfit',sans-serif]">
      {/* ── PageHeader ── */}
      <PageHeader
        tagline={article.subtitle}
        title={article.title}
        subtitle={article.overview}
      />

      {/* ── Contenu de l'article ── */}
      <section className="w-full bg-white py-16 px-8 sm:px-16 lg:px-24 xl:px-32">
        <div className="max-w-4xl mx-auto">
          {/* Métadonnées */}
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-800 mb-8 flex-wrap">
            <span> {formatDate(article.createdAt)}</span>
            {article.updatedAt && article.updatedAt !== article.createdAt && (
              <span> Mis à jour le {formatDate(article.updatedAt)}</span>
            )}
          </div>

          {/* Image principale */}
          {heroImg && (
            <div className="w-full rounded-2xl overflow-hidden mb-12 shadow-md">
              <img
                src={heroImg}
                alt={article.title}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </div>
          )}

          {/* Contenu de l'article */}
          <div className="prose prose-slate max-w-none">
            {/* Heading */}
            {article.heading && (
              <h2 className="text-2xl font-bold text-[#023B6A] mb-6">
                {article.heading}
              </h2>
            )}

            {/* Overview / corps */}
            {article.overview && (
              <p className="text-slate-600 leading-relaxed text-base whitespace-pre-line">
                {article.overview}
              </p>
            )}
          </div>

          {/* Bouton retour */}
          <div className="mt-12 pt-8 border-t border-slate-100">
            <button
              onClick={() => navigate("/resources")}
              className="flex items-center gap-2 text-[#023B6A] font-semibold text-sm hover:gap-3 transition-all"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Retour aux ressources
            </button>
          </div>
        </div>
      </section>

      {/* ── Articles connexes ── */}
      {relatedArticles.length > 0 && (
        <section className="w-full bg-slate-50 py-20 px-8 sm:px-16 lg:px-24 xl:px-32">
          <div className="max-w-screen-xl mx-auto">
            <div className="mb-10">
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-800 uppercase mb-2 block">
                À LIRE AUSSI
              </span>
              <h2 className="text-3xl font-black text-[#023B6A]">
                Articles connexes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((item) => (
                <RelatedArticleCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
