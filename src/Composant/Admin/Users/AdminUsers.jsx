import React, { useState, useEffect } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import {
  Input,
  Table,
  ConfigProvider,
  theme,
  Popconfirm,
  message as antMessage,
  Spin,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import AddUserModal from "./AddUserModal";
import UserDetailsModal from "./UserDetailsModal";
import AvatarWithPopover from "./AvatarWithPopover";
import StatusToggle from "./StatusToggle";
import EditUserModal from "./EditUserModal";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from "../../../services/api/usersApi";

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function AdminUsers() {
  const isDark = useAdminTheme();
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

  // ── API ──────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page: 0,
    size: 50,
  });
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();
  const [activateUser, { isLoading: activating }] = useActivateUserMutation();
  const [deactivateUser, { isLoading: deactivating }] =
    useDeactivateUserMutation();

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

  // ── Handlers ─────────────────────────────────────────────────────────
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

  // ── Columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title: "NAME",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <AvatarWithPopover
            name={`${record.prenom} ${record.nom}`}
            email={record.email}
          />
          <div>
            <div className="font-semibold  text-[13px]" style={{ color: textMain }}>
              {record.prenom} {record.nom}
            </div>
            <div className="text-[11px] text-slate-400">
              {record.fonction || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "EMAIL",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <span className="text-[13px] " style={{ color: textMain }}>{text}</span>
      ),
    },
    {
      title: "RÔLE",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          className="text-[12px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: role === "ADMIN" ? (isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(2, 59, 106, 0.1)") : (isDark ? "rgba(168, 85, 247, 0.2)" : "#F3E8FF"), color: role === "ADMIN" ? primary : (isDark ? "#D8B4FE" : "#7E22CE") }}
        >
          {role}
        </span>
      ),
    },
    {
      title: "CRÉÉ LE",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span className="text-[13px] " style={{ color: textSub }}>{formatDate(date)}</span>
      ),
    },
    {
      title: "STATUS",
      dataIndex: "actif",
      key: "actif",
      render: (actif, record) => (
        <StatusToggle
          userId={record.id}
          initialStatus={actif}
          // force le re-render quand le statut change
          key={`${record.id}-${actif}`}
        />
      ),
    },
    {
      title: "ACTION",
      key: "action",
      align: "right",
      render: (_, record) => (
        <div className="flex justify-end gap-2 flex-wrap">
          {/* View */}
          <button
            onClick={() => handleViewDetails(record)}
            className="flex items-center gap-1.5 px-3 py-1.5  border  rounded-md text-[12px] font-medium  hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors cursor-pointer" style={{ color: textMain }} style={{ borderColor: border }} style={{ backgroundColor: bgCard }}
          >
            <EyeOutlined />
          </button>

          {/* Edit */}
          <button
            onClick={() => handleEditUser(record)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium text-white transition-colors cursor-pointer" style={{ backgroundColor: primary, borderColor: primary, borderWidth: 1, borderStyle: "solid" }}
          >
            <EditOutlined />
          </button>

          {/* Activer / Désactiver */}
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
            okButtonProps={{
              danger: record.actif,
              loading: activating || deactivating,
            }}
          >
            <button
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors cursor-pointer border ${
                record.actif
                  ? "bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
                  : "bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
              }`}
            >
              {record.actif ? (
                <>
                  <StopOutlined /> Désactiver
                </>
              ) : (
                <>
                  <CheckCircleOutlined /> Activer
                </>
              )}
            </button>
          </Popconfirm>

          {/* Delete */}
          <Popconfirm
            title="Supprimer ce compte ?"
            description="Cette action est irréversible."
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okButtonProps={{ danger: true, loading: deleting }}
          >
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md text-[12px] font-medium text-red-500 hover:bg-red-100 transition-colors cursor-pointer">
              <DeleteOutlined />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  

  return (
    
      <div className="pb-10 font-['Poppins',sans-serif] w-full">
        {/* HEADER */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[26px] font-bold  mb-1" style={{ color: primary }}>Users</h1>
            <p className="text-[13px]  m-0" style={{ color: textSub }}>
              {isFetching
                ? "Actualisation..."
                : `${allUsers.length} utilisateur(s) dans le système.`}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-white px-5 py-2.5 rounded-lg font-bold text-sm border-none cursor-pointer transition-colors flex items-center gap-2" style={{ backgroundColor: primary }}
          >
            <span>+</span> Add Manager
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-6">
          <Input
            placeholder="Rechercher par nom ou email..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 280 }}
            className="rounded-lg py-2   shadow-sm" style={{ borderColor: border }} style={{ backgroundColor: bgCard }}
            allowClear
          />
        </div>

        {/* TABLE */}
        <div className=" rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={users.map((u) => ({ ...u, key: u.id }))}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `${total} utilisateur(s)`,
                showSizeChanger: false,
              }}
            />
          )}
        </div>

        {/* ADD USER MODAL */}
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
