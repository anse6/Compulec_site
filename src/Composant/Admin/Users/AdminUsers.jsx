import React, { useState } from "react";
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
            <div className="font-semibold text-slate-900 dark:text-white text-[13px]">
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
        <span className="text-[13px] text-slate-700 dark:text-slate-200">{text}</span>
      ),
    },
    {
      title: "RÔLE",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <span
          className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
            role === "ADMIN"
              ? "bg-[#023B6A]/10 text-[#023B6A]"
              : "bg-purple-100 text-purple-700"
          }`}
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
        <span className="text-[13px] text-slate-500 dark:text-slate-400">{formatDate(date)}</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-[12px] font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <EyeOutlined />
          </button>

          {/* Edit */}
          <button
            onClick={() => handleEditUser(record)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#023B6A] border border-[#023B6A] rounded-md text-[12px] font-medium text-white hover:bg-[#04305a] transition-colors cursor-pointer"
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
            <h1 className="text-[26px] font-bold text-[#023B6A] mb-1">Users</h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 m-0">
              {isFetching
                ? "Actualisation..."
                : `${allUsers.length} utilisateur(s) dans le système.`}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#023B6A] text-white px-5 py-2.5 rounded-lg font-bold text-sm border-none cursor-pointer hover:bg-[#04305a] transition-colors flex items-center gap-2"
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
            className="rounded-lg py-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
            allowClear
          />
        </div>

        {/* TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
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
