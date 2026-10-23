import React from "react";
import { useTranslation } from "react-i18next";
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
import useMediaQuery from "../../../hooks/useMediaQuery";
import useElementWidth from "../../../hooks/useElementWidth";

import {
  IconProjects,
  IconMessages,
  IconAIChat,
  IconUsers,
  IconNews,
} from "../component/AdminIcons";

import WidgetError from "./WidgetError";
import {
  useGetDashboardStatsQuery,
  DASHBOARD_QUERY_OPTIONS,
} from "../../../services/api/dashboardApi";

function StatSkeleton({ style }) {
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
        minWidth: 0,
        boxSizing: "border-box",
        ...style,
      }}
    >
      <Skeleton active paragraph={{ rows: 2 }} />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isDark = useAdminTheme();

  // Largeur réelle de la zone du dashboard (tient compte du menu latéral)
  const [rootRef, rootWidth] = useElementWidth();

  // Breakpoints basés sur l'écran (pour le reste de la page)
  const isMobile = useMediaQuery("(max-width: 639px)");
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");
  const isDesktop = !isMobile && !isTablet;

  // Layout des cartes de stats basé sur la largeur réelle du conteneur
  // (rootWidth = 0 avant la première mesure -> on considère "large")
  const measured = rootWidth > 0;
  const statsSmall = measured && rootWidth < 520; // 2 colonnes
  const statsMedium = measured && rootWidth >= 520 && rootWidth < 860; // 3 + 2
  // sinon : 5 colonnes

  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetDashboardStatsQuery(undefined, DASHBOARD_QUERY_OPTIONS);
  const stats = statsData?.data ?? null;

  const count = (n) => (stats ? String(n ?? 0).padStart(2, "0") : "—");
  const total = (key, n) => (stats ? t(key, { count: n ?? 0 }) : "…");

  const STATS = [
    {
      title: t("admin.dashboard.publishedProjects"),
      value: count(stats?.publishedProjects),
      icon: <IconProjects />,
      iconBg: isDark ? "#312E81" : "#EDE9FE",
      iconColor: isDark ? "#A5B4FC" : "#6C5CE7",
      cardBg: isDark ? "#1E1B4B" : "#F1EEFC",
      cardBorder: isDark ? "#4338CA" : "#DDD6FE",
      textColor: isDark ? "#A5B4FC" : "#3730A3",
      subtitle: total("admin.dashboard.totalProjectsCount", stats?.totalProjects),
      onClick: () => navigate("/admin/projects"),
    },
    {
      title: t("admin.dashboard.unreadMessages"),
      value: count(stats?.unreadMessages),
      icon: <IconMessages />,
      iconBg: isDark ? "#064E3B" : "#D1FAE5",
      iconColor: isDark ? "#6EE7B7" : "#059669",
      cardBg: isDark ? "#022C22" : "#E4F9EF",
      cardBorder: isDark ? "#065F46" : "#A7F3D0",
      textColor: isDark ? "#34D399" : "#065F46",
      subtitle: total("admin.dashboard.totalMessagesCount", stats?.totalMessages),
      onClick: () => navigate("/admin/messages"),
    },
    {
      title: t("admin.dashboard.aiChatSessions"),
      value: count(stats?.activeChatSessions),
      icon: <IconAIChat />,
      iconBg: isDark ? "#713F12" : "#FEF3C7",
      iconColor: isDark ? "#FDE047" : "#D97706",
      cardBg: isDark ? "#422006" : "#FDF6DC",
      cardBorder: isDark ? "#92400E" : "#FDE68A",
      textColor: isDark ? "#FCD34D" : "#92400E",
      subtitle: total("admin.dashboard.totalSessionsCount", stats?.totalChatSessions),
      onClick: () => navigate("/admin/aichat"),
    },
    {
      title: t("admin.dashboard.team"),
      value: count(stats?.activeStaff),
      icon: <IconUsers />,
      iconBg: isDark ? "#7F1D1D" : "#FEE2E2",
      iconColor: isDark ? "#FCA5A5" : "#DC2626",
      cardBg: isDark ? "#450A0A" : "#FCEAEC",
      cardBorder: isDark ? "#991B1B" : "#FECACA",
      textColor: isDark ? "#F87171" : "#991B1B",
      subtitle: total("admin.dashboard.totalUsersCount", stats?.totalUsers),
      onClick: () => navigate("/admin/users"),
    },
    {
      title: t("admin.dashboard.publishedArticles"),
      value: count(stats?.publishedArticles),
      icon: <IconNews />,
      iconBg: isDark ? "#1E3A8A" : "#DBEAFE",
      iconColor: isDark ? "#93C5FD" : "#2563EB",
      cardBg: isDark ? "#172554" : "#E8F2FC",
      cardBorder: isDark ? "#1D4ED8" : "#BFDBFE",
      textColor: isDark ? "#60A5FA" : "#1E40AF",
      subtitle: total("admin.dashboard.totalArticlesCount", stats?.totalArticles),
      onClick: () => navigate("/admin/news"),
    },
  ];

  // Nombre de colonnes de la grille
  //  - petit  : 2 colonnes
  //  - moyen  : 6 colonnes (3 cartes x2, puis 2 cartes x3) -> aucune case vide
  //  - grand  : 5 colonnes
  const statsColumns = statsSmall ? 2 : statsMedium ? 6 : 5;
  const gap = statsSmall ? 12 : 16;

  const getItemStyle = (i) => {
    const isLast = i === STATS.length - 1;

    if (statsSmall) return isLast ? { gridColumn: "1 / -1" } : {};
    if (statsMedium) return { gridColumn: i < 3 ? "span 2" : "span 3" };
    return {};
  };

  return (
    <div
      ref={rootRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isMobile ? 16 : 24,
        width: "100%",
        minWidth: 0,
        overflowX: "hidden",
      }}
    >
      <DashboardHeader />

      {statsError && <WidgetError onRetry={refetchStats} />}

      {/* Cartes de stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${statsColumns}, minmax(0, 1fr))`,
          gap,
        }}
      >
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <StatSkeleton key={i} style={getItemStyle(i)} />
            ))
          : STATS.map((s, i) => (
              <StatCard
                key={s.title}
                {...s}
                compact={statsSmall}
                style={getItemStyle(i)}
              />
            ))}
      </div>

      {/* Graphique + actions rapides */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1.6fr 1fr" : "minmax(0, 1fr)",
          gap: isMobile ? 16 : 20,
          height: isDesktop ? 450 : "auto",
        }}
      >
        {isDesktop ? (
          <>
            <WebsiteVisitChart />
            <QuickActions />
          </>
        ) : (
          <>
            <div style={{ height: isMobile ? 320 : 380, minWidth: 0 }}>
              <WebsiteVisitChart />
            </div>
            <div style={{ minWidth: 0 }}>
              <QuickActions />
            </div>
          </>
        )}
      </div>

      {/* Enquiries + activité récente */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isDesktop ? "1.6fr 1fr" : "minmax(0, 1fr)",
          gap: isMobile ? 16 : 20,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <ReviewEnquiries />
        </div>
        <div style={{ minWidth: 0 }}>
          <RecentActivity />
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <AIConversations />
      </div>
    </div>
  );
}
