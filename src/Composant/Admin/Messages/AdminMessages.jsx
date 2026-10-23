import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAdminTheme } from "../AdminThemeContext";
import {
  Table,
  Input,
  Button,
  Segmented,
  Tag,
  Popconfirm,
  message,
  Grid,
} from "antd";
import {
  EyeOutlined,
  MailOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AvatarWithPopover from "../Users/AvatarWithPopover";
import {
  useGetAllContactsQuery,
  useGetUnreadContactsQuery,
  useMarkAsReadMutation,
  useDeleteContactMutation,
} from "../../../services/api/contactApi";
import {
  useGetAllConsultationsQuery,
  useGetUnreadConsultationsQuery,
  useMarkConsultationAsReadMutation,
  useDeleteConsultationMutation,
} from "../../../services/api/consultationApi";

// Largeur totale du tableau = 200+200+220+140+170+110+150 = 1190px
// (somme des `width` des colonnes ci-dessous)
const TABLE_MIN_WIDTH = 1190;

// CSS pour masquer la barre de scroll du tableau (le scroll reste actif)
const hideScrollbarCss = `
  .messages-table-wrap .ant-table-content,
  .messages-table-wrap .ant-table-body,
  .messages-table-wrap .ant-table-container {
    scrollbar-width: none;          /* Firefox */
    -ms-overflow-style: none;       /* IE / ancien Edge */
    -webkit-overflow-scrolling: touch;
  }
  .messages-table-wrap .ant-table-content::-webkit-scrollbar,
  .messages-table-wrap .ant-table-body::-webkit-scrollbar,
  .messages-table-wrap .ant-table-container::-webkit-scrollbar {
    display: none;                  /* Chrome, Safari, mobiles */
    width: 0;
    height: 0;
  }
`;

// --- Main Component ---
export default function AdminMessages() {
  const isDark = useAdminTheme();
  const { t } = useTranslation();
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;

  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";

  const [activeType, setActiveType] = useState("Contact"); // 'Contact' or 'Consultation'
  const [activeStatus, setActiveStatus] = useState("Tous"); // 'Tous' or 'Non lus'

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const navigate = useNavigate();

  // Contact Queries
  const {
    data: allContacts,
    isLoading: loadingAllContacts,
    isFetching: fetchingAllContacts,
  } = useGetAllContactsQuery(
    { page, size, sort: "createdAt" },
    { skip: activeType !== "Contact" || activeStatus !== "Tous" },
  );
  const {
    data: unreadContacts,
    isLoading: loadingUnreadContacts,
    isFetching: fetchingUnreadContacts,
  } = useGetUnreadContactsQuery(
    { page, size },
    { skip: activeType !== "Contact" || activeStatus !== "Non lus" },
  );

  // Consultation Queries
  const {
    data: allConsultations,
    isLoading: loadingAllConsultations,
    isFetching: fetchingAllConsultations,
  } = useGetAllConsultationsQuery(
    { page, size, sort: "createdAt" },
    { skip: activeType !== "Consultation" || activeStatus !== "Tous" },
  );
  const {
    data: unreadConsultations,
    isLoading: loadingUnreadConsultations,
    isFetching: fetchingUnreadConsultations,
  } = useGetUnreadConsultationsQuery(
    { page, size },
    { skip: activeType !== "Consultation" || activeStatus !== "Non lus" },
  );

  // Mutations
  const [markContactAsRead] = useMarkAsReadMutation();
  const [deleteContact] = useDeleteContactMutation();
  const [markConsultationAsRead] = useMarkConsultationAsReadMutation();
  const [deleteConsultation] = useDeleteConsultationMutation();

  const handleMarkAsRead = async (id) => {
    try {
      if (activeType === "Contact") {
        await markContactAsRead(id).unwrap();
      } else {
        await markConsultationAsRead(id).unwrap();
      }
      message.success("Message marqué comme lu.");
    } catch (err) {
      message.error("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (activeType === "Contact") {
        await deleteContact(id).unwrap();
      } else {
        await deleteConsultation(id).unwrap();
      }
      message.success("Message supprimé avec succès.");
    } catch (err) {
      message.error("Erreur lors de la suppression.");
    }
  };

  let dataSource = [];
  let totalElements = 0;
  let isLoading = false;

  if (activeType === "Contact") {
    isLoading =
      activeStatus === "Tous"
        ? loadingAllContacts || fetchingAllContacts
        : loadingUnreadContacts || fetchingUnreadContacts;
    const data =
      activeStatus === "Tous" ? allContacts?.data : unreadContacts?.data;
    if (data?.content) {
      dataSource = data.content;
      totalElements = data.totalElements;
    }
  } else {
    isLoading =
      activeStatus === "Tous"
        ? loadingAllConsultations || fetchingAllConsultations
        : loadingUnreadConsultations || fetchingUnreadConsultations;
    const data =
      activeStatus === "Tous"
        ? allConsultations?.data
        : unreadConsultations?.data;
    if (data?.content) {
      dataSource = data.content;
      totalElements = data.totalElements;
    }
  }

  // Filter local search on the current page data
  const filteredData = dataSource.filter((m) => {
    const q = search.toLowerCase();
    const nomField = activeType === "Contact" ? m.nom : m.fullName;
    const objetField = activeType === "Contact" ? m.objet : m.serviceOfInterest;

    return (
      !q ||
      (nomField && nomField.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (objetField && objetField.toLowerCase().includes(q))
    );
  });

  // Colonnes — largeurs fixes pour le scroll horizontal mobile
  const columns = [
    {
      title: t("admin.messages.name").toUpperCase(),
      dataIndex: activeType === "Contact" ? "nom" : "fullName",
      key: "name",
      width: 200,
      render: (text, record) => {
        const name = activeType === "Contact" ? record.nom : record.fullName;
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
            }}
          >
            <AvatarWithPopover name={name || "Anonyme"} email={record.email} />
            <span
              style={{
                color: textMain,
                fontWeight: 600,
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 120,
              }}
            >
              {name || "Anonyme"}
            </span>
          </div>
        );
      },
    },
    {
      title: t("admin.messages.subject").toUpperCase(),
      dataIndex: activeType === "Contact" ? "objet" : "serviceOfInterest",
      key: "subject",
      width: 200,
      render: (text) => (
        <span
          title={text}
          style={{
            color: textMain,
            fontSize: 13,
            display: "block",
            maxWidth: 170,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: t("admin.messages.email").toUpperCase(),
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (email) => (
        <a
          href={`mailto:${email}`}
          title={email}
          style={{
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 4,
            maxWidth: 190,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <MailOutlined style={{ fontSize: 11, flexShrink: 0 }} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {email}
          </span>
        </a>
      ),
    },
    {
      title: t("admin.users.phone").toUpperCase(),
      dataIndex: activeType === "Contact" ? "telephone" : "phone",
      key: "phone",
      width: 140,
      render: (text) => (
        <span style={{ color: textMain, fontSize: 13, whiteSpace: "nowrap" }}>
          {text || "-"}
        </span>
      ),
    },
    {
      title: t("admin.messages.date").toUpperCase(),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 170,
      render: (text) => {
        if (!text) return "-";
        return (
          <span style={{ color: textSub, fontSize: 13, whiteSpace: "nowrap" }}>
            {new Date(text).toLocaleString()}
          </span>
        );
      },
    },
    {
      title: "STATUT",
      dataIndex: "lu",
      key: "lu",
      width: 110,
      render: (lu, record) => {
        if (lu) {
          return (
            <Tag
              color="green"
              icon={<CheckCircleOutlined />}
              style={{ margin: 0 }}
            >
              Lu
            </Tag>
          );
        }
        return (
          <Popconfirm
            title="Marquer comme lu ?"
            onConfirm={() => handleMarkAsRead(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Tag
              color="gold"
              icon={<SyncOutlined />}
              style={{ cursor: "pointer", margin: 0 }}
            >
              Non lu
            </Tag>
          </Popconfirm>
        );
      },
    },
    {
      title: t("admin.messages.actions").toUpperCase(),
      key: "action",
      align: "right",
      fixed: "right", // reste visible pendant le scroll horizontal
      width: 150,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() =>
              navigate(`/admin/messages/preview/${record.id}`, {
                state: { record, type: activeType },
              })
            }
            style={{
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 12,
              color: textMain,
              backgroundColor: bgCard,
              borderColor: border,
            }}
          >
            {!isMobile && "Voir"}
          </Button>
          <Popconfirm
            title="Supprimer ce message ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Oui"
            cancelText="Non"
            placement="topRight"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              style={{ borderRadius: 6 }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 16 : 24,
        paddingBottom: 40,
        fontFamily: "'Poppins', sans-serif",
        width: "100%",
      }}
    >
      {/* CSS : barre de scroll invisible */}
      <style>{hideScrollbarCss}</style>

      {/* HEADER */}
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            fontSize: isMobile ? 22 : 26,
            fontWeight: 700,
            color: textMain,
            margin: "0 0 4px",
          }}
        >
          {t("admin.messages.title")}
        </h1>
        <p style={{ fontSize: 13, color: textSub, margin: 0 }}>
          Gérez les messages de contact et les requêtes de consultation reçus
          via le site web COMPULEC.
        </p>
      </div>

      {/* TOOLBAR */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          alignItems: isMobile ? "stretch" : "center",
          gap: 12,
        }}
      >
        {/* Search */}
        <Input
          placeholder="Rechercher par nom, email ou sujet..."
          prefix={<span style={{ color: "#94A3B8", fontSize: 14 }}>🔍</span>}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: isMobile ? "100%" : 300,
            borderRadius: 8,
          }}
          allowClear
        />

        {/* Type Tabs */}
        <Segmented
          block={isMobile}
          options={[
            { label: "Contact", value: "Contact" },
            { label: "Consultation", value: "Consultation" },
          ]}
          value={activeType}
          onChange={(val) => {
            setActiveType(val);
            setPage(0);
          }}
          style={{ borderRadius: 8, fontWeight: 600 }}
        />

        {/* Status Tabs */}
        <Segmented
          block={isMobile}
          options={[
            { label: isMobile ? "Tous" : "Tous les messages", value: "Tous" },
            { label: "Non lus", value: "Non lus" },
          ]}
          value={activeStatus}
          onChange={(val) => {
            setActiveStatus(val);
            setPage(0);
          }}
          style={{ borderRadius: 8, fontWeight: 600 }}
        />
      </div>

      {/* TABLE */}
      <div
        className="messages-table-wrap"
        style={{
          backgroundColor: bgCard,
          border: `1px solid ${border}`,
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          /* PAS de overflow:hidden ici — il bloque le scroll horizontal du tableau */
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: TABLE_MIN_WIDTH }}
          pagination={{
            position: ["bottomRight"],
            current: page + 1,
            pageSize: size,
            total: totalElements,
            size: isMobile ? "small" : "default",
            simple: isMobile,
            showSizeChanger: false,
            onChange: (p, s) => {
              setPage(p - 1);
              setSize(s);
            },
          }}
        />
      </div>
    </div>
  );
}
