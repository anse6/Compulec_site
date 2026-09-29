import React from "react";
import { useAdminTheme } from "../AdminThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined, ExportOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
} from "@ant-design/icons";
import { Card, Button, Descriptions, Tag, Popconfirm, Skeleton, message, Empty } from "antd";
import { StatusTag, VisibilityToggle } from "./AdminProjects";
import { useGetProjetByIdQuery, useDeleteProjetMutation } from "../../../services/api/projetApi";

const BASE_IMG = "http://localhost:8080/api";

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  // Si le chemin commence par /api/uploads/, on retire /api car BASE_IMG l'ajoute déjà
  const cleanPath = img.startsWith("/api/") ? img.slice(4) : img;
  return `${BASE_IMG}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

export default function ProjectDetails() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const navigate  = useNavigate();
  const { id }    = useParams();

  const { data, isLoading, isError, refetch } = useGetProjetByIdQuery(id, { skip: !id });
  const [deleteProjet, { isLoading: deleting }] = useDeleteProjetMutation();

  const project = data?.data ?? null;

  const handleDelete = async () => {
    try {
      const result = await deleteProjet(id).unwrap();
      message.success(result.message || "Projet supprimé avec succès.");
      navigate("/admin/projects");
    } catch (err) {
      message.error(err?.data?.message || "Erreur lors de la suppression.");
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ paddingBottom: 60, fontFamily: "'Poppins', sans-serif" }}>
        <Skeleton.Image active style={{ width: "100%", height: 320, borderRadius: 16, marginBottom: 24 }} />
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  // ── Error / Not found ────────────────────────────────────────────────────────
  if (isError || !project) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "'Poppins', sans-serif" }}>
        <Empty description="Projet introuvable ou erreur de chargement." />
        <Button onClick={() => refetch()} icon={<ReloadOutlined />} style={{ marginTop: 16, marginRight: 8 }}>
          Réessayer
        </Button>
        <Button onClick={() => navigate("/admin/projects")} icon={<ArrowLeftOutlined />} style={{ marginTop: 16 }}>
          Retour aux projets
        </Button>
      </div>
    );
  }

  const coverImg    = getImageUrl(project.images?.[0]);
  const galleryImgs = (project.images || []).slice(1).map(getImageUrl).filter(Boolean);

  return (
    <div style={{ paddingBottom: 60, fontFamily: "'Poppins', sans-serif", width: "100%" }}>
      {/* Top Bar */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/projects")}
        style={{ padding: 0, color: primary, fontWeight: 600, marginBottom: 24 }}
      >
        Back to Projects
      </Button>

      {/* Cover Image */}
      {coverImg && (
        <div style={{ width: "100%", height: 320, borderRadius: 16, overflow: "hidden", marginBottom: 24, border: `1px solid ${border}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <img src={coverImg} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      {/* Header Info Box */}
      <div style={{ backgroundColor: bgCard, border: `1px solid ${border}`, borderRadius: 16, padding: 32, marginBottom: 32, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <VisibilityToggle projetId={project.id} publie={project.publie} />
          <div style={{ display: "flex", gap: 12 }}>
            <Button icon={<ExportOutlined />} style={{ fontWeight: 600 }}>Preview</Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/projects/edit/${id}`)}
              style={{ background: "#FDE047", borderColor: "#FDE047", color: "#713F12", fontWeight: 600 }}
            >
              Edit Project
            </Button>
            <Popconfirm
              title="Supprimer ce projet ?"
              description="Cette action est irréversible."
              okText="Supprimer"
              cancelText="Annuler"
              okButtonProps={{ danger: true, loading: deleting }}
              onConfirm={handleDelete}
            >
              <Button danger icon={<DeleteOutlined />} style={{ fontWeight: 600 }}>
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>

        <h1 style={{ fontWeight: 800, fontSize: 28, color: primary, marginBottom: 8, lineHeight: 1.3 }}>
          {project.titre}
        </h1>
        <p style={{ fontSize: 15, color: textSub, margin: 0, maxWidth: 800, lineHeight: 1.75 }}>
          {project.sousTitre}
        </p>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {project.overview && (
            <Card title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Project Overview</span>} style={{ borderRadius: 16, border: `1px solid ${border}` }}>
              <p style={{ fontSize: 14, color: textSub, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{project.overview}</p>
            </Card>
          )}

          {project.contexte && (
            <Card title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Context</span>} style={{ borderRadius: 16, border: `1px solid ${border}` }}>
              <p style={{ fontSize: 14, color: textSub, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{project.contexte}</p>
            </Card>
          )}

          {project.solution && (
            <Card title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Solution Implemented</span>} style={{ borderRadius: 16, border: `1px solid ${border}` }}>
              <p style={{ fontSize: 14, color: textSub, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{project.solution}</p>
            </Card>
          )}

          {project.resultat && (
            <Card title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Result</span>} style={{ borderRadius: 16, border: `1px solid ${border}` }}>
              <p style={{ fontSize: 14, color: textSub, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>{project.resultat}</p>
            </Card>
          )}

          {galleryImgs.length > 0 && (
            <Card
              title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Project Gallery</span>}
              extra={<span style={{ fontSize: 12, color: textSub }}>Click to open</span>}
              style={{ borderRadius: 16, border: `1px solid ${border}` }}
            >
              <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
                {galleryImgs.map((img, idx) => (
                  <a key={idx} href={img} target="_blank" rel="noreferrer">
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      style={{ width: 220, height: 140, objectFit: "cover", borderRadius: 12, border: `1px solid ${border}`, cursor: "pointer", transition: "opacity 0.2s" }}
                      onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
                      onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                    />
                  </a>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 24 }}>
          <Card
            title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Supporting Information</span>}
            style={{ borderRadius: 16, border: `1px solid ${border}` }}
            styles={{ body: { padding: 0 } }}
          >
            <Descriptions
              column={1}
              bordered
              size="middle"
              labelStyle={{ fontWeight: 600, color: textSub, fontSize: 13, width: 110, background: bgCard }}
              contentStyle={{ fontSize: 13, color: primary, fontWeight: 600 }}
            >
              <Descriptions.Item label="Category">{project.categorie || "—"}</Descriptions.Item>
              <Descriptions.Item label="Service">{project.service || "—"}</Descriptions.Item>
              <Descriptions.Item label="Client">{project.clientName || "—"}</Descriptions.Item>
              <Descriptions.Item label="Sector">{project.secteur || "—"}</Descriptions.Item>
              <Descriptions.Item label="Location">{project.localisation || "—"}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusTag status={project.status || "Planned"} />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {project.besoins?.length > 0 && (
            <Card title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>The Need</span>} style={{ borderRadius: 16, border: `1px solid ${border}` }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {project.besoins.map((need, idx) => (
                  <Tag key={idx} color="blue" style={{ borderRadius: 6, padding: "4px 12px", fontSize: 13, fontWeight: 500 }}>
                    {need}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {project.technologies?.length > 0 && (
            <Card title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Technology Used</span>} style={{ borderRadius: 16, border: `1px solid ${border}` }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {project.technologies.map((tech, idx) => (
                  <Tag key={idx} style={{ borderRadius: 6, padding: "4px 12px", fontSize: 13, fontWeight: 500, backgroundColor: bgCard, borderColor: border, color: textSub }}>
                    {tech}
                  </Tag>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
