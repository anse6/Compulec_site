import React from "react";
import { Tag, Button, Skeleton, Table } from "antd";
import { useTranslation } from "react-i18next";
import {
  EyeOutlined,
  UserSwitchOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useAdminTheme } from "../AdminThemeContext";
import WidgetError from "./WidgetError";
import { formatDashboardDate } from "./dashboardFormat";
import {
  useGetDashboardAiSessionsQuery,
  DASHBOARD_QUERY_OPTIONS,
} from "../../../services/api/dashboardApi";
import useMediaQuery from "../../../hooks/useMediaQuery";

// Statuts de ChatSessionStatus (backend) ; libellés : admin.dashboard.chatStatus.<STATUT>
const TRANSFER_STATUS_CONFIG = {
  WAITING_ADMIN: { color: "gold", icon: <UserSwitchOutlined /> },
  WITH_ADMIN: { color: "blue", icon: <SearchOutlined /> },
  ACTIVE: { color: "green", icon: <CheckCircleOutlined /> },
  CLOSED: { color: "default", icon: <CheckCircleOutlined /> },
};

function TransferStatusTag({ status }) {
  const { t } = useTranslation();
  const cfg = TRANSFER_STATUS_CONFIG[status] || {
    color: "default",
    icon: <WarningOutlined />,
  };
  return (
    <Tag
      icon={cfg.icon}
      color={cfg.color}
      style={{
        borderRadius: 999,
        padding: "2px 10px",
        fontWeight: 600,
        margin: 0,
        fontSize: 11,
      }}
    >
      {t(`admin.dashboard.chatStatus.${status}`, { defaultValue: status })}
    </Tag>
  );
}

function shortToken(token) {
  if (!token) return "—";
  return "#" + token.substring(0, 8).toUpperCase();
}

export default function AIConversations() {
  const navigate = useNavigate();
  const isDark = useAdminTheme();
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery("(max-width: 639px)");

  const bgCard = isDark ? "#1E293B" : "#fff";
  const border = isDark ? "#334155" : "#EEF2F7";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";
  const hoverBg = isDark ? "#243247" : "#F8FAFC";

  const { data, isLoading, isError, refetch } = useGetDashboardAiSessionsQuery(8, DASHBOARD_QUERY_OPTIONS);
  const sessions = data?.data ?? [];

  const cellPadding = isMobile ? "12px 14px" : "16px 24px";

  // Styles scopés sur .ai-conv-table (thème + scrollbar invisible)
  const tableCss = `
    .ai-conv-table .ant-table {
      background: transparent;
      color: ${textMain};
    }
    .ai-conv-table .ant-table-thead > tr > th {
      background: transparent !important;
      color: ${textSub} !important;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: ${cellPadding};
      border-bottom: 1px solid ${border};
      white-space: nowrap;
    }
    .ai-conv-table .ant-table-thead > tr > th::before {
      display: none !important;
    }
    .ai-conv-table .ant-table-tbody > tr > td {
      background: transparent;
      padding: ${cellPadding};
      font-size: 13px;
      border-bottom: 1px solid ${border};
      white-space: nowrap;
    }
    .ai-conv-table .ant-table-tbody > tr:last-child > td {
      border-bottom: none;
    }
    .ai-conv-table .ant-table-tbody > tr.ant-table-row:hover > td {
      background: ${hoverBg} !important;
    }
    .ai-conv-table .ant-table-cell-fix-right,
    .ai-conv-table .ant-table-cell-fix-left {
      background: ${bgCard} !important;
    }
    .ai-conv-table .ant-table-tbody > tr.ant-table-row:hover > td.ant-table-cell-fix-right {
      background: ${hoverBg} !important;
    }

    /* Défilement actif mais barre de scroll invisible */
    .ai-conv-table .ant-table-content,
    .ai-conv-table .ant-table-body,
    .ai-conv-table .ant-table-container {
      scrollbar-width: none;            /* Firefox */
      -ms-overflow-style: none;         /* IE / ancien Edge */
      -webkit-overflow-scrolling: touch;
    }
    .ai-conv-table .ant-table-content::-webkit-scrollbar,
    .ai-conv-table .ant-table-body::-webkit-scrollbar,
    .ai-conv-table .ant-table-container::-webkit-scrollbar {
      display: none;                    /* Chrome / Safari / Android */
      width: 0;
      height: 0;
    }
  `;

  const columns = [
    {
      title: t("admin.aiChat.sessionActive"),
      dataIndex: "sessionToken",
      key: "sessionToken",
      render: (v) => (
        <span style={{ fontWeight: 700, color: primary }}>{shortToken(v)}</span>
      ),
    },
    {
      title: t("admin.aiChat.visitor"),
      dataIndex: "visitorName",
      key: "visitorName",
      render: (v) => (
        <span style={{ fontWeight: 600, color: primary }}>{v || "—"}</span>
      ),
    },
    {
      title: t("admin.messages.email"),
      dataIndex: "visitorEmail",
      key: "visitorEmail",
      render: (v) => <span style={{ color: textSub }}>{v || "—"}</span>,
    },
    {
      title: t("admin.dashboard.lastActivity"),
      dataIndex: "lastActivityAt",
      key: "lastActivityAt",
      render: (v) => (
        <span style={{ color: textSub }}>{formatDashboardDate(v, t, i18n.language)}</span>
      ),
    },
    {
      title: t("admin.dashboard.status"),
      dataIndex: "status",
      key: "status",
      render: (v) => <TransferStatusTag status={v} />,
    },
    {
      title: t("admin.projects.action"),
      key: "action",
      align: "right",
      fixed: isMobile ? "right" : undefined,
      render: () => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate("/admin/aichat")}
          style={{
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 12,
            color: textMain,
            backgroundColor: bgCard,
            borderColor: border,
          }}
        >
          {!isMobile && t("admin.common.view")}
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          background: bgCard,
          borderRadius: 18,
          border: `1px solid ${border}`,
          padding: isMobile ? 16 : 24,
        }}
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div
      style={{
        background: bgCard,
        borderRadius: isMobile ? 14 : 18,
        border: `1px solid ${border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        marginTop: isMobile ? 0 : 24,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <style>{tableCss}</style>

      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? 8 : 16,
          padding: isMobile ? 16 : 24,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              fontWeight: 800,
              fontSize: isMobile ? 16 : 18,
              color: textMain,
              margin: "0 0 4px",
            }}
          >
            {t("admin.dashboard.aiConversations")}
          </h3>
          <p
            style={{ fontSize: isMobile ? 12 : 13, color: textSub, margin: 0 }}
          >
            {t("admin.dashboard.aiConversationsSubtitle")}
          </p>
        </div>
        <Link
          to="/admin/aichat"
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: primary,
            textDecoration: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {t("admin.dashboard.openAiChat")}
        </Link>
      </div>

      {isError ? (
        <WidgetError onRetry={refetch} />
      ) : sessions.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "#94A3B8",
            fontSize: 13,
          }}
        >
          {t("admin.dashboard.noAiSessions")}
        </div>
      ) : (
        <Table
          className="ai-conv-table"
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          pagination={false}
          scroll={{ x: "max-content" }}
          size={isMobile ? "small" : "middle"}
        />
      )}
    </div>
  );
}
