import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import WebsiteVisitChart from "./WebsiteVisitChart";
import QuickActions from "./QuickActions";
import ReviewEnquiries from "./ReviewEnquiries";
import RecentActivity from "./RecentActivity";
import AIConversations from "./AIConversations";
import { Skeleton } from "antd";

// Icônes des cartes stats
import {
  IconProjects,
  IconMessages,
  IconAIChat,
  IconUsers,
  IconNews,
} from "../component/AdminIcons";

import { useGetDashboardStatsQuery } from "../../../services/api/dashboardApi";

//  Skeleton fallback
function StatSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "var(--ant-color-bg-layout)",
        border: "1px solid var(--ant-color-border-secondary)",
        borderRadius: 16,
        padding: 20,
        height: 130,
      }}
    >
      <Skeleton active paragraph={{ rows: 2 }} />
    </div>
  );
}

//  Page principale Dashboard
export default function Dashboard() {
  const navigate = useNavigate();
  const { data: statsData, isLoading: statsLoading } =
    useGetDashboardStatsQuery();
  const stats = statsData?.data ?? null;

  // Configuration des cartes avec données dynamiques
  const STATS = [
    {
      title: "Published Projects",
      value: stats ? String(stats.publishedProjects).padStart(2, "0") : "—",
      icon: <IconProjects />,
      iconBg: "#EDE9FE", // ── violet clair (au lieu de blanc) pour contraster avec la boîte blanche
      iconColor: "#6C5CE7",
      cardBg: "#F1EEFC",
      cardBorder: "#DDD6FE",
      textColor: "#3730A3",
      subtitle: `${stats?.totalProjects ?? "…"} total projects`,
      footer: "",
      onClick: () => navigate("/admin/projects"),
    },
    {
      title: "New Messages",
      value: stats ? String(stats.unreadMessages).padStart(2, "0") : "—",
      icon: <IconMessages />,
      iconBg: "#D1FAE5", // ── vert clair
      iconColor: "#059669",
      cardBg: "#E4F9EF",
      cardBorder: "#A7F3D0",
      textColor: "#065F46",
      subtitle: `${stats?.totalMessages ?? "…"} total messages`,
      footer: "",
      onClick: () => navigate("/admin/messages"),
    },
    {
      title: "AI Conversations",
      value: stats ? String(stats.activeChatSessions).padStart(2, "0") : "—",
      icon: <IconAIChat />,
      iconBg: "#FEF3C7", // ── jaune clair
      iconColor: "#D97706",
      cardBg: "#FDF6DC",
      cardBorder: "#FDE68A",
      textColor: "#92400E",
      subtitle: `${stats?.totalChatSessions ?? "…"} total sessions`,
      footer: "",
      onClick: () => navigate("/admin/aichat"),
    },
    {
      title: "Administration",
      value: stats ? String(stats.adminCount).padStart(2, "0") : "—",
      icon: <IconUsers />,
      iconBg: "#FEE2E2", // ── rouge clair
      iconColor: "#DC2626",
      cardBg: "#FCEAEC",
      cardBorder: "#FECACA",
      textColor: "#991B1B",
      subtitle: `${stats?.totalUsers ?? "…"} total users`,
      footer: "",
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Published News",
      value: stats ? String(stats.publishedArticles).padStart(2, "0") : "—",
      icon: <IconNews />,
      iconBg: "#DBEAFE", // ── bleu clair
      iconColor: "#2563EB",
      cardBg: "#E8F2FC",
      cardBorder: "#BFDBFE",
      textColor: "#1E40AF",
      subtitle: `${stats?.totalArticles ?? "…"} total articles`,
      footer: "",
      onClick: () => navigate("/admin/news"),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ① En-tête de page */}
      <DashboardHeader />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
        }}
      >
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
          : STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ③ Graphique + Quick Actions côte à côte */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 20,
          height: 450,
        }}
      >
        <WebsiteVisitChart />
        <QuickActions />
      </div>

      {/* ④ Review Enquiries + Recent Activity */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 20,
        }}
      >
        <ReviewEnquiries />
        <RecentActivity />
      </div>

      {/* ⑤ AI Conversations */}
      <AIConversations />
    </div>
  );
}
