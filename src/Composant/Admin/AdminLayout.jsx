import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AdminThemeContext } from "./AdminThemeContext";
import useStaffChatNotifications from "./AIChat/useStaffChatNotifications";
import { useSelector, useDispatch } from "react-redux";
import {
  Badge,
  ConfigProvider,
  theme,
  Popover,
  Spin,
  message,
  Modal,
  Drawer,
} from "antd";
import {
  SearchOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useGetNotificationsQuery,
  useMarkAllAsReadMutation,
} from "../../services/api/notificationApi";
import { useLogoutApiMutation } from "../../services/api/authApi";
import { selectCurrentUser, logout } from "../../store/authSlice";
import AvatarWithPopover from "./Users/AvatarWithPopover";
import {
  IconDashboard,
  IconProjects,
  IconGallery,
  IconMessages,
  IconAIChat,
  IconNews,
  IconUsers,
  IconSettings,
} from "./component/AdminIcons";
import logo from "../../assets/logo.png";

// ── Hook breakpoints ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1280);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    width,
  };
}

//  Données menu sidebar
function useNavItems() {
  const { t } = useTranslation();
  return [
    { path: "/admin", label: t("admin.sidebar.dashboard"), Icon: IconDashboard, exact: true },
    { path: "/admin/projects", label: t("admin.sidebar.projects"), Icon: IconProjects },
    { path: "/admin/gallery", label: t("admin.sidebar.gallery"), Icon: IconGallery },
    { path: "/admin/messages", label: t("admin.sidebar.messages"), Icon: IconMessages },
    { path: "/admin/aichat", label: t("admin.sidebar.aiAssistant"), Icon: IconAIChat },
    { path: "/admin/news", label: t("admin.sidebar.articles"), Icon: IconNews },
    { path: "/admin/users", label: t("admin.sidebar.users"), Icon: IconUsers },
    { path: "/admin/settings", label: t("admin.sidebar.settings"), Icon: IconSettings },
  ];
}

// ── Sidebar Content (réutilisé dans desktop et drawer) ───────────────────────
function SidebarContent({ user, onLogoutClick, isDarkMode, collapsed = false, onNavClick }) {
  const { t } = useTranslation();
  const NAV_ITEMS = useNavItems();
  const fullName = user
    ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim()
    : "Administrateur";
  const role = user?.role ?? "Admin";
  const email = user?.email ?? "";

  const activeColor = isDarkMode ? "#38bdf8" : "#023B6A";
  const inactiveColor = isDarkMode ? "#94A3B8" : "#374151";
  const activeBg = isDarkMode ? "#1E3A5F" : "#023B6A";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        background: isDarkMode ? "#0F172A" : "#ffffff",
      }}
    >
      {/* Top: Logo + Nav */}
      <div>
        {/* Logo */}
        <div
          style={{
            padding: collapsed ? "24px 12px" : "28px 24px 24px",
            display: "flex",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          {collapsed ? (
            <img src={logo} alt="C" style={{ height: 28, objectFit: "contain" }} />
          ) : (
            <img src={logo} alt="COMPULEC" style={{ height: 36, objectFit: "contain" }} />
          )}
        </div>

        {/* Navigation */}
        <nav
          style={{
            padding: collapsed ? "0 8px" : "0 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV_ITEMS.map(({ path, label, Icon, exact, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              onClick={onNavClick}
              title={collapsed ? label : undefined}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                padding: collapsed ? "12px" : "11px 14px",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.15s",
                background: isActive ? activeBg : "transparent",
                color: isActive ? "#fff" : inactiveColor,
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: collapsed ? 0 : 12,
                      position: "relative",
                    }}
                  >
                    <Icon
                      size={20}
                      color={isActive ? "#fff" : isDarkMode ? "#94A3B8" : "#023B6A"}
                    />
                    {!collapsed && label}
                  </div>
                  {!collapsed && badge && (
                    <span
                      style={{
                        background: "#FDE047",
                        color: "#92400E",
                        fontSize: 10,
                        fontWeight: 700,
                        borderRadius: 999,
                        padding: "1px 7px",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom: User + Logout */}
      <div
        style={{
          padding: collapsed ? "16px 8px 24px" : "16px 16px 24px",
          borderTop: `1px solid ${isDarkMode ? "#1E293B" : "#EEF2F7"}`,
        }}
      >
        {!collapsed && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <AvatarWithPopover name={fullName} email={email} size={52} />
            <p
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "var(--ant-color-text)",
                margin: "8px 0 0",
                textAlign: "center",
              }}
            >
              {fullName}
            </p>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#fff",
                background: "#023B6A",
                borderRadius: 999,
                padding: "2px 10px",
                marginTop: 4,
              }}
            >
              {role}
            </span>
          </div>
        )}

        {collapsed ? (
          <div
            style={{ display: "flex", justifyContent: "center" }}
            title={t("admin.sidebar.logout")}
          >
            <button
              onClick={onLogoutClick}
              style={{
                width: 42,
                height: 42,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#FEF2F2",
                border: "1.5px solid #FECACA",
                cursor: "pointer",
                color: "#DC2626",
                borderRadius: 10,
                transition: "all 0.18s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#DC2626";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FEF2F2";
                e.currentTarget.style.color = "#DC2626";
              }}
            >
              <LogoutOutlined style={{ fontSize: 15 }} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogoutClick}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#FEF2F2",
              border: "1.5px solid #FECACA",
              cursor: "pointer",
              color: "#DC2626",
              fontSize: 13,
              fontWeight: 700,
              padding: "10px 0",
              borderRadius: 10,
              transition: "all 0.18s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#DC2626";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FEF2F2";
              e.currentTarget.style.color = "#DC2626";
            }}
          >
            <LogoutOutlined style={{ fontSize: 15 }} />
            {t("admin.sidebar.logout")}
          </button>
        )}
      </div>
    </div>
  );
}

//  Sidebar Desktop (fixe)
function Sidebar({ user, onLogoutClick, isDarkMode, collapsed }) {
  return (
    <aside
      style={{
        width: collapsed ? 68 : 240,
        minHeight: "100vh",
        background: isDarkMode ? "#0F172A" : "#ffffff",
        borderRight: isDarkMode ? "1px solid #1E293B" : "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        transition: "width 0.25s ease",
        overflow: "hidden",
      }}
    >
      <SidebarContent
        user={user}
        onLogoutClick={onLogoutClick}
        isDarkMode={isDarkMode}
        collapsed={collapsed}
      />
    </aside>
  );
}

/** « il y a 5 min » / « 5 min ago » dans la langue de l'interface. */
function formatTimeAgo(dateStr, lang) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(0, "second"); // « maintenant » / « now »
}

/** Titre et texte traduits d'une notification (clés admin.notifications.<TYPE>_title / _message). */
function notificationTexts(n, t) {
  const vars = { count: n.count ?? 0, subject: n.subject ?? "" };
  const title = t(`admin.notifications.${n.type}_title`, { ...vars, defaultValue: n.type });
  // PROJECT / GALLERY : le texte est le titre de l'élément lui-même
  const message = n.subject && (n.type === "PROJECT" || n.type === "GALLERY")
    ? n.subject
    : t(`admin.notifications.${n.type}_message`, { ...vars, defaultValue: "" });
  return { title, message };
}

//  Notification Component
function NotificationDropdown({ isDarkMode }) {
  const { t, i18n } = useTranslation();
  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const [markAllAsRead, { isLoading: isMarking }] = useMarkAllAsReadMutation();

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      message.success(t("admin.notifications.markedAllRead"));
    } catch {
      message.error(t("admin.notifications.markAllReadError"));
    }
  };

  const content = (
    <div style={{ width: 320, padding: 0, margin: -12 }}>
      <div
        style={{
          background: "#023B6A",
          padding: "16px 20px",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{ width: 8, height: 8, borderRadius: "50%", background: "#FDE047" }}
          />
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
            {t("admin.notifications.title")}
          </span>
        </div>
        <button
          onClick={handleMarkAllRead}
          disabled={isMarking || unreadCount === 0}
          style={{
            background: "none",
            border: "none",
            color: "#94A3B8",
            fontSize: 12,
            cursor: "pointer",
            padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
        >
          {isMarking ? <Spin size="small" /> : t("admin.notifications.markAllRead")}
        </button>
      </div>

      <div style={{ maxHeight: 340, overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ padding: 30, textAlign: "center" }}>
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#94A3B8" }}>
            <CheckCircleOutlined
              style={{ fontSize: 24, marginBottom: 8, color: "#10B981" }}
            />
            <br />
            {t("admin.notifications.empty")}
          </div>
        ) : (
          notifications.map((n, idx) => {
            const { title, message: text } = notificationTexts(n, t);
            return (
            <div
              key={n.id}
              style={{
                padding: "14px 20px",
                borderBottom:
                  idx !== notifications.length - 1 ? "1px solid #EEF2F7" : "none",
                display: "flex",
                gap: 12,
                background: n.isRead ? "#fff" : "#F8FAFC",
                transition: "background 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = n.isRead ? "#fff" : "#F8FAFC")
              }
            >
              <div style={{ marginTop: 6, flexShrink: 0 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: n.isRead ? "#CBD5E1" : "#FDE047",
                  }}
                />
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#023B6A",
                  }}
                >
                  {title}
                </p>
                {text && (
                  <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#64748B" }}>
                    {text}
                  </p>
                )}
                <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
                  {formatTimeAgo(n.date, i18n.language)}
                </p>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      styles={{ body: { padding: 12, borderRadius: 8 } }}
    >
      <Badge
        count={unreadCount}
        size="small"
        style={{
          background: "#FDE047",
          color: "#92400E",
          fontWeight: 700,
          fontSize: 10,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: `1.5px solid ${isDarkMode ? "#334155" : "#E2E8F0"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: isDarkMode ? "#1E293B" : "#fff",
          }}
        >
          <BellOutlined style={{ fontSize: 17, color: "#64748B" }} aria-label={t("admin.notifications.open")} />
        </div>
      </Badge>
    </Popover>
  );
}

//  Top Header
function TopHeader({ isDarkMode, setIsDarkMode, user, onMenuClick, isMobile, isTablet }) {
  const { t } = useTranslation();
  const bgCard = isDarkMode ? "#1E293B" : "#fff";
  const border = isDarkMode ? "#334155" : "#EEF2F7";
  const textMain = isDarkMode ? "#F8FAFC" : "#0F172A";
  const textSub = isDarkMode ? "#94A3B8" : "#64748B";
  const inputBg = isDarkMode ? "#0F172A" : "#F8FAFC";
  const inputBorder = isDarkMode ? "#334155" : "#E2E8F0";

  return (
    <header
      style={{
        background: bgCard,
        padding: isMobile ? "0 16px" : "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${border}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        gap: 12,
      }}
    >
      {/* Left: Hamburger (mobile/tablet) + Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        {(isMobile || isTablet) && (
          <button
            onClick={onMenuClick}
            style={{
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isDarkMode ? "#334155" : "#F1F5F9",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              flexShrink: 0,
              color: isDarkMode ? "#94A3B8" : "#374151",
            }}
          >
            <MenuOutlined style={{ fontSize: 18 }} />
          </button>
        )}

        {!isMobile && (
          <div style={{ position: "relative", flex: 1, maxWidth: 380 }}>
            <SearchOutlined
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: textSub,
                fontSize: 15,
                zIndex: 1,
              }}
            />
            <input
              placeholder={t("admin.header.searchPlaceholder")}
              style={{
                width: "100%",
                paddingLeft: 40,
                paddingRight: 16,
                height: 40,
                border: `1.5px solid ${inputBorder}`,
                borderRadius: 10,
                fontSize: 13,
                color: textMain,
                outline: "none",
                background: inputBg,
                fontFamily: "'Poppins', sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}
      </div>

      {/* Right: theme toggle + notif + user */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 16, flexShrink: 0 }}>
        {/* Mode toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: isDarkMode ? "#334155" : "#F1F5F9",
            borderRadius: 999,
            padding: "3px 4px",
            gap: 2,
          }}
        >
          <div
            onClick={() => setIsDarkMode(false)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: !isDarkMode ? "#fff" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: !isDarkMode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              color: !isDarkMode ? "#F59E0B" : "#94A3B8",
              transition: "all 0.2s",
            }}
          >
            <SunOutlined style={{ fontSize: 15 }} />
          </div>
          <div
            onClick={() => setIsDarkMode(true)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: isDarkMode ? "#1E293B" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isDarkMode ? "#38BDF8" : "#94A3B8",
              boxShadow: isDarkMode ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              transition: "all 0.2s",
            }}
          >
            <MoonOutlined style={{ fontSize: 15 }} />
          </div>
        </div>

        {/* Notifications */}
        <NotificationDropdown isDarkMode={isDarkMode} />

        {/* User (hidden on mobile to save space) */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AvatarWithPopover
              name={user ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() : "Admin"}
              email={user?.email ?? ""}
              size={36}
            />
            <div style={{ display: isTablet ? "none" : "block" }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: textMain,
                  margin: 0,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                }}
              >
                {user ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() : "Administrateur"}
              </p>
              <p style={{ fontSize: 11, color: textSub, margin: 0 }}>
                {user?.role ?? "Admin"}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

// ── Bottom mobile nav bar ────────────────────────────────────────────────────
function BottomNav({ isDarkMode }) {
  const NAV_ITEMS = useNavItems();
  const bg = isDarkMode ? "#0F172A" : "#ffffff";
  const border = isDarkMode ? "#1E293B" : "#E5E7EB";
  const activeBg = isDarkMode ? "#1E3A5F" : "#EFF6FF";
  const activeColor = isDarkMode ? "#38bdf8" : "#023B6A";
  const inactiveColor = isDarkMode ? "#64748B" : "#94A3B8";

  // Show only 5 most important items on mobile bottom bar
  const mobileItems = NAV_ITEMS.slice(0, 5);

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: bg,
        borderTop: `1px solid ${border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 200,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {mobileItems.map(({ path, label, Icon, exact }) => (
        <NavLink
          key={path}
          to={path}
          end={exact}
          style={({ isActive }) => ({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
            padding: "6px 10px",
            borderRadius: 10,
            textDecoration: "none",
            background: isActive ? activeBg : "transparent",
            color: isActive ? activeColor : inactiveColor,
            fontSize: 10,
            fontWeight: 600,
            minWidth: 52,
            transition: "all 0.15s",
          })}
        >
          {({ isActive }) => (
            <>
              <Icon size={22} color={isActive ? activeColor : inactiveColor} />
              <span style={{ lineHeight: 1 }}>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

// ─── AdminLayout ─────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const { t } = useTranslation();
  // Temps réel du chat : alertes et rafraîchissement instantané sur toutes les pages de l'admin
  useStaffChatNotifications();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutApiMutation();
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  // Tablet: sidebar collapsed to icons only
  const sidebarCollapsed = isTablet;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (_) {
      // Silently ignore backend errors
    } finally {
      dispatch(logout());
      navigate("/login");
    }
  };

  return (
    <ConfigProvider
      theme={{
        cssVar: true,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: isDarkMode ? "#38bdf8" : "#023B6A",
          colorTextBase: isDarkMode ? "#F8FAFC" : "#0F172A",
          colorBgBase: isDarkMode ? "#1E293B" : "#ffffff",
          borderRadius: 8,
          fontFamily: "'Poppins', sans-serif",
        },
        components: {
          Input: {
            colorBgContainer: isDarkMode ? "#1E293B" : "#ffffff",
            colorBorder: isDarkMode ? "#334155" : "#E2E8F0",
            colorTextPlaceholder: isDarkMode ? "#64748B" : "#94A3B8",
            hoverBorderColor: isDarkMode ? "#475569" : "#cbd5e1",
            activeBorderColor: isDarkMode ? "#38bdf8" : "#023B6A",
          },
          Select: {
            colorBgContainer: isDarkMode ? "#1E293B" : "#ffffff",
            colorBorder: isDarkMode ? "#334155" : "#E2E8F0",
            colorTextPlaceholder: isDarkMode ? "#64748B" : "#94A3B8",
            hoverBorderColor: isDarkMode ? "#475569" : "#cbd5e1",
            activeBorderColor: isDarkMode ? "#38bdf8" : "#023B6A",
            colorText: isDarkMode ? "#F8FAFC" : "#0F172A",
            colorBgElevated: isDarkMode ? "#1E293B" : "#ffffff",
            controlItemBgActive: isDarkMode ? "#334155" : "#F8FAFC",
            controlItemBgHover: isDarkMode ? "#475569" : "#F1F5F9",
          },
          Table: {
            headerBg: isDarkMode ? "#1E293B" : "#ffffff",
            headerColor: isDarkMode ? "#F8FAFC" : "#64748B",
            rowHoverBg: isDarkMode ? "#334155" : "#F8FAFC",
            borderColor: isDarkMode ? "#334155" : "#F1F5F9",
            colorBgContainer: isDarkMode ? "#0F172A" : "#ffffff",
          },
          Pagination: {
            itemBg: isDarkMode ? "transparent" : "#ffffff",
            itemActiveBg: isDarkMode ? "#38bdf8" : "#023B6A",
            itemActiveColor: "#ffffff",
            colorText: isDarkMode ? "#F8FAFC" : "#0F172A",
          },
        },
      }}
    >
      {/* Modal déconnexion */}
      <Modal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onOk={handleLogout}
        confirmLoading={isLoggingOut}
        okText={t("admin.logoutModal.confirm")}
        cancelText={t("admin.logoutModal.cancel")}
        okButtonProps={{ danger: true, icon: <LogoutOutlined /> }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ExclamationCircleOutlined style={{ color: "#DC2626", fontSize: 22 }} />
            <span style={{ fontWeight: 700 }}>{t("admin.logoutModal.title")}</span>
          </div>
        }
        centered
      >
        <p style={{ margin: "16px 0", color: isDarkMode ? "#CBD5E1" : "#475569" }}>
          {t("admin.logoutModal.message")}
        </p>
      </Modal>

      {/* Mobile/Tablet Drawer */}
      {(isMobile || isTablet) && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          width={260}
          styles={{
            body: { padding: 0, background: isDarkMode ? "#0F172A" : "#ffffff" },
            header: { display: "none" },
            wrapper: { boxShadow: "4px 0 20px rgba(0,0,0,0.15)" },
          }}
        >
          {/* Close button inside drawer */}
          <div
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setDrawerOpen(false)}
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDarkMode ? "#334155" : "#F1F5F9",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                color: isDarkMode ? "#94A3B8" : "#374151",
              }}
            >
              <CloseOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
          <div style={{ height: "100%", overflow: "auto" }}>
            <SidebarContent
              user={user}
              onLogoutClick={() => {
                setDrawerOpen(false);
                setLogoutModalOpen(true);
              }}
              isDarkMode={isDarkMode}
              collapsed={false}
              onNavClick={() => setDrawerOpen(false)}
            />
          </div>
        </Drawer>
      )}

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: isDarkMode ? "#0F172A" : "#F0F2F8",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* Desktop Sidebar */}
        {isDesktop && (
          <Sidebar
            user={user}
            onLogoutClick={() => setLogoutModalOpen(true)}
            isDarkMode={isDarkMode}
            collapsed={false}
          />
        )}

        {/* Tablet: collapsed sidebar */}
        {isTablet && (
          <Sidebar
            user={user}
            onLogoutClick={() => setLogoutModalOpen(true)}
            isDarkMode={isDarkMode}
            collapsed={true}
          />
        )}

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: isDarkMode ? "#0F172A" : "#F0F2F8",
            transition: "background 0.3s ease",
            minWidth: 0,
          }}
        >
          <TopHeader
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            user={user}
            onMenuClick={() => setDrawerOpen(true)}
            isMobile={isMobile}
            isTablet={isTablet}
          />

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "16px 12px 80px" : isTablet ? "20px 20px" : "28px 32px",
            }}
          >
            <AdminThemeContext.Provider value={isDarkMode}>
              <Outlet />
            </AdminThemeContext.Provider>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav Bar */}
      {isMobile && <BottomNav isDarkMode={isDarkMode} />}
    </ConfigProvider>
  );
}
