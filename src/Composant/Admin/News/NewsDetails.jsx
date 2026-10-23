import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import {
  Card,
  Button,
  Descriptions,
  Tag,
  Popconfirm,
  Skeleton,
  message,
  Empty,
} from "antd";
import { VisibilityToggle } from "./AdminNews";
import {
  useGetArticleByIdQuery,
  useDeleteArticleMutation,
} from "../../../services/api/newsApi";
import { BASE_IMG } from "../../../config";
import { formatNewsDate } from "./newsFormat";

function getImageUrl(img) {
  if (!img) return null;
  if (img.startsWith("http")) return img;
  const cleanPath = img.startsWith("/api/") ? img.slice(4) : img;
  return `${BASE_IMG}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

function useBreakpoint() {
  const getState = () => {
    const w = typeof window !== "undefined" ? window.innerWidth : 1280;
    return {
      isMobile: w < 768,
      isTablet: w >= 768 && w < 1024,
      isDesktop: w >= 1024,
    };
  };

  const [bp, setBp] = useState(getState);

  useEffect(() => {
    const onResize = () => setBp(getState());
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return bp;
}

export default function NewsDetails() {
  const isDark = useAdminTheme();
  const { t, i18n } = useTranslation();
  const formatDate = (d) => formatNewsDate(d, i18n.language, true);
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  // Valeurs adaptatives
  const coverHeight = isMobile ? 200 : isTablet ? 260 : 320;
  const headerPadding = isMobile ? 16 : isTablet ? 24 : 32;
  const titleSize = isMobile ? 22 : isTablet ? 25 : 28;
  const subtitleSize = isMobile ? 14 : 15;
  const sectionGap = isMobile ? 16 : 24;
  const radius = isMobile ? 12 : 16;

  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading, isError, refetch } = useGetArticleByIdQuery(id, {
    skip: !id,
  });
  const [deleteArticle, { isLoading: deleting }] = useDeleteArticleMutation();

  const article = data?.data ?? null;

  const handleDelete = async () => {
    try {
      await deleteArticle(id).unwrap();
      message.success(t("admin.news.deletedOk"));
      navigate("/admin/news");
    } catch {
      message.error(t("admin.news.deleteError"));
    }
  };

  //  Loading
  if (isLoading) {
    return (
      <div
        style={{
          paddingBottom: 60,
          fontFamily: "'Poppins', sans-serif",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Skeleton.Image
          active
          style={{
            width: "100%",
            height: coverHeight,
            borderRadius: radius,
            marginBottom: 24,
          }}
        />
        <Skeleton active paragraph={{ rows: isMobile ? 5 : 8 }} />
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: isMobile ? "48px 16px" : "80px 0",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <Empty description={t("admin.news.notFound")} />
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "center",
            gap: 8,
            marginTop: 16,
          }}
        >
          <Button
            onClick={() => refetch()}
            icon={<ReloadOutlined />}
            block={isMobile}
          >
            {t("admin.news.retry")}
          </Button>
          <Button
            onClick={() => navigate("/admin/news")}
            icon={<ArrowLeftOutlined />}
            block={isMobile}
          >
            {t("admin.news.backToNews")}
          </Button>
        </div>
      </div>
    );
  }

  const coverImg = getImageUrl(article.imageUrl);

  return (
    <div
      style={{
        paddingBottom: isMobile ? 32 : 60,
        fontFamily: "'Poppins', sans-serif",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      {/* Top Bar */}
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/admin/news")}
        style={{
          padding: 0,
          color: primary,
          fontWeight: 600,
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        {t("admin.news.backToNews")}
      </Button>

      {/* Cover Image */}
      {coverImg && (
        <div
          style={{
            width: "100%",
            height: coverHeight,
            borderRadius: radius,
            overflow: "hidden",
            marginBottom: isMobile ? 16 : 24,
            border: `1px solid ${border}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            position: "relative",
          }}
        >
          <img
            src={coverImg}
            alt={t("admin.news.coverImage")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(2,59,106,0.55) 0%, transparent 60%)",
            }}
          />
        </div>
      )}

      {/* Header Info Box */}
      <div
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${border}`,
          borderRadius: radius,
          padding: headerPadding,
          marginBottom: isMobile ? 20 : 32,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "flex-start",
            gap: isMobile ? 12 : 16,
            marginBottom: 16,
          }}
        >
          {/* Visibility Tag — réutilise le composant existant */}
          <div>
            <VisibilityToggle
              articleId={article.id}
              publie={article.published}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              flexWrap: "wrap",
              gap: isMobile ? 8 : 12,
            }}
          >
            <Button
              icon={<EditOutlined />}
              block={isMobile}
              onClick={() => navigate(`/admin/news/edit/${id}`)}
              style={{
                background: "#FDE047",
                borderColor: "#FDE047",
                color: "#713F12",
                fontWeight: 600,
              }}
            >
              {t("admin.news.editArticle")}
            </Button>
            <Popconfirm
              title={t("admin.news.deleteConfirm")}
              description={t("admin.news.deleteIrreversible")}
              okText={t("admin.news.delete")}
              cancelText={t("admin.news.cancel")}
              okButtonProps={{ danger: true, loading: deleting }}
              onConfirm={handleDelete}
            >
              <Button
                danger
                block={isMobile}
                icon={<DeleteOutlined />}
                style={{ fontWeight: 600 }}
              >
                {t("admin.news.delete")}
              </Button>
            </Popconfirm>
          </div>
        </div>

        <h1
          style={{
            fontWeight: 800,
            fontSize: titleSize,
            color: primary,
            marginBottom: 8,
            lineHeight: 1.3,
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {article.title}
        </h1>
        <p
          style={{
            fontSize: subtitleSize,
            color: textSub,
            margin: 0,
            maxWidth: 800,
            lineHeight: 1.75,
            wordBreak: "break-word",
          }}
        >
          {article.subtitle}
        </p>
      </div>

      {/* Layout : 2 colonnes sur desktop, 1 colonne sur tablette / mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop
            ? "minmax(0, 1fr) 380px"
            : "minmax(0, 1fr)",
          gap: isMobile ? 16 : 32,
          alignItems: "start",
        }}
      >
        {/* Sur mobile / tablette, les métadonnées passent AVANT le contenu */}
        {/* RIGHT COLUMN — métadonnées */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: sectionGap,
            position: isDesktop ? "sticky" : "static",
            top: 24,
            order: isDesktop ? 2 : 1,
            minWidth: 0,
          }}
        >
          <Card
            title={
              <span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>
                {t("admin.news.articleInfo")}
              </span>
            }
            style={{ borderRadius: radius, border: `1px solid ${border}` }}
            styles={{ body: { padding: 0 } }}
          >
            <Descriptions
              column={1}
              bordered
              size={isMobile ? "small" : "middle"}
              labelStyle={{
                fontWeight: 600,
                color: textSub,
                fontSize: 13,
                width: isMobile ? 90 : 110,
                background: "#fafafa",
              }}
              contentStyle={{ fontSize: 13, color: primary, fontWeight: 600 }}
            >
              <Descriptions.Item label={t("admin.news.status")}>
                <Tag
                  icon={
                    article.published ? <GlobalOutlined /> : <StopOutlined />
                  }
                  color={article.published ? "success" : "default"}
                  style={{
                    borderRadius: 999,
                    padding: "2px 10px",
                    fontWeight: 600,
                    fontSize: 11,
                    margin: 0,
                  }}
                >
                  {article.published ? t("admin.news.published") : t("admin.news.draft")}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="ID">#{article.id}</Descriptions.Item>
              <Descriptions.Item label={t("admin.news.created")}>
                {formatDate(article.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label={t("admin.news.updated")}>
                {formatDate(article.updatedAt)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {/* LEFT COLUMN — contenu */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: sectionGap,
            order: isDesktop ? 1 : 2,
            minWidth: 0,
          }}
        >
          {article.heading && (
            <Card
              title={
                <span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>
                  {t("admin.news.heading")}
                </span>
              }
              style={{ borderRadius: radius, border: `1px solid ${border}` }}
              styles={{ body: { padding: isMobile ? 16 : 24 } }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: textSub,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                }}
              >
                {article.heading}
              </p>
            </Card>
          )}

          {article.overview && (
            <Card
              title={
                <span style={{ color: primary, fontWeight: 700, fontSize: 16 }}>
                  {t("admin.news.overview")}
                </span>
              }
              style={{ borderRadius: radius, border: `1px solid ${border}` }}
              styles={{ body: { padding: isMobile ? 16 : 24 } }}
            >
              <p
                style={{
                  fontSize: 14,
                  color: textSub,
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  margin: 0,
                }}
              >
                {article.overview}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
