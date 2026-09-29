import React, { useState, useEffect, useRef } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  GlobalOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Card, Button, Descriptions, Tag, Popconfirm, Skeleton, message, Empty } from "antd";
import { VisibilityToggle } from "./AdminNews";
import {
  useGetArticleByIdQuery,
  useDeleteArticleMutation,
} from "../../../services/api/newsApi";
import dayjs from "dayjs";

const BASE_IMG = "http://localhost:8080/api";

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  const cleanPath = img.startsWith("/api/") ? img.slice(4) : img;
  return `${BASE_IMG}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

const formatDate = (d) => (d ? dayjs(d).format("DD MMMM YYYY, HH:mm") : "—");

export default function NewsDetails() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError, refetch } = useGetArticleByIdQuery(id, { skip: !id });
  const [deleteArticle, { isLoading: deleting }] = useDeleteArticleMutation();

  const article = data?.data ?? null;

  const handleDelete = async () => {
    try {
      const result = await deleteArticle(id).unwrap();
      message.success(result.message || "Article supprimé avec succès.");
      navigate("/admin/news");
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
  if (isError || !article) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", fontFamily: "'Poppins', sans-serif" }}>
        <Empty description="Article introuvable ou erreur de chargement." />
        <Button onClick={() => refetch()} icon={<ReloadOutlined />} style={{ marginTop: 16, marginRight: 8 }}>
          Réessayer
        </Button>
        <Button onClick={() => navigate("/admin/news")} icon={<ArrowLeftOutlined />} style={{ marginTop: 16 }}>
          Retour aux articles
        </Button>
      </div>
    );
  }

  const coverImg = getImageUrl(article.imageUrl);

  return (
    <div style={{ paddingBottom: 60, fontFamily: "'Poppins', sans-serif", width: "100%" }}>

      {/* Top Bar */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/news")}
        style={{ padding: 0, color: primary, fontWeight: 600, marginBottom: 24 }}
      >
        Back to News
      </Button>

      {/* Cover Image */}
      {coverImg && (
        <div
          style={{
            width: "100%",
            height: 320,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 24,
            border: `1px solid ${border}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            position: "relative",
          }}
        >
          <img src={coverImg} alt="Cover" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(2,59,106,0.55) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      {/* Header Info Box */}
      <div
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: 32,
          marginBottom: 32,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          {/* Visibility Tag — réutilise le composant existant */}
          <VisibilityToggle articleId={article.id} publie={article.published} />

          <div style={{ display: "flex", gap: 12 }}>
            <Button
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/news/edit/${id}`)}
              style={{ background: "#FDE047", borderColor: "#FDE047", color: "#713F12", fontWeight: 600 }}
            >
              Edit Article
            </Button>
            <Popconfirm
              title="Supprimer cet article ?"
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
          {article.title}
        </h1>
        <p style={{ fontSize: 15, color: textSub, margin: 0, maxWidth: 800, lineHeight: 1.75 }}>
          {article.subtitle}
        </p>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>

        {/* LEFT COLUMN — contenu */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          {article.heading && (
            <Card
              title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Heading</span>}
              style={{ borderRadius: 16, border: `1px solid ${border}` }}
            >
              <p style={{ fontSize: 14, color: textSub, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>
                {article.heading}
              </p>
            </Card>
          )}

          {article.overview && (
            <Card
              title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Overview</span>}
              style={{ borderRadius: 16, border: `1px solid ${border}` }}
            >
              <p style={{ fontSize: 14, color: textSub, lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>
                {article.overview}
              </p>
            </Card>
          )}

        </div>

        {/* RIGHT COLUMN — métadonnées */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 24 }}>
          <Card
            title={<span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>Article Information</span>}
            style={{ borderRadius: 16, border: `1px solid ${border}` }}
            styles={{ body: { padding: 0 } }}
          >
            <Descriptions
              column={1}
              bordered
              size="middle"
              labelStyle={{ fontWeight: 600, color: textSub, fontSize: 13, width: 110, background: "#fafafa" }}
              contentStyle={{ fontSize: 13, color: primary, fontWeight: 600 }}
            >
              <Descriptions.Item label="Status">
                <Tag
                  icon={article.published ? <GlobalOutlined /> : <StopOutlined />}
                  color={article.published ? "success" : "default"}
                  style={{ borderRadius: 999, padding: "2px 10px", fontWeight: 600, fontSize: 11, margin: 0 }}
                >
                  {article.published ? "Published" : "Draft"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID">#{article.id}</Descriptions.Item>
              <Descriptions.Item label="Created">
                {formatDate(article.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Updated">
                {formatDate(article.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

      </div>
    </div>
  );
}
