import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";
import {
  Table,
  Input,
  Button,
  Segmented,
  Card,
  Select,
  Tag,
  Popconfirm,
  Empty,
  message,
  Skeleton,
  Modal,
  Grid,
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
import { BASE_IMG } from "../../../config";

// Largeurs fixes des colonnes (scroll horizontal sur mobile / tablette)
// TITRE 220 + CATEGORIE 180 + LOCALISATION 130 + STATUS 130 + VISIBILITE 120
const BASE_COLUMNS_WIDTH = 220 + 180 + 130 + 130 + 120;
const ACTION_WIDTH_DESKTOP = 250; // voir + modifier + (dé)publier avec texte + supprimer
const ACTION_WIDTH_MOBILE = 170; // 4 boutons icône seule

// CSS pour masquer la barre de scroll du tableau (le scroll reste actif)
const hideScrollbarCss = `
  .projects-table-wrap .ant-table-content,
  .projects-table-wrap .ant-table-body,
  .projects-table-wrap .ant-table-container {
    scrollbar-width: none;          /* Firefox */
    -ms-overflow-style: none;       /* IE / ancien Edge */
    -webkit-overflow-scrolling: touch;
  }
  .projects-table-wrap .ant-table-content::-webkit-scrollbar,
  .projects-table-wrap .ant-table-body::-webkit-scrollbar,
  .projects-table-wrap .ant-table-container::-webkit-scrollbar {
    display: none;                  /* Chrome, Safari, mobiles */
    width: 0;
    height: 0;
  }
`;

// Style commun pour tronquer un texte avec des points de suspension
const ellipsis = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

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
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </Tag>
  );
}

//  VisibilityToggle — Modal Ant Design

export function VisibilityToggle({ projetId, publie }) {
  const isDark = useAdminTheme();
  // (bug corrigé : textSub n'était pas défini dans ce composant)
  const textSub = isDark ? "#94A3B8" : "#64748B";

  const [publier, { isLoading: publishing }] = usePublierProjetMutation();
  const [depublier, { isLoading: unpublishing }] = useDepublierProjetMutation();
  const loading = publishing || unpublishing;

  const handleToggle = (e) => {
    e.stopPropagation();
    const nextLabel = publie
      ? "Draft (non visible)"
      : "Published (visible sur le site)";

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
              color: textSub,
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
        whiteSpace: "nowrap",
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
      placement="topRight"
    >
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        loading={isLoading}
        title="Supprimer"
      />
    </Popconfirm>
  );
}

//  PublishButton — bouton dans la colonne Action
//  Sur mobile : icône seule (le libellé serait trop large)

function PublishButton({ projetId, publie, isMobile }) {
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
      title={publie ? "Dépublier" : "Publier"}
      icon={
        isMobile ? publie ? <StopOutlined /> : <GlobalOutlined /> : undefined
      }
      style={{
        color: publie ? "#d97706" : "#16a34a",
        fontWeight: 600,
      }}
    >
      {!isMobile && (publie ? "Dépublier" : "Publier")}
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
  const isDark = useAdminTheme();
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md; // < 768px

  // ── theme tokens ──────────────────────────────────────────────────────
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

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

  //  Stats rapides (utilisées par le bloc « Stats Cards » commenté plus bas)
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

  // Largeur totale du tableau = somme des `width` des colonnes
  const actionWidth = isMobile ? ACTION_WIDTH_MOBILE : ACTION_WIDTH_DESKTOP;
  const tableMinWidth = BASE_COLUMNS_WIDTH + actionWidth;

  //  Colonnes table — largeurs fixes pour le scroll horizontal
  const columns = [
    {
      title: t("admin.projects.title").toUpperCase(),
      dataIndex: "titre",
      key: "titre",
      width: 220,
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 0,
          }}
        >
          <img
            src={getImageUrl(record.images)}
            alt={text}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              objectFit: "cover",
              border: `1px solid ${border}`,
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              title={text}
              style={{
                fontWeight: 700,
                color: textMain,
                fontSize: 13,
                maxWidth: 140,
                ...ellipsis,
              }}
            >
              {text}
            </div>
            <div
              title={record.clientName || record.secteur || ""}
              style={{
                fontSize: 11,
                color: textSub,
                maxWidth: 140,
                ...ellipsis,
              }}
            >
              {record.clientName || record.secteur || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("admin.projects.category").toUpperCase(),
      dataIndex: "categorie",
      key: "categorie",
      width: 180,
      render: (val) => (
        <div
          title={val}
          style={{
            color: textSub,
            fontWeight: 500,
            fontSize: 12,
            maxWidth: 150,
            ...ellipsis,
          }}
        >
          {val || "—"}
        </div>
      ),
    },
    {
      title: t("admin.projects.location").toUpperCase(),
      dataIndex: "localisation",
      key: "localisation",
      width: 130,
      render: (val) => (
        <div
          title={val}
          style={{
            color: textSub,
            fontSize: 12,
            maxWidth: 100,
            ...ellipsis,
          }}
        >
          {val || "—"}
        </div>
      ),
    },
    {
      title: t("admin.projects.status").toUpperCase(),
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => <StatusTag status={status || "Planned"} />,
    },
    {
      title: t("admin.projects.visibility").toUpperCase(),
      key: "publie",
      width: 120,
      render: (_, record) => (
        <VisibilityToggle projetId={record.id} publie={record.publie} />
      ),
    },
    {
      title: t("admin.projects.action").toUpperCase(),
      key: "action",
      align: "right",
      fixed: "right", // reste visible pendant le scroll horizontal
      width: actionWidth,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            flexWrap: "nowrap", // une seule ligne : la largeur est fixe
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 4,
          }}
        >
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/projects/preview/${record.id}`)}
            style={{ color: textSub }}
            title="Voir"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/projects/edit/${record.id}`)}
            style={{ color: textSub }}
            title="Modifier"
          />
          <PublishButton
            projetId={record.id}
            publie={record.publie}
            isMobile={isMobile}
          />
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
            {t("admin.projects.title")}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: textSub,
              margin: 0,
            }}
          >
            Gérez les projets COMPULEC et leur présentation sur le site web.
          </p>
        </div>
        <Button
          size={isMobile ? "middle" : "large"}
          block={isMobile}
          onClick={() => navigate("/admin/projects/add")}
          style={{
            backgroundColor: primary,
            color: "#ffffff",
            borderColor: primary,
            borderRadius: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          + {t("admin.projects.addProject")}
        </Button>
      </div>

      {/* Stats Cards (désactivé) — version responsive prête à réactiver :
        <div style={{ display: "flex", flexWrap: "wrap", gap: isMobile ? 10 : 16 }}>
          {[
            { label: "Total projets", value: total, bg: "#EFF6FF", color: "#1d4ed8" },
            { label: "Publiés", value: publishedCount, bg: "#F0FDF4", color: "#16a34a" },
            { label: "Brouillons", value: draftCount, bg: "#FFFBEB", color: "#d97706" },
            { label: "Filtrés", value: filtered.length, bg: "#F8FAFC", color: textSub },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                flex: isMobile ? "1 1 calc(50% - 10px)" : "1 1 0",
                minWidth: 0,
                background: s.bg,
                borderRadius: 12,
                padding: isMobile ? "10px 14px" : "14px 20px",
                border: `1px solid ${s.color}22`,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: textSub, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      */}

      {/*  Barre de filtres  */}
      <div
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${border}`,
          borderRadius: 14,
          padding: isMobile ? "12px 14px" : "14px 16px",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          alignItems: isMobile ? "stretch" : "center",
          gap: 10,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Recherche */}
        <Input.Search
          placeholder="Rechercher…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={
            isMobile ? { width: "100%" } : { flex: "1 1 180px", minWidth: 140 }
          }
          size="middle"
        />

        {/* Filtre visibilité */}
        <Segmented
          block={isMobile}
          options={["All", "Published", "Draft"]}
          value={visibilityFilter}
          onChange={setVisibilityFilter}
          size="middle"
          style={{ fontWeight: 600, flexShrink: 0 }}
        />

        {/* Filtre catégorie */}
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          size="middle"
          style={
            isMobile ? { width: "100%" } : { flex: "1 1 160px", minWidth: 140 }
          }
          options={[
            { value: "all", label: "Toutes catégories" },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
        />

        {/* Filtre statut */}
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          size="middle"
          style={
            isMobile ? { width: "100%" } : { flex: "1 1 130px", minWidth: 120 }
          }
          options={[
            { value: "all", label: "Tous statuts" },
            { value: "Planned", label: "Planned" },
            { value: "In progress", label: "In Progress" },
            { value: "Completed", label: "Completed" },
            { value: "On Hold", label: "On Hold" },
          ]}
        />

        {/* Boutons droite */}
        <div
          style={{
            marginLeft: isMobile ? 0 : "auto",
            display: "flex",
            justifyContent: isMobile ? "flex-end" : "flex-start",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {hasActiveFilters && (
            <Button
              icon={<FilterOutlined />}
              onClick={resetFilters}
              size="middle"
              title="Réinitialiser les filtres"
              style={{
                borderRadius: 8,
                color: "var(--ant-color-error)",
                borderColor: "#fecaca",
              }}
            />
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
            style={{ color: textSub, borderRadius: 8 }}
            title={view === "list" ? "Vue grille" : "Vue liste"}
          />
        </div>
      </div>

      {/*  Résultat filtre  */}
      {hasActiveFilters && (
        <div style={{ fontSize: 12, color: textSub }}>
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
          className="projects-table-wrap"
          style={{
            backgroundColor: bgCard,
            border: `1px solid ${border}`,
            borderRadius: 16,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            // PAS de overflow:hidden en vue liste : il bloque le scroll horizontal
            overflow: view === "list" ? "visible" : "hidden",
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
              size={isMobile ? "small" : "middle"}
              scroll={{ x: tableMinWidth }}
              locale={{
                emptyText: <Empty description="Aucun projet trouvé" />,
              }}
              pagination={{
                placement: ["bottomRight"],
                pageSize: 10,
                size: isMobile ? "small" : "default",
                simple: isMobile,
                showSizeChanger: false,
                showTotal: (total) => `${total} projet${total > 1 ? "s" : ""}`,
              }}
            />
          ) : (
            /*  Vue Grille  */
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
                        height: isMobile ? 160 : 192,
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
                          right: 12,
                          display: "flex",
                          flexWrap: "wrap",
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
                      padding: isMobile ? 14 : 20,
                      display: "flex",
                      flexDirection: "column",
                    },
                  }}
                  style={{
                    borderRadius: 16,
                    overflow: "hidden",
                    border: `1px solid ${border}`,
                    minWidth: 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: textSub,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 8,
                    }}
                  >
                    {item.categorie || "—"}
                  </p>
                  <h3
                    style={{
                      fontSize: isMobile ? 14 : 15,
                      fontWeight: 700,
                      color: isDark ? "#38bdf8" : "#023B6A",
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
                      color: textSub,
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
                      flexWrap: "wrap",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      borderTop: `1px solid ${border}`,
                      paddingTop: 16,
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
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
