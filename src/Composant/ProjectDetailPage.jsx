import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import PageHeader from "./PageHeader";
import {
  useGetProjetByIdQuery,
  useGetProjetsPubliesQuery,
  usePublierProjetMutation,
  useDepublierProjetMutation,
} from "../services/api/projetApi";
import ProjectStatusToggle from "./Admin/Projects/ProjectStatusToggle";
import { StatusTag } from "./Admin/Projects/AdminProjects";
import { selectIsAuthenticated } from "../store/authSlice";

//
// Images : le backend stocke "/api/uploads/..." → URL complète = HOST + path
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

// Checkmark icon
const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 8.5L6.5 12L13 5"
      stroke="#D4A017"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

//
// Skeleton pleine page
//
function SkeletonDetail() {
  return (
    <div className="w-full bg-white min-h-screen animate-pulse font-['Outfit',sans-serif]">
      <div className="w-full bg-[#023B6A] py-24 px-8">
        <div className="max-w-screen-xl mx-auto space-y-4">
          <div className="h-3 w-24 rounded bg-white/30" />
          <div className="h-8 w-3/4 rounded bg-white/30" />
        </div>
      </div>
      <section className="py-12 px-8 sm:px-16 lg:px-24 xl:px-32">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-12">
          <div className="flex-1 h-96 rounded-2xl bg-slate-200" />
          <div className="w-full lg:w-80 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-8 rounded bg-slate-200" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

//
// Ligne d'info (label | valeur)
//
const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0 gap-4">
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <span className="text-sm font-bold text-[#023B6A] text-right leading-snug">
        {value}
      </span>
    </div>
  );
};

//
// Page Détail
//
export default function ProjectDetailPage({ id, t }) {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [publier] = usePublierProjetMutation();
  const [depublier] = useDepublierProjetMutation();

  //  API
  const {
    data: projetData,
    isLoading,
    isError,
  } = useGetProjetByIdQuery(id, { skip: !id });
  const projet = projetData?.data;

  const handleStatusChange = async (nextStatus) => {
    try {
      if (nextStatus === "Completed") await publier(id).unwrap();
      else if (nextStatus === "On Hold") await depublier(id).unwrap();
    } catch (err) {
      console.error("Erreur changement statut:", err);
    }
  };

  // Rendre le texte (split sur \n)
  const renderText = (text = "") =>
    text.split("\n").map((line, i) => (
      <p key={i} className={i > 0 ? "mt-3" : ""}>
        {line}
      </p>
    ));

  //  États
  if (isLoading) return <SkeletonDetail />;

  if (isError || !projet) {
    return (
      <div className="w-full bg-slate-50 min-h-screen flex items-center justify-center font-['Outfit',sans-serif]">
        <div className="text-center">
          <p className="text-slate-500 text-lg mb-4">Project not found.</p>
          <Button
            type="primary"
            onClick={() => navigate("/projects")}
            className="bg-[#023B6A] hover:!bg-[#012a50] px-6 h-11 font-semibold text-sm rounded-lg"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const images = projet.images || [];
  const heroImg = getImageUrl(images[0]);
  // Les images supplémentaires à afficher en bas (si projet a plusieurs images)
  const detailImgs = images.slice(1).map(getImageUrl).filter(Boolean);

  const content = t?.projectsPage || {};

  return (
    <div className="w-full bg-white min-h-screen font-['Outfit',sans-serif]">
      {/* ── PageHeader ── */}
      <PageHeader
        tagline={projet.categorie || "PROJECT"}
        title={projet.titre}
        subtitle={projet.sousTitre}
      />

      {/* 
          Section 1 : Hero image (gauche) + Info table (droite)
       */}
      <section className="w-full bg-white py-12 px-8 sm:px-16 lg:px-24 xl:px-32">
        <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
          {/* ── Image principale ── */}
          <div className="flex-1 min-w-0">
            {heroImg ? (
              <div className="w-full rounded-2xl overflow-hidden shadow-md">
                <img
                  src={heroImg}
                  alt={projet.titre}
                  className="w-full h-auto max-h-[420px] object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-72 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16"
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

          {/* ── Info table + bouton ── */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <InfoRow label="Category" value={projet.categorie} />
              <InfoRow label="Service" value={projet.service} />
              <InfoRow label="Client" value={projet.clientName} />
              <InfoRow label="Sector" value={projet.secteur} />
              <InfoRow label="Location" value={projet.localisation} />
              {projet.status && (
                <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0 gap-4">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">
                    Status
                  </span>
                  {isAuthenticated ? (
                    <ProjectStatusToggle
                      initialStatus={projet.status}
                      onChange={handleStatusChange}
                    />
                  ) : (
                    <StatusTag status={projet.status} />
                  )}
                </div>
              )}
            </div>

            {/* Bouton Start a similar project */}
            <button
              onClick={() => navigate("/consultation")}
              className="mt-5 w-full bg-[#FDE047] hover:bg-[#fbd319] text-[#023B6A] font-bold py-3 px-6 rounded-xl text-sm transition-colors cursor-pointer shadow-sm"
            >
              {content.startSimilar || "Start a similar project"}
            </button>
          </div>
        </div>
      </section>

      {/* 
          Section 2 : Project Overview | Context (2 colonnes, bg-slate-50)
       */}
      <section className="w-full bg-slate-50 py-16 px-8 sm:px-16 lg:px-24 xl:px-32">
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">
          {/* Project Overview */}
          <div>
            <h2 className="text-2xl font-black text-[#023B6A] mb-5">
              Project Overview
            </h2>
            <div className="text-slate-600 text-sm leading-relaxed space-y-3">
              {renderText(projet.overview || "")}
            </div>
          </div>

          {/* Context */}
          {projet.contexte && (
            <div>
              <h2 className="text-2xl font-black text-[#023B6A] mb-5">
                Context
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                {renderText(projet.contexte)}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 
          Section 3 : The Need / Solution / Technologies / Results / Gallery
       */}
      <section className="w-full bg-white py-16 px-8 sm:px-16 lg:px-24 xl:px-32">
        <div className="max-w-screen-xl mx-auto">
          {/* The Need */}
          {projet.besoins?.length > 0 && (
            <>
              <h2 className="text-2xl font-black text-[#023B6A] mb-6">
                The Need
              </h2>
              <ul className="space-y-3">
                {projet.besoins.map((n, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-slate-600 text-sm"
                  >
                    <span className="mt-0.5 flex-shrink-0">
                      <CheckIcon />
                    </span>
                    {n}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Solution Implemented */}
          {projet.solution && (
            <>
              <h2 className="text-2xl font-black text-[#023B6A] mt-12 mb-5">
                Solution Implemented
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed space-y-3">
                {renderText(projet.solution)}
              </div>
            </>
          )}

          {/* Technologies Used */}
          {projet.technologies?.length > 0 && (
            <>
              <h2 className="text-2xl font-black text-[#023B6A] mt-12 mb-6">
                Technologies Used
              </h2>
              <div className="flex flex-wrap gap-3">
                {projet.technologies.map((tech, i) => (
                  <span
                    key={i}
                    className="border border-slate-200 rounded-lg px-5 py-2.5 text-sm text-[#023B6A] font-medium bg-white hover:border-[#023B6A] transition-colors"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Results */}
          {projet.resultat && (
            <>
              <h2 className="text-2xl font-black text-[#023B6A] mt-12 mb-5">
                Results
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed">
                {renderText(projet.resultat)}
              </div>
            </>
          )}

          {/* ── Images supplémentaires (si le projet a plusieurs images) ── */}
          {detailImgs.length > 0 && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {detailImgs.map((src, i) => (
                <div key={i} className="rounded-xl overflow-hidden shadow-md">
                  <img
                    src={src}
                    alt={`Result ${i + 1}`}
                    className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Barre de navigation retour (bas de page) ── */}
      <div className="w-full bg-white border-t border-slate-100 px-8 sm:px-16 lg:px-24 xl:px-32 py-6">
        <div className="max-w-screen-xl mx-auto flex justify-center">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 text-slate-500 hover:!text-[#023B6A] text-sm font-semibold"
          >
            Retour aux projets
          </Button>
        </div>
      </div>
    </div>
  );
}
