import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdminTheme } from "../AdminThemeContext";
import DashboardHeader from "./DashboardHeader";
import StatCard from "./StatCard";
import WebsiteVisitChart from "./WebsiteVisitChart";
import QuickActions from "./QuickActions";
import ReviewEnquiries from "./ReviewEnquiries";
import RecentActivity from "./RecentActivity";
import AIConversations from "./AIConversations";
import { Skeleton } from "antd";

import {
  IconProjects,
  IconMessages,
  IconAIChat,
  IconUsers,
  IconNews,
} from "../component/AdminIcons";

import { useGetDashboardStatsQuery } from "../../../services/api/dashboardApi";

function StatSkeleton() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#F1F5F9";
  const border = isDark ? "#334155" : "#E2E8F0";
  return (
    <div
      style={{
        backgroundColor: bgCard,
        border: `1px solid ${border}`,
        borderRadius: 16,
        padding: 20,
        height: 130,
      }}
    >
      <Skeleton active paragraph={{ rows: 2 }} />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const isDark = useAdminTheme();
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const stats = statsData?.data ?? null;

  const STATS = [
    {
      title: "Published Projects",
      value: stats ? String(stats.publishedProjects).padStart(2, "0") : "—",
      icon: <IconProjects />,
      iconBg:    isDark ? "#312E81" : "#EDE9FE",
      iconColor: isDark ? "#A5B4FC" : "#6C5CE7",
      cardBg:    isDark ? "#1E1B4B" : "#F1EEFC",
      cardBorder:isDark ? "#4338CA" : "#DDD6FE",
      textColor: isDark ? "#A5B4FC" : "#3730A3",
      subtitle: `${stats?.totalProjects ?? "…"} total projects`,
      onClick: () => navigate("/admin/projects"),
    },
    {
      title: "New Messages",
      value: stats ? String(stats.unreadMessages).padStart(2, "0") : "—",
      icon: <IconMessages />,
      iconBg:    isDark ? "#064E3B" : "#D1FAE5",
      iconColor: isDark ? "#6EE7B7" : "#059669",
      cardBg:    isDark ? "#022C22" : "#E4F9EF",
      cardBorder:isDark ? "#065F46" : "#A7F3D0",
      textColor: isDark ? "#34D399" : "#065F46",
      subtitle: `${stats?.totalMessages ?? "…"} total messages`,
      onClick: () => navigate("/admin/messages"),
    },
    {
      title: "AI Conversations",
      value: stats ? String(stats.activeChatSessions).padStart(2, "0") : "—",
      icon: <IconAIChat />,
      iconBg:    isDark ? "#713F12" : "#FEF3C7",
      iconColor: isDark ? "#FDE047" : "#D97706",
      cardBg:    isDark ? "#422006" : "#FDF6DC",
      cardBorder:isDark ? "#92400E" : "#FDE68A",
      textColor: isDark ? "#FCD34D" : "#92400E",
      subtitle: `${stats?.totalChatSessions ?? "…"} total sessions`,
      onClick: () => navigate("/admin/aichat"),
    },
    {
      title: "Administration",
      value: stats ? String(stats.adminCount).padStart(2, "0") : "—",
      icon: <IconUsers />,
      iconBg:    isDark ? "#7F1D1D" : "#FEE2E2",
      iconColor: isDark ? "#FCA5A5" : "#DC2626",
      cardBg:    isDark ? "#450A0A" : "#FCEAEC",
      cardBorder:isDark ? "#991B1B" : "#FECACA",
      textColor: isDark ? "#F87171" : "#991B1B",
      subtitle: `${stats?.totalUsers ?? "…"} total users`,
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Published News",
      value: stats ? String(stats.publishedArticles).padStart(2, "0") : "—",
      icon: <IconNews />,
      iconBg:    isDark ? "#1E3A8A" : "#DBEAFE",
      iconColor: isDark ? "#93C5FD" : "#2563EB",
      cardBg:    isDark ? "#172554" : "#E8F2FC",
      cardBorder:isDark ? "#1D4ED8" : "#BFDBFE",
      textColor: isDark ? "#60A5FA" : "#1E40AF",
      subtitle: `${stats?.totalArticles ?? "…"} total articles`,
      onClick: () => navigate("/admin/news"),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <DashboardHeader />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
          : STATS.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, height: 450 }}>
        <WebsiteVisitChart />
        <QuickActions />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        <ReviewEnquiries />
        <RecentActivity />
      </div>

      <AIConversations />
    </div>
  );
}
