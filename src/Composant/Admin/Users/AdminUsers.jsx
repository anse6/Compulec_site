import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";
import {
  Input,
  Table,
  Popconfirm,
  message as antMessage,
  Spin,
  Grid,
  Tag,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
  MailOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import AddUserModal from "./AddUserModal";
import UserDetailsModal from "./UserDetailsModal";
import AvatarWithPopover from "./AvatarWithPopover";
import StatusToggle from "./StatusToggle";
import EditUserModal from "./EditUserModal";
import ActivationCodeModal from "./ActivationCodeModal";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useResendInvitationMutation,
  useResetUserMfaMutation,
} from "../../../services/api/usersApi";

// Largeurs fixes des colonnes (scroll horizontal sur mobile / tablette)
// NAME 240 + EMAIL 240 + ROLE 110 + DATE 130 + STATUS 120
const BASE_COLUMNS_WIDTH = 240 + 240 + 110 + 130 + 120;
const ACTION_WIDTH_DESKTOP = 360; // vue + edit + activer/désactiver (texte) + 2FA + supprimer
const ACTION_WIDTH_MOBILE = 240; // 5 boutons icône seule

// CSS pour masquer la barre de scroll du tableau (le scroll reste actif)
const hideScrollbarCss = `
  .users-table-wrap .ant-table-content,
  .users-table-wrap .ant-table-body,
  .users-table-wrap .ant-table-container {
    scrollbar-width: none;          /* Firefox */
    -ms-overflow-style: none;       /* IE / ancien Edge */
    -webkit-overflow-scrolling: touch;
  }
  .users-table-wrap .ant-table-content::-webkit-scrollbar,
  .users-table-wrap .ant-table-body::-webkit-scrollbar,
  .users-table-wrap .ant-table-container::-webkit-scrollbar {
    display: none;                  /* Chrome, Safari, mobiles */
    width: 0;
    height: 0;
  }
`;

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Style commun pour tronquer un texte avec des points de suspension
const ellipsis = {
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default function AdminUsers() {
  const isDark = useAdminTheme();
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md; // < 768px

  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // État local pour mise à jour optimiste du statut (évite le refresh manuel)
  const [statusOverrides, setStatusOverrides] = useState({});

  //  API
  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page: 0,
    size: 50,
  });
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [activateUser, { isLoading: activating }] = useActivateUserMutation();
  const [deactivateUser, { isLoading: deactivating }] =
    useDeactivateUserMutation();
  const [resendInvitation, { isLoading: resending }] =
    useResendInvitationMutation();
  const [resetUserMfa, { isLoading: resettingMfa }] = useResetUserMfaMutation();
  // Nouvelle invitation : le code n'est affiché qu'une seule fois
  const [invitation, setInvitation] = useState(null);

  // Backend returns Page<UserResponse> → data.data.content
  const allUsers = (data?.data?.content || []).map((u) => ({
    ...u,
    // On applique l’override optimiste s’il existe
    actif:
      statusOverrides[u.id] !== undefined ? statusOverrides[u.id] : u.actif,
  }));

  // Client-side search filter
  const users = allUsers.filter((u) => {
    const term = search.toLowerCase();
    const name = `${u.prenom} ${u.nom}`.toLowerCase();
    return (
      !term ||
      name.includes(term) ||
      (u.email || "").toLowerCase().includes(term)
    );
  });

  //  Handlers
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteUser(id).unwrap();
      antMessage.success("Compte supprimé avec succès.");
    } catch {
      antMessage.error("Erreur lors de la suppression.");
    }
  };

  const handleResendInvitation = async (user) => {
    try {
      const result = await resendInvitation(user.id).unwrap();
      antMessage.success(result.message || t("admin.users.invite.sent"));
      setInvitation(result.data);
    } catch (err) {
      antMessage.error(err?.data?.message || t("admin.users.invite.resendError"));
    }
  };

  const handleResetMfa = async (user) => {
    try {
      const result = await resetUserMfa(user.id).unwrap();
      antMessage.success(result.message);
      refetch();
    } catch (err) {
      antMessage.error(err?.data?.message || t("mfa.reset.error"));
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.actif;

    // 1. Mise à jour optimiste immédiate (le bouton change tout de suite)
    setStatusOverrides((prev) => ({ ...prev, [user.id]: newStatus }));

    try {
      if (user.actif) {
        await deactivateUser(user.id).unwrap();
        antMessage.success("Utilisateur désactivé avec succès.");
      } else {
        await activateUser(user.id).unwrap();
        antMessage.success("Utilisateur activé avec succès.");
      }

      // 2. On rafraîchit les données du serveur
      await refetch();

      // 3. On nettoie l’override (le serveur a maintenant la bonne valeur)
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
    } catch (err) {
      // En cas d’erreur on annule l’override
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
      antMessage.error(
        err?.data?.message || "Erreur lors du changement de statut.",
      );
    }
  };

  // Largeur totale du tableau = somme des `width` des colonnes
  const actionWidth = isMobile ? ACTION_WIDTH_MOBILE : ACTION_WIDTH_DESKTOP;
  const tableMinWidth = BASE_COLUMNS_WIDTH + actionWidth;

  // Padding des boutons d'action : plus compact sur mobile
  const btnPad = isMobile ? "px-2.5 py-1.5" : "px-3 py-1.5";

  //  Columns — largeurs fixes pour le scroll horizontal
  const columns = [
    {
      title:
        t("admin.users.firstName").toUpperCase() +
        " / " +
        t("admin.users.lastName").toUpperCase(),
      key: "name",
      width: 240,
      render: (_, record) => (
        <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
          <AvatarWithPopover
            name={`${record.prenom} ${record.nom}`}
            email={record.email}
          />
          <div style={{ minWidth: 0 }}>
            <div
              className="font-semibold text-[13px]"
              title={`${record.prenom} ${record.nom}`}
              style={{ color: textMain, maxWidth: 160, ...ellipsis }}
            >
              {record.prenom} {record.nom}
            </div>
            <div
              className="text-[11px] text-slate-400"
              title={record.fonction || ""}
              style={{ maxWidth: 160, ...ellipsis }}
            >
              {record.fonction || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("admin.messages.email").toUpperCase(),
      dataIndex: "email",
      key: "email",
      width: 240,
      render: (text) => (
        <div
          className="text-[13px]"
          title={text}
          style={{ color: textMain, maxWidth: 210, ...ellipsis }}
        >
          {text}
        </div>
      ),
    },
    {
      title: t("admin.users.role").toUpperCase(),
      dataIndex: "role",
      key: "role",
      width: 110,
      render: (role) => (
        <span
          className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            whiteSpace: "nowrap",
            backgroundColor:
              role === "ADMIN"
                ? isDark
                  ? "rgba(56, 189, 248, 0.15)"
                  : "rgba(2, 59, 106, 0.1)"
                : isDark
                  ? "rgba(168, 85, 247, 0.2)"
                  : "#F3E8FF",
            color: role === "ADMIN" ? primary : isDark ? "#D8B4FE" : "#7E22CE",
          }}
        >
          {role}
        </span>
      ),
    },
    {
      title: t("admin.messages.date").toUpperCase(),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (date) => (
        <span
          className="text-[13px]"
          style={{ color: textSub, whiteSpace: "nowrap" }}
        >
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: t("admin.projects.status").toUpperCase(),
      dataIndex: "actif",
      key: "actif",
      width: 120,
      render: (actif, record) =>
        record.pendingInvitation ? (
          <Tag
            icon={<ClockCircleOutlined />}
            color="warning"
            style={{ borderRadius: 999, padding: "2px 10px", fontWeight: 600 }}
          >
            {t("admin.users.invite.pending")}
          </Tag>
        ) : (
        <StatusToggle
          userId={record.id}
          initialStatus={actif}
          // force le re-render quand le statut change
          key={`${record.id}-${actif}`}
        />
      ),
    },
    {
      title: t("admin.projects.action").toUpperCase(),
      key: "action",
      align: "right",
      fixed: "right", // reste visible pendant le scroll horizontal
      width: actionWidth,
      render: (_, record) => (
        // flex-nowrap : les boutons restent sur UNE ligne (la largeur est fixe)
        <div
          className="flex justify-end flex-nowrap"
          style={{ gap: isMobile ? 4 : 8 }}
        >
          {/* View */}
          <button
            onClick={() => handleViewDetails(record)}
            title="Voir"
            className={`flex items-center gap-1.5 ${btnPad} border rounded-md text-[12px] font-medium hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors cursor-pointer`}
            style={{
              color: textMain,
              borderColor: border,
              backgroundColor: bgCard,
            }}
          >
            <EyeOutlined />
          </button>

          {/* Edit */}
          <button
            onClick={() => handleEditUser(record)}
            title="Modifier"
            className={`flex items-center gap-1.5 ${btnPad} rounded-md text-[12px] font-medium text-white transition-colors cursor-pointer`}
            style={{
              backgroundColor: primary,
              borderColor: primary,
              borderWidth: 1,
              borderStyle: "solid",
            }}
          >
            <EditOutlined />
          </button>

          {/* Invitation en attente : renvoyer (nouveau lien + nouveau code) */}
          {record.pendingInvitation ? (
            <Popconfirm
              title={t("admin.users.invite.resendTitle")}
              description={t("admin.users.invite.resendDesc")}
              onConfirm={() => handleResendInvitation(record)}
              okText={t("admin.users.invite.resend")}
              cancelText={t("admin.users.cancel")}
              placement="topRight"
              okButtonProps={{ loading: resending }}
            >
              <button
                title={t("admin.users.invite.resend")}
                className={`flex items-center gap-1.5 ${btnPad} rounded-md text-[12px] font-medium transition-colors cursor-pointer border bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100`}
                style={{ whiteSpace: "nowrap" }}
              >
                <MailOutlined /> {!isMobile && t("admin.users.invite.resend")}
              </button>
            </Popconfirm>
          ) : (
          <Popconfirm
            title={
              record.actif ? "Désactiver ce compte ?" : "Activer ce compte ?"
            }
            description={
              record.actif
                ? "L'utilisateur ne pourra plus se connecter."
                : "L'utilisateur pourra à nouveau se connecter."
            }
            onConfirm={() => handleToggleStatus(record)}
            okText={record.actif ? "Désactiver" : "Activer"}
            cancelText="Annuler"
            placement="topRight"
            okButtonProps={{
              danger: record.actif,
              loading: activating || deactivating,
            }}
          >
            <button
              title={record.actif ? "Désactiver" : "Activer"}
              className={`flex items-center gap-1.5 ${btnPad} rounded-md text-[12px] font-medium transition-colors cursor-pointer border ${
                record.actif
                  ? "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
                  : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
              }`}
              style={{ whiteSpace: "nowrap" }}
            >
              {record.actif ? (
                <>
                  <StopOutlined /> {!isMobile && "Désactiver"}
                </>
              ) : (
                <>
                  <CheckCircleOutlined /> {!isMobile && "Activer"}
                </>
              )}
            </button>
          </Popconfirm>

          )}

          {/* 2FA : téléphone perdu */}
          {record.mfaEnabled && (
            <Popconfirm
              title={t("mfa.reset.title")}
              description={<span style={{ maxWidth: 260, display: "block" }}>{t("mfa.reset.desc")}</span>}
              onConfirm={() => handleResetMfa(record)}
              okText={t("mfa.reset.ok")}
              cancelText={t("admin.users.cancel")}
              placement="topRight"
              okButtonProps={{ danger: true, loading: resettingMfa }}
            >
              <button
                title={t("mfa.reset.ok")}
                className={`flex items-center gap-1.5 ${btnPad} rounded-md text-[12px] font-medium transition-colors cursor-pointer border bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100`}
              >
                <SafetyCertificateOutlined />
              </button>
            </Popconfirm>
          )}

          {/* Delete */}
          <Popconfirm
            title="Supprimer ce compte ?"
            description="Cette action est irréversible."
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            placement="topRight"
            okButtonProps={{ danger: true, loading: deleting }}
          >
            <button
              title="Supprimer"
              className={`flex items-center gap-1.5 ${btnPad} bg-red-50 border border-red-200 rounded-md text-[12px] font-medium text-red-500 hover:bg-red-100 transition-colors cursor-pointer`}
            >
              <DeleteOutlined />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div
      className="pb-10 font-['Poppins',sans-serif] w-full"
      style={{ minWidth: 0 }}
    >
      {/* CSS : barre de scroll invisible */}
      <style>{hideScrollbarCss}</style>

      {/* HEADER */}
      <div
        className="flex items-stretch"
        style={{
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "stretch" : "flex-start",
          gap: 12,
          marginBottom: isMobile ? 20 : 32,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            className="font-bold mb-1"
            style={{ color: primary, fontSize: isMobile ? 22 : 26 }}
          >
            {t("admin.users.title")}
          </h1>
          <p className="text-[13px] m-0" style={{ color: textSub }}>
            {isFetching
              ? "Actualisation..."
              : `${allUsers.length} utilisateur(s) dans le système.`}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="text-white px-5 py-2.5 rounded-lg font-bold text-sm border-none cursor-pointer transition-colors flex items-center justify-center gap-2"
          style={{
            backgroundColor: primary,
            width: isMobile ? "100%" : "auto",
            flexShrink: 0,
          }}
        >
          <span>+</span> {t("admin.users.addUser")}
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className={isMobile ? "mb-4" : "mb-6"}>
        <Input
          placeholder="Rechercher par nom ou email..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg py-2 shadow-sm"
          style={{
            width: isMobile ? "100%" : 280,
            borderColor: border,
            backgroundColor: bgCard,
          }}
          allowClear
        />
      </div>

      {/* TABLE */}
      <div
        className="users-table-wrap rounded-xl shadow-sm"
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${border}`,
          // PAS de overflow:hidden : il bloque le scroll horizontal du tableau
          overflow: "visible",
        }}
      >
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={users.map((u) => ({ ...u, key: u.id }))}
            size={isMobile ? "small" : "middle"}
            scroll={{ x: tableMinWidth }}
            pagination={{
              pageSize: 10,
              size: isMobile ? "small" : "default",
              simple: isMobile,
              showTotal: (total) => `${total} utilisateur(s)`,
              showSizeChanger: false,
            }}
          />
        )}
      </div>

      {/* ADD USER MODAL */}
      <ActivationCodeModal
        invitation={invitation}
        onClose={() => setInvitation(null)}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* USER DETAILS MODAL */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        user={selectedUser}
      />

      {/* EDIT USER MODAL */}
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
      />
    </div>
  );
}
