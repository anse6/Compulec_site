import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";
import {
  Table,
  Input,
  Button,
  Segmented,
  Card,
  Tag,
  Popconfirm,
  Empty,
  message,
  Skeleton,
  Modal,
  Switch,
  Grid,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  BarsOutlined,
  GlobalOutlined,
  StopOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  useGetArticlesQuery,
  usePublierArticleMutation,
  useDepublierArticleMutation,
  useDeleteArticleMutation,
} from "../../../services/api/newsApi";
import { BASE_IMG } from "../../../config";
import { formatNewsDate } from "./newsFormat";

// Largeurs fixes des colonnes (scroll horizontal sur mobile / tablette)
// IMAGE 70 + TITLE 200 + SUBTITLE 180 + HEADING 180 + OVERVIEW 200 + DATE 130
const BASE_COLUMNS_WIDTH = 70 + 200 + 180 + 180 + 200 + 130;
const ACTION_WIDTH_DESKTOP = 260; // switch + label + 3 boutons
const ACTION_WIDTH_MOBILE = 170; // switch seul + 3 boutons

// CSS pour masquer la barre de scroll du tableau (le scroll reste actif)
const hideScrollbarCss = `
  .news-table-wrap .ant-table-content,
  .news-table-wrap .ant-table-body,
  .news-table-wrap .ant-table-container {
    scrollbar-width: none;          /* Firefox */
    -ms-overflow-style: none;       /* IE / ancien Edge */
    -webkit-overflow-scrolling: touch;
  }
  .news-table-wrap .ant-table-content::-webkit-scrollbar,
  .news-table-wrap .ant-table-body::-webkit-scrollbar,
  .news-table-wrap .ant-table-container::-webkit-scrollbar {
    display: none;                  /* Chrome, Safari, mobiles */
    width: 0;
    height: 0;
  }
`;

// Helpers
function getImageUrl(img) {
  if (!img) return "https://placehold.co/96x64?text=%E2%80%94";
  if (img.startsWith("http")) return img;
  const cleanPath = img.startsWith("/api/") ? img.slice(4) : img;
  return `${BASE_IMG}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

//  VisibilityToggle — Modal Ant Design
export function VisibilityToggle({ articleId, publie }) {
  const isDark = useAdminTheme();
  const { t } = useTranslation();
  // (bug corrigé : textSub n'était pas défini dans ce composant)
  const textSub = isDark ? "#94A3B8" : "#64748B";

  const [publier, { isLoading: publishing }] = usePublierArticleMutation();
  const [depublier, { isLoading: unpublishing }] =
    useDepublierArticleMutation();
  const loading = publishing || unpublishing;

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextLabel = publie
      ? t("admin.news.visibilityDraftLabel")
      : t("admin.news.visibilityPublishedLabel");

    Modal.confirm({
      title: (
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          {t("admin.news.visibilityTitle")}
        </span>
      ),
      icon: (
        <ExclamationCircleFilled
          style={{ color: publie ? "#f59e0b" : "#22c55e" }}
        />
      ),
      content: (
        <div style={{ marginTop: 8 }}>
          <p
            style={{
              color: textSub,
              margin: "0 0 12px",
            }}
          >
            {t("admin.news.visibilityWillBe")}{" "}
            <strong style={{ color: publie ? "#d97706" : "#16a34a" }}>
              {nextLabel}
            </strong>
            .
          </p>
          {!publie && (
            <div
              style={{
                backgroundColor: "var(--ant-color-success-bg)",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "#166534",
              }}
            >
              {t("admin.news.visibilityPublishHint")}
            </div>
          )}
          {publie && (
            <div
              style={{
                backgroundColor: "var(--ant-color-warning-bg)",
                border: "1px solid #fde68a",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12,
                color: "#92400e",
              }}
            >
              {t("admin.news.visibilityUnpublishHint")}
            </div>
          )}
        </div>
      ),
      okText: publie ? t("admin.news.unpublish") : t("admin.news.publish"),
      cancelText: t("admin.news.cancel"),
      okButtonProps: {
        style: {
          background: publie ? "#d97706" : "#16a34a",
          borderColor: publie ? "#d97706" : "#16a34a",
        },
      },
      onOk: async () => {
        try {
          if (publie) {
            await depublier(articleId).unwrap();
            message.success(t("admin.news.unpublishedOk"));
          } else {
            await publier(articleId).unwrap();
            message.success(t("admin.news.publishedOk"));
          }
        } catch {
          message.error(t("admin.news.updateError"));
        }
      },
    });
  };

  const cfg = publie
    ? { color: "success", label: t("admin.news.published"), icon: <GlobalOutlined /> }
    : { color: "default", label: t("admin.news.draft"), icon: <StopOutlined /> };

  return (
    <Tag
      icon={cfg.icon}
      color={cfg.color}
      onClick={handleToggle}
      style={{
        cursor: "pointer",
        borderRadius: 999,
        padding: "2px 10px",
        fontWeight: 600,
        fontSize: 11,
        margin: 0,
        userSelect: "none",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? t("admin.news.updating") : cfg.label}
    </Tag>
  );
}

//  DeleteButton
function DeleteButton({ articleId }) {
  const { t } = useTranslation();
  const [deleteArticle, { isLoading }] = useDeleteArticleMutation();

  const handleDelete = async () => {
    try {
      await deleteArticle(articleId).unwrap();
      message.success(t("admin.news.deletedOk"));
    } catch {
      message.error(t("admin.news.deleteError"));
    }
  };

  return (
    <Popconfirm
      title={t("admin.news.deleteConfirm")}
      description={t("admin.news.deleteIrreversible")}
      okText={t("admin.news.delete")}
      cancelText={t("admin.news.cancel")}
      okButtonProps={{ danger: true, loading: isLoading }}
      onConfirm={handleDelete}
      placement="topRight"
    >
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        loading={isLoading}
        title={t("admin.news.delete")}
      />
    </Popconfirm>
  );
}

//  ArticleActionCell — composant propre pour éviter les hooks dans render
function ArticleActionCell({ record, navigate, isMobile }) {
  const isDark = useAdminTheme();
  const { t } = useTranslation();
  const bgSwitch = isDark ? "#0F172A" : "#F8FAFC";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textSub = isDark ? "#94A3B8" : "#64748B";

  const [publier, { isLoading: publishing }] = usePublierArticleMutation();
  const [depublier, { isLoading: unpublishing }] =
    useDepublierArticleMutation();
  const loading = publishing || unpublishing;

  const handleTogglePublish = async (checked) => {
    try {
      if (checked) {
        await publier(record.id).unwrap();
        message.success(t("admin.news.publishedOk"));
      } else {
        await depublier(record.id).unwrap();
        message.success(t("admin.news.unpublishedOk"));
      }
    } catch {
      message.error(t("admin.news.updateError"));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: isMobile ? 4 : 8,
      }}
    >
      {/* Switch publish : sur mobile, le switch seul (sans cadre ni libellé) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginRight: isMobile ? 0 : 4,
          backgroundColor: isMobile ? "transparent" : bgSwitch,
          padding: isMobile ? "0 4px" : "4px 10px",
          borderRadius: 8,
          border: isMobile ? "none" : `1px solid ${border}`,
        }}
      >
        {!isMobile && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: record.published ? "#16a34a" : "#94A3B8",
            }}
          >
            {record.published ? t("admin.news.published") : t("admin.news.draft")}
          </span>
        )}
        <Switch
          size="small"
          checked={record.published}
          loading={loading}
          onChange={handleTogglePublish}
          title={record.published ? t("admin.news.published") : t("admin.news.draft")}
          style={{ background: record.published ? "#16a34a" : undefined }}
        />
      </div>

      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={() => navigate(`/admin/news/preview/${record.id}`)}
        style={{ color: textSub }}
        title={t("admin.news.view")}
      />
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={() => navigate(`/admin/news/edit/${record.id}`)}
        style={{ color: textSub }}
        title={t("admin.news.edit")}
      />
      <DeleteButton articleId={record.id} />
    </div>
  );
}

//  Main Component
export default function AdminNews() {
  const isDark = useAdminTheme();
  const { t, i18n } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md; // < 768px

  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  // Valeurs internes stables (All / Published / Draft) ; seuls les libellés sont traduits
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  // On fetch un grand nombre pour faire le filtre côté client
  const { data, isLoading, isError, refetch } = useGetArticlesQuery({
    page,
    size: 50,
  });

  const articles = useMemo(() => data?.data?.content ?? [], [data]);

  //  Filtres combinés
  const filtered = useMemo(
    () =>
      articles.filter((p) => {
        const matchSearch =
          (p.title || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.subtitle || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.heading || "").toLowerCase().includes(search.toLowerCase());

        const matchVis =
          visibilityFilter === "All" ||
          (visibilityFilter === "Published" && p.published) ||
          (visibilityFilter === "Draft" && !p.published);

        return matchSearch && matchVis;
      }),
    [articles, search, visibilityFilter],
  );

  const resetFilters = () => {
    setSearch("");
    setVisibilityFilter("All");
  };

  const hasActiveFilters = search || visibilityFilter !== "All";

  // Largeur totale du tableau = somme des `width` des colonnes
  const actionWidth = isMobile ? ACTION_WIDTH_MOBILE : ACTION_WIDTH_DESKTOP;
  const tableMinWidth = BASE_COLUMNS_WIDTH + actionWidth;

  //  Colonnes table — largeurs fixes pour le scroll horizontal
  const columns = [
    {
      title: t("admin.news.colImage"),
      key: "image",
      width: 70,
      render: (_, record) => (
        <img
          src={getImageUrl(record.imageUrl)}
          alt={record.title}
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            objectFit: "cover",
            border: `1px solid ${border}`,
          }}
        />
      ),
    },
    {
      title: t("admin.news.colTitle"),
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text) => (
        <div
          title={text}
          style={{
            fontWeight: 700,
            color: textMain,
            fontSize: 13,
            maxWidth: 170,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: t("admin.news.colSubtitle"),
      dataIndex: "subtitle",
      key: "subtitle",
      width: 180,
      render: (text) => (
        <div
          title={text}
          style={{
            fontSize: 12,
            color: textSub,
            maxWidth: 150,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text || "—"}
        </div>
      ),
    },
    {
      title: t("admin.news.colHeading"),
      dataIndex: "heading",
      key: "heading",
      width: 180,
      render: (text) => (
        <div
          title={text}
          style={{
            fontSize: 12,
            color: textSub,
            maxWidth: 150,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text || "—"}
        </div>
      ),
    },
    {
      title: t("admin.news.colOverview"),
      dataIndex: "overview",
      key: "overview",
      width: 200,
      render: (text) => (
        <div
          title={text}
          style={{
            fontSize: 12,
            color: textSub,
            maxWidth: 170,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text || "—"}
        </div>
      ),
    },
    {
      title: t("admin.news.colDate"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (text) => (
        <span
          style={{
            color: textSub,
            fontWeight: 500,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {formatNewsDate(text, i18n.language)}
        </span>
      ),
    },
    {
      title: t("admin.news.colAction"),
      key: "action",
      align: "right",
      fixed: "right", // reste visible pendant le scroll horizontal
      width: actionWidth,
      render: (_, record) => (
        <ArticleActionCell
          record={record}
          navigate={navigate}
          isMobile={isMobile}
        />
      ),
    },
  ];

  //  Render
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 16 : 24,
        paddingBottom: 40,
        fontFamily: "'Poppins', sans-serif",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* CSS : barre de scroll invisible */}
      <style>{hideScrollbarCss}</style>

      {/*  Header  */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "flex-start",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontSize: isMobile ? 22 : 26,
              fontWeight: 800,
              color: textMain,
              margin: "0 0 4px",
            }}
          >
            {t("admin.news.title")}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: textSub,
              margin: 0,
            }}
          >
            {t("admin.news.pageDesc")}
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/news/add")}
          style={{
            padding: "10px 22px",
            border: "none",
            borderRadius: 10,
            backgroundColor: primary,
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            flexShrink: 0,
            width: isMobile ? "100%" : "auto",
            boxShadow: "0 2px 10px rgba(2,59,106,0.25)",
            transition: "background 0.15s",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
            +
          </span>
          {t("admin.news.addArticle")}
        </button>
      </div>

      {/*  Barre de filtres  */}
      <div
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${border}`,
          borderRadius: 14,
          padding: isMobile ? "12px 14px" : "16px 20px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          alignItems: isMobile ? "stretch" : "center",
          gap: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Recherche */}
        <Input.Search
          placeholder={t("admin.news.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: isMobile ? "100%" : 280 }}
          size="middle"
        />

        {/* Filtre visibilité */}
        <Segmented
          block={isMobile}
          options={[
            { value: "All", label: t("admin.news.filterAll") },
            { value: "Published", label: t("admin.news.filterPublished") },
            { value: "Draft", label: t("admin.news.filterDraft") },
          ]}
          value={visibilityFilter}
          onChange={setVisibilityFilter}
          size="middle"
          style={{ fontWeight: 600 }}
        />

        {/* Boutons droite */}
        <div
          style={{
            marginLeft: isMobile ? 0 : "auto",
            display: "flex",
            justifyContent: isMobile ? "flex-end" : "flex-start",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {hasActiveFilters && (
            <Button
              icon={<FilterOutlined />}
              onClick={resetFilters}
              size="middle"
              style={{
                borderRadius: 8,
                color: "var(--ant-color-error)",
                borderColor: "#fecaca",
              }}
            >
              {t("admin.news.resetFilters")}
            </Button>
          )}
          <Button
            icon={<ReloadOutlined />}
            size="middle"
            onClick={() => refetch()}
            title={t("admin.news.refresh")}
            style={{ borderRadius: 8 }}
          />
          <Button
            size="middle"
            icon={view === "list" ? <AppstoreOutlined /> : <BarsOutlined />}
            onClick={() => setView(view === "list" ? "grid" : "list")}
            style={{
              color: textSub,
              borderRadius: 8,
            }}
            title={view === "list" ? t("admin.news.gridView") : t("admin.news.listView")}
          />
        </div>
      </div>

      {/* ── Résultat filtre  */}
      {hasActiveFilters && (
        <div style={{ fontSize: 12, color: textSub }}>
          <FilterOutlined style={{ marginRight: 4 }} />
          {t("admin.news.resultsCount", { count: filtered.length, total: articles.length })}
        </div>
      )}

      {/* ── Erreur  */}
      {isError && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--ant-color-error)",
          }}
        >
          <p style={{ marginBottom: 12 }}>
            {t("admin.news.loadError")}
          </p>
          <Button onClick={() => refetch()} icon={<ReloadOutlined />}>
            {t("admin.news.retry")}
          </Button>
        </div>
      )}

      {/* ── Contenu  */}
      {!isError && (
        <div
          className="news-table-wrap"
          style={{
            backgroundColor: bgCard,
            border: `1px solid ${border}`,
            borderRadius: 16,
            // PAS de overflow:hidden en vue liste : il bloque le scroll horizontal
            overflow: view === "list" ? "visible" : "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {isLoading ? (
            <div style={{ padding: isMobile ? 16 : 32 }}>
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : view === "list" ? (
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              scroll={{ x: tableMinWidth }}
              locale={{
                emptyText: <Empty description={t("admin.news.noArticles")} />,
              }}
              pagination={{
                placement: ["bottomRight"],
                pageSize: 10,
                size: isMobile ? "small" : "default",
                simple: isMobile,
                showSizeChanger: false,
                showTotal: (total) => t("admin.news.totalCount", { count: total }),
              }}
            />
          ) : (
            /* ── Vue Grille  */
            <div
              style={{
                display: "grid",
                // min(300px, 100%) évite le débordement sur les petits écrans
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
                gap: isMobile ? 16 : 24,
                padding: isMobile ? 12 : 24,
              }}
            >
              {filtered.length === 0 && (
                <Empty
                  description={t("admin.news.noArticles")}
                  style={{ gridColumn: "1/-1" }}
                />
              )}
              {filtered.map((item) => (
                <Card
                  key={item.id}
                  hoverable
                  cover={
                    <div style={{ position: "relative" }}>
                      <img
                        alt={item.title}
                        src={getImageUrl(item.imageUrl)}
                        style={{
                          height: isMobile ? 140 : 160,
                          objectFit: "cover",
                          width: "100%",
                          borderTopLeftRadius: 12,
                          borderTopRightRadius: 12,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                        }}
                      >
                        <VisibilityToggle
                          articleId={item.id}
                          publie={item.published}
                        />
                      </div>
                    </div>
                  }
                  styles={{
                    body: { padding: isMobile ? "12px 14px" : "16px 20px" },
                  }}
                  style={{
                    borderRadius: 12,
                    border: `1px solid ${border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    minWidth: 0,
                  }}
                  actions={[
                    <EyeOutlined
                      key="view"
                      title={t("admin.news.view")}
                      onClick={() => navigate(`/admin/news/preview/${item.id}`)}
                    />,
                    <EditOutlined
                      key="edit"
                      title={t("admin.news.edit")}
                      onClick={() => navigate(`/admin/news/edit/${item.id}`)}
                    />,
                    <VisibilityToggle
                      key="pub"
                      articleId={item.id}
                      publie={item.published}
                    />,
                  ]}
                >
                  <Card.Meta
                    title={
                      <span
                        style={{
                          color: textMain,
                          fontWeight: 700,
                          fontSize: isMobile ? 14 : 15,
                        }}
                      >
                        {item.title}
                      </span>
                    }
                    description={
                      <div>
                        <div
                          style={{
                            color: textSub,
                            fontSize: 13,
                            marginBottom: 8,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.subtitle || "—"}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: textSub,
                          }}
                        >
                          {formatNewsDate(item.createdAt, i18n.language)}
                        </div>
                      </div>
                    }
                  />
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
