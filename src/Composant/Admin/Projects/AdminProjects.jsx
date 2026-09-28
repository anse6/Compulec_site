import React, { useState, useMemo } from "react";
import {
  Table,
  ConfigProvider,
  Input,
  Button,
  Segmented,
  Card,
  Select,
  Tag,
  Popconfirm,
  Spin,
  Empty,
  message,
  Skeleton,
  Modal,
  Space,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
  LoadingOutlined,
  GlobalOutlined,
  StopOutlined,
  ReloadOutlined,
  FilterOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  useGetAllProjetsQuery,
  usePublierProjetMutation,
  useDepublierProjetMutation,
  useDeleteProjetMutation,
} from "../../../services/api/projetApi";

const BASE_IMG = "http://localhost:8080/api";

// Helpers

function getImageUrl(images) {
  if (!images || images.length === 0)
    return "https://placehold.co/96x64?text=No+img";
  const img = images[0];
  if (img.startsWith("http")) return img;
  const cleanPath = img.startsWith("/api/") ? img.slice(4) : img;
  return `${BASE_IMG}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
}

//  Status Config

export const PROJECT_STATUS_CONFIG = {
  Planned: {
    bg: "#eff6ff",
    text: "#2563eb",
    border: "#bfdbfe",
    label: "Planned",
    icon: <ClockCircleOutlined />,
  },
  "In progress": {
    bg: "#fffbeb",
    text: "#d97706",
    border: "#fde68a",
    label: "In Progress",
    icon: <SyncOutlined spin />,
  },
  Completed: {
    bg: "#f0fdf4",
    text: "#16a34a",
    border: "#bbf7d0",
    label: "Completed",
    icon: <CheckCircleOutlined />,
  },
  "On Hold": {
    bg: "#fef2f2",
    text: "#dc2626",
    border: "#fecaca",
    label: "On Hold",
    icon: <PauseCircleOutlined />,
  },
};

export function StatusTag({ status }) {
  const key =
    Object.keys(PROJECT_STATUS_CONFIG).find(
      (k) => k.toLowerCase() === (status || "").toLowerCase(),
    ) || "Planned";
  const cfg = PROJECT_STATUS_CONFIG[key];
  return (
    <Tag
      icon={cfg.icon}
      style={{
        backgroundColor: cfg.bg,
        color: cfg.text,
        borderColor: cfg.border,
        borderRadius: 999,
        padding: "2px 10px",
        fontWeight: 600,
        fontSize: 11,
        margin: 0,
      }}
    >
      {cfg.label}
    </Tag>
  );
}

//  VisibilityToggle — Modal Ant Design

export function VisibilityToggle({ projetId, publie }) {
  const [publier, { isLoading: publishing }] = usePublierProjetMutation();
  const [depublier, { isLoading: unpublishing }] = useDepublierProjetMutation();
  const loading = publishing || unpublishing;

  const handleToggle = (e) => {
    e.stopPropagation();
    const action = publie ? "dépublier" : "publier";
    const nextLabel = publie
      ? "Draft (non visible)"
      : "Published (visible sur le site)";
    const icon = publie ? (
      <p style={{ color: "var(--ant-color-warning)" }}> publier</p>
    ) : (
      <p style={{ color: "var(--ant-color-success)" }}> dépublier</p>
    );

    Modal.confirm({
      title: (
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          Modifier la visibilité du projet ?
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
            Ce projet sera marqué comme{" "}
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
              Le projet sera immédiatement visible par les visiteurs du site.
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
              Le projet sera masqué du site public.
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
            result = await depublier(projetId).unwrap();
          } else {
            result = await publier(projetId).unwrap();
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
      icon={loading ? <LoadingOutlined spin /> : cfg.icon}
      color={loading ? "processing" : cfg.color}
      onClick={handleToggle}
      style={{
        cursor: "pointer",
        borderRadius: 999,
        padding: "2px 10px",
        fontWeight: 600,
        fontSize: 11,
        margin: 0,
        userSelect: "none",
      }}
    >
      {loading ? "Updating…" : cfg.label}
    </Tag>
  );
}

//  DeleteButton

function DeleteButton({ projetId }) {
  const [deleteProjet, { isLoading }] = useDeleteProjetMutation();

  const handleDelete = async () => {
    try {
      const result = await deleteProjet(projetId).unwrap();
      message.success(result.message || "Projet supprimé avec succès.");
    } catch (err) {
      message.error(err?.data?.message || "Erreur lors de la suppression.");
    }
  };

  return (
    <Popconfirm
      title="Supprimer ce projet ?"
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

//  PublishButton — bouton dans la colonne Action

function PublishButton({ projetId, publie }) {
  const [publier, { isLoading: publishing }] = usePublierProjetMutation();
  const [depublier, { isLoading: unpublishing }] = useDepublierProjetMutation();
  const loading = publishing || unpublishing;

  const handleClick = (e) => {
    e.stopPropagation();
    Modal.confirm({
      title: (
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          {publie ? "Dépublier ce projet ?" : "Publier ce projet ?"}
        </span>
      ),
      icon: (
        <ExclamationCircleFilled
          style={{ color: publie ? "#f59e0b" : "#22c55e" }}
        />
      ),
      content: (
        <div style={{ marginTop: 8 }}>
          {!publie ? (
            <div
              style={{
                backgroundColor: "var(--ant-color-success-bg)",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                color: "#166534",
              }}
            >
              Ce projet sera <strong>immédiatement visible</strong> sur le site
              par tous les visiteurs.
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "var(--ant-color-warning-bg)",
                border: "1px solid #fde68a",
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 12,
                color: "#92400e",
              }}
            >
              Ce projet sera <strong>masqué du site public</strong> et repassera
              en brouillon.
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
          fontWeight: 600,
        },
      },
      onOk: async () => {
        try {
          const result = publie
            ? await depublier(projetId).unwrap()
            : await publier(projetId).unwrap();
          message.success(result.message || "Visibilité mise à jour !");
        } catch (err) {
          message.error(err?.data?.message || "Erreur lors de la mise à jour.");
        }
      },
    });
  };

  return (
    <Button
      type="text"
      loading={loading}
      onClick={handleClick}
      style={{
        color: publie ? "#d97706" : "#16a34a",
        fontWeight: 600,
      }}
    >
      {publie ? "Dépublier" : "Publier"}
    </Button>
  );
}

//  Catégories disponibles

const CATEGORIES = [
  "Infrastructure & Network",
  "Computer Security",
  "Energy Solutions",
  "Digital Solutions",
  "Access Control",
  "Network & System Administration Installation",
];

//  Main Component

export default function AdminProjects() {
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetAllProjetsQuery({
    page,
    size: 50,
  });

  const projets = data?.data?.content ?? [];
  const total = data?.data?.totalElements ?? 0;

  //  Filtres combinés
  const filtered = useMemo(
    () =>
      projets.filter((p) => {
        const matchSearch =
          (p.titre || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.categorie || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.clientName || "").toLowerCase().includes(search.toLowerCase()) ||
          (p.secteur || "").toLowerCase().includes(search.toLowerCase());

        const matchVis =
          visibilityFilter === "All" ||
          (visibilityFilter === "Published" && p.publie) ||
          (visibilityFilter === "Draft" && !p.publie);

        const matchCat =
          categoryFilter === "all" ||
          (p.categorie || "").toLowerCase() === categoryFilter.toLowerCase();

        const matchStatus =
          statusFilter === "all" ||
          (p.status || "").toLowerCase() === statusFilter.toLowerCase();

        return matchSearch && matchVis && matchCat && matchStatus;
      }),
    [projets, search, visibilityFilter, categoryFilter, statusFilter],
  );

  //  Stats rapides
  const publishedCount = projets.filter((p) => p.publie).length;
  const draftCount = projets.filter((p) => !p.publie).length;

  const resetFilters = () => {
    setSearch("");
    setVisibilityFilter("All");
    setCategoryFilter("all");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    search ||
    visibilityFilter !== "All" ||
    categoryFilter !== "all" ||
    statusFilter !== "all";

  //  Colonnes table
  const columns = [
    {
      title: "PROJET",
      dataIndex: "titre",
      key: "titre",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={getImageUrl(record.images)}
            alt={text}
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              objectFit: "cover",
              border: "1px solid #E2E8F0",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                fontWeight: 700,
                color: "var(--ant-color-text)",
                fontSize: 13,
              }}
            >
              {text}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ant-color-text-description)",
              }}
            >
              {record.clientName || record.secteur || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "CATÉGORIE",
      dataIndex: "categorie",
      key: "categorie",
      render: (t) => (
        <span
          style={{
            color: "var(--ant-color-text-secondary)",
            fontWeight: 500,
            fontSize: 12,
          }}
        >
          {t || "—"}
        </span>
      ),
    },
    {
      title: "LOCALISATION",
      dataIndex: "localisation",
      key: "localisation",
      render: (t) => (
        <span
          style={{ color: "var(--ant-color-text-secondary)", fontSize: 12 }}
        >
          {t || "—"}
        </span>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (status) => <StatusTag status={status || "Planned"} />,
    },
    {
      title: "VISIBILITÉ",
      key: "publie",
      render: (_, record) => (
        <VisibilityToggle projetId={record.id} publie={record.publie} />
      ),
    },
    {
      title: "ACTION",
      key: "action",
      align: "right",
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 4,
          }}
        >
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/projects/preview/${record.id}`)}
            style={{ color: "var(--ant-color-text-description)" }}
            title="Voir"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/projects/edit/${record.id}`)}
            style={{ color: "var(--ant-color-text-description)" }}
            title="Modifier"
          />
          <PublishButton projetId={record.id} publie={record.publie} />
          <DeleteButton projetId={record.id} />
        </div>
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
            Projects &amp; Achievements
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--ant-color-text-description)",
              margin: 0,
            }}
          >
            Gérez les projets COMPULEC et leur présentation sur le site web.
          </p>
        </div>
        <Button
          size="large"
          onClick={() => navigate("/admin/projects/add")}
          style={{
            backgroundColor: "#023B6A",
            color: "#ffffff",
            borderColor: "#023B6A",
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          + Ajouter un projet
        </Button>
      </div>

      {/* Stats Cards 
        <div style={{ display: "flex", gap: 16 }}>
          {[
            {
              label: "Total projets",
              value: total,
              bg: "#EFF6FF",
              color: "#1d4ed8",
            },
            {
              label: "Publiés",
              value: publishedCount,
              bg: "#F0FDF4",
              color: "#16a34a",
            },
            {
              label: "Brouillons",
              value: draftCount,
              bg: "#FFFBEB",
              color: "#d97706",
            },
            {
              label: "Filtrés",
              value: filtered.length,
              bg: "#F8FAFC",
              color: "var(--ant-color-text-secondary)",
            },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: s.bg,
                borderRadius: 12,
                padding: "14px 20px",
                border: `1px solid ${s.color}22`,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--ant-color-text-description)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div> */}

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
          placeholder="Rechercher par titre, catégorie, client…"
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

        {/* Filtre catégorie */}
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          size="middle"
          style={{ width: 230 }}
          options={[
            { value: "all", label: "Toutes les catégories" },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
        />

        {/* Filtre statut */}
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          size="middle"
          style={{ width: 160 }}
          options={[
            { value: "all", label: "Tous les statuts" },
            { value: "Planned", label: "Planned" },
            { value: "In progress", label: "In Progress" },
            { value: "Completed", label: "Completed" },
            { value: "On Hold", label: "On Hold" },
          ]}
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

      {/*  Résultat filtre  */}
      {hasActiveFilters && (
        <div
          style={{ fontSize: 12, color: "var(--ant-color-text-description)" }}
        >
          <FilterOutlined style={{ marginRight: 4 }} />
          {filtered.length} résultat{filtered.length > 1 ? "s" : ""} sur{" "}
          {projets.length} projets
        </div>
      )}

      {/*  Erreur  */}
      {isError && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--ant-color-error)",
          }}
        >
          <p style={{ marginBottom: 12 }}>
            Erreur lors du chargement des projets.
          </p>
          <Button onClick={() => refetch()} icon={<ReloadOutlined />}>
            Réessayer
          </Button>
        </div>
      )}

      {/*  Contenu  */}
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
                emptyText: <Empty description="Aucun projet trouvé" />,
              }}
              pagination={{
                position: ["bottomRight"],
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (t) => `${t} projet${t > 1 ? "s" : ""}`,
              }}
            />
          ) : (
            /*  Vue Grille  */
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
                  description="Aucun projet trouvé"
                  style={{ gridColumn: "1/-1" }}
                />
              )}
              {filtered.map((item) => (
                <Card
                  key={item.id}
                  hoverable
                  cover={
                    <div
                      style={{
                        position: "relative",
                        height: 192,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        alt={item.titre}
                        src={getImageUrl(item.images)}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          display: "flex",
                          gap: 6,
                        }}
                      >
                        <VisibilityToggle
                          projetId={item.id}
                          publie={item.publie}
                        />
                        <StatusTag status={item.status} />
                      </div>
                    </div>
                  }
                  styles={{
                    body: {
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                    },
                  }}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--ant-color-text-description)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 8,
                    }}
                  >
                    {item.categorie || "—"}
                  </p>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#023B6A",
                      marginBottom: 8,
                      lineHeight: 1.4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.titre}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--ant-color-text-description)",
                      flex: 1,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: 16,
                    }}
                  >
                    {item.overview || item.sousTitre || "—"}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #E2E8F0",
                      paddingTop: 16,
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          navigate(`/admin/projects/preview/${item.id}`)
                        }
                      >
                        Aperçu
                      </Button>
                      <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() =>
                          navigate(`/admin/projects/edit/${item.id}`)
                        }
                      >
                        Modifier
                      </Button>
                    </div>
                    <DeleteButton projetId={item.id} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
