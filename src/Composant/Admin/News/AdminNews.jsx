import React, { useState, useMemo } from "react";
import {
  Table,
  ConfigProvider,
  Input,
  Button,
  Segmented,
  Card,
  Tag,
  Popconfirm,
  Spin,
  Empty,
  message,
  Skeleton,
  Modal,
  Switch,
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
import dayjs from "dayjs";

const BASE_IMG = "http://localhost:8080/api";

// Helpers
function getImageUrl(img) {
  if (!img) return "https://placehold.co/96x64?text=No+img";
  if (img.startsWith("http")) return img;
  const cleanPath = img.startsWith("/api/") ? img.slice(4) : img;
  return `${BASE_IMG}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return dayjs(dateStr).format("DD MMM YYYY");
};

//  VisibilityToggle — Modal Ant Design
export function VisibilityToggle({ articleId, publie }) {
  const [publier, { isLoading: publishing }] = usePublierArticleMutation();
  const [depublier, { isLoading: unpublishing }] =
    useDepublierArticleMutation();
  const loading = publishing || unpublishing;

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextLabel = publie
      ? "Draft (non visible)"
      : "Published (visible sur le site)";

    Modal.confirm({
      title: (
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          Modifier la visibilité de l'article ?
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
              color: "var(--ant-color-text-description)",
              margin: "0 0 12px",
            }}
          >
            Cet article sera marqué comme{" "}
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
              L'article sera immédiatement visible par les visiteurs du site.
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
              L'article sera masqué du site public.
            </div>
          )}
        </div>
      ),
      okText: publie ? "Dépublier" : "Publier",
      cancelText: "Annuler",
      okButtonProps: {
        style: {
          background: publie ? "#d97706" : "#16a34a",
          borderColor: publie ? "#d97706" : "#16a34a",
        },
      },
      onOk: async () => {
        try {
          let result;
          if (publie) {
            result = await depublier(articleId).unwrap();
          } else {
            result = await publier(articleId).unwrap();
          }
          message.success(result.message || "Visibilité mise à jour !");
        } catch (err) {
          message.error(err?.data?.message || "Erreur lors de la mise à jour.");
        }
      },
    });
  };

  const cfg = publie
    ? { color: "success", label: "Published", icon: <GlobalOutlined /> }
    : { color: "default", label: "Draft", icon: <StopOutlined /> };

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
      {loading ? "Updating…" : cfg.label}
    </Tag>
  );
}

// ── DeleteButton ──────────────────────────────────────────────────────────────
function DeleteButton({ articleId }) {
  const [deleteArticle, { isLoading }] = useDeleteArticleMutation();

  const handleDelete = async () => {
    try {
      await deleteArticle(articleId).unwrap();
      message.success("Article supprimé avec succès.");
    } catch (err) {
      message.error(err?.data?.message || "Erreur lors de la suppression.");
    }
  };

  return (
    <Popconfirm
      title="Supprimer cet article ?"
      description="Cette action est irréversible."
      okText="Supprimer"
      cancelText="Annuler"
      okButtonProps={{ danger: true, loading: isLoading }}
      onConfirm={handleDelete}
    >
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        loading={isLoading}
      />
    </Popconfirm>
  );
}

// ── ArticleActionCell — composant proper pour éviter hooks dans render ────────
function ArticleActionCell({ record, navigate }) {
  const [publier, { isLoading: publishing }] = usePublierArticleMutation();
  const [depublier, { isLoading: unpublishing }] =
    useDepublierArticleMutation();
  const loading = publishing || unpublishing;

  const handleTogglePublish = async (checked) => {
    try {
      if (checked) {
        await publier(record.id).unwrap();
        message.success("Article publié !");
      } else {
        await depublier(record.id).unwrap();
        message.success("Article dépublié !");
      }
    } catch (error) {
      message.error("Erreur lors de la mise à jour.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
      }}
    >
      {/* Switch publish */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginRight: 4,
          backgroundColor: "#F8FAFC",
          padding: "4px 10px",
          borderRadius: 8,
          border: "1px solid #E2E8F0",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: record.published ? "#16a34a" : "#94A3B8",
          }}
        >
          {record.published ? "Published" : "Draft"}
        </span>
        <Switch
          size="small"
          checked={record.published}
          loading={loading}
          onChange={handleTogglePublish}
          style={{ background: record.published ? "#16a34a" : undefined }}
        />
      </div>

      <Button
        type="text"
        icon={<EyeOutlined />}
        onClick={() => navigate(`/admin/news/preview/${record.id}`)}
        style={{ color: "var(--ant-color-text-description)" }}
        title="Voir"
      />
      <Button
        type="text"
        icon={<EditOutlined />}
        onClick={() => navigate(`/admin/news/edit/${record.id}`)}
        style={{ color: "var(--ant-color-text-description)" }}
        title="Modifier"
      />
      <DeleteButton articleId={record.id} />
    </div>
  );
}

//  Main Component
export default function AdminNews() {
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  // On fetch un grand nombre pour faire le filtre côté client
  const { data, isLoading, isError, refetch } = useGetArticlesQuery({
    page,
    size: 50,
  });

  const articles = data?.data?.content ?? [];
  const total = data?.data?.totalElements ?? 0;

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

  //  Colonnes table
  const columns = [
    {
      title: "IMAGE",
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
            border: "1px solid #E2E8F0",
          }}
        />
      ),
    },
    {
      title: "TITLE",
      dataIndex: "title",
      key: "title",
      render: (t) => (
        <div
          style={{
            fontWeight: 700,
            color: "var(--ant-color-text)",
            fontSize: 13,
            minWidth: 120,
          }}
        >
          {t}
        </div>
      ),
    },
    {
      title: "SUBTITLE",
      dataIndex: "subtitle",
      key: "subtitle",
      render: (t) => (
        <div
          style={{
            fontSize: 12,
            color: "var(--ant-color-text-description)",
            minWidth: 120,
          }}
        >
          {t || "—"}
        </div>
      ),
    },
    {
      title: "HEADING",
      dataIndex: "heading",
      key: "heading",
      render: (t) => (
        <div
          style={{
            fontSize: 12,
            color: "var(--ant-color-text-description)",
            minWidth: 120,
          }}
        >
          {t || "—"}
        </div>
      ),
    },
    {
      title: "OVERVIEW",
      dataIndex: "overview",
      key: "overview",
      render: (t) => (
        <div
          style={{
            fontSize: 12,
            color: "var(--ant-color-text-description)",
            maxWidth: 200,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {t || "—"}
        </div>
      ),
    },
    {
      title: "DATE",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (t) => (
        <span
          style={{
            color: "var(--ant-color-text-secondary)",
            fontWeight: 500,
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {formatDate(t)}
        </span>
      ),
    },
    {
      title: "ACTION",
      key: "action",
      align: "right",
      render: (_, record) => (
        <ArticleActionCell record={record} navigate={navigate} />
      ),
    },
  ];

  //  Render
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        paddingBottom: 40,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/*  Header  */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "var(--ant-color-text)",
              margin: "0 0 4px",
            }}
          >
            News & Articles
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--ant-color-text-description)",
              margin: 0,
            }}
          >
            Gérez les actualités affichées sur le site web.
          </p>
        </div>
        {/* <Button
          type="primary"
          size="large"
          style={{
            backgroundColor: "var(--ant-color-primary)",
            borderColor: "#023B6A",
            borderRadius: 10,
            fontWeight: 700,
          }}
        ></Button> */}
        <button
          onClick={() => navigate("/admin/news/add")}
          style={{
            padding: "10px 22px",
            border: "none",
            borderRadius: 10,
            backgroundColor: "#023B6A",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "0 2px 10px rgba(2,59,106,0.25)",
            transition: "background 0.15s",
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
            +
          </span>
          Add Article
        </button>
      </div>

      {/*  Barre de filtres  */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          padding: "16px 20px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Recherche */}
        <Input.Search
          placeholder="Rechercher par titre, contenu…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ width: 280 }}
          size="middle"
        />

        {/* Filtre visibilité */}
        <Segmented
          options={["All", "Published", "Draft"]}
          value={visibilityFilter}
          onChange={setVisibilityFilter}
          size="middle"
          style={{ fontWeight: 600 }}
        />

        {/* Boutons droite */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
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
              Réinitialiser
            </Button>
          )}
          <Button
            icon={<ReloadOutlined />}
            size="middle"
            onClick={() => refetch()}
            title="Actualiser"
            style={{ borderRadius: 8 }}
          />
          <Button
            size="middle"
            icon={view === "list" ? <AppstoreOutlined /> : <BarsOutlined />}
            onClick={() => setView(view === "list" ? "grid" : "list")}
            style={{
              color: "var(--ant-color-text-description)",
              borderRadius: 8,
            }}
            title={view === "list" ? "Vue grille" : "Vue liste"}
          />
        </div>
      </div>

      {/* ── Résultat filtre ─────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div
          style={{ fontSize: 12, color: "var(--ant-color-text-description)" }}
        >
          <FilterOutlined style={{ marginRight: 4 }} />
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""} sur{" "}
          {articles.length} articles
        </div>
      )}

      {/* ── Erreur ──────────────────────────────────────────────────────── */}
      {isError && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--ant-color-error)",
          }}
        >
          <p style={{ marginBottom: 12 }}>
            Erreur lors du chargement des articles.
          </p>
          <Button onClick={() => refetch()} icon={<ReloadOutlined />}>
            Réessayer
          </Button>
        </div>
      )}

      {/* ── Contenu ──────────────────────────────────────────────────────── */}
      {!isError && (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #E2E8F0",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {isLoading ? (
            <div style={{ padding: 32 }}>
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : view === "list" ? (
            <Table
              columns={columns}
              dataSource={filtered}
              rowKey="id"
              locale={{
                emptyText: <Empty description="Aucun article trouvé" />,
              }}
              pagination={{
                position: ["bottomRight"],
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (t) => `${t} article${t > 1 ? "s" : ""}`,
              }}
            />
          ) : (
            /* ── Vue Grille ─────────────────────────────────────────────── */
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 24,
                padding: 24,
              }}
            >
              {filtered.length === 0 && (
                <Empty
                  description="Aucun article trouvé"
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
                        alt="cover"
                        src={getImageUrl(item.imageUrl)}
                        style={{
                          height: 160,
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
                  bodyStyle={{ padding: "16px 20px" }}
                  style={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                  actions={[
                    <EyeOutlined
                      key="view"
                      onClick={() => navigate(`/admin/news/preview/${item.id}`)}
                    />,
                    <EditOutlined
                      key="edit"
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
                          color: "var(--ant-color-text)",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        {item.title}
                      </span>
                    }
                    description={
                      <div>
                        <div
                          style={{
                            color: "var(--ant-color-text-description)",
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
                            color: "var(--ant-color-text-description)",
                          }}
                        >
                          {formatDate(item.createdAt)}
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
