import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AdminThemeContext } from "./AdminThemeContext";
import { useSelector, useDispatch } from "react-redux";
import {
  Badge,
  ConfigProvider,
  theme,
  Popover,
  Spin,
  message,
  Modal,
} from "antd";
import {
  SearchOutlined,
  BellOutlined,
  SunOutlined,
  MoonOutlined,
  CheckCircleOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
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

//  Données menu sidebar
const NAV_ITEMS = [
  { path: "/admin", label: "Dashboard", Icon: IconDashboard, exact: true },
  { path: "/admin/projects", label: "Projects", Icon: IconProjects },
  { path: "/admin/gallery", label: "Gallery", Icon: IconGallery },
  { path: "/admin/messages", label: "Messages", Icon: IconMessages },
  { path: "/admin/aichat", label: "AI Chat", Icon: IconAIChat },
  { path: "/admin/news", label: "News/Articles", Icon: IconNews },
  { path: "/admin/users", label: "Users", Icon: IconUsers },
  { path: "/admin/settings", label: "Settings", Icon: IconSettings },
];

//  Sidebar
function Sidebar({ user, onLogoutClick, isDarkMode }) {
  const fullName = user
    ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim()
    : "Administrateur";
  const role = user?.role ?? "Admin";
  const email = user?.email ?? "";

  // In light mode: purple active, dark-slate inactive. Dark mode: sky-blue active, slate inactive.
  const activeColor = isDarkMode ? "#38bdf8" : "#023B6A";
  const inactiveColor = isDarkMode ? "#94A3B8" : "#374151";
  const activeBg = isDarkMode ? "#1E3A5F" : "#023B6A";

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: isDarkMode ? "#0F172A" : "#ffffff",
        borderRight: isDarkMode ? "1px solid #1E293B" : "1px solid #E5E7EB",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      {/* Logo */}
      <div>
        <div style={{ padding: "28px 24px 24px" }}>
          <img
            src={logo}
            alt="COMPULEC"
            style={{ height: 36, objectFit: "contain" }}
          />
        </div>

        {/* Navigation */}
        <nav
          style={{
            padding: "0 12px",
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
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 14px",
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
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Icon
                      size={20}
                      color={
                        isActive ? "#fff" : isDarkMode ? "#94A3B8" : "#023B6A"
                      }
                    />
                    {label}
                  </div>
                  {badge && (
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

      {/* User + Logout */}
      <div
        style={{ padding: "16px 16px 24px", borderTop: "1px solid #EEF2F7" }}
      >
        {/* AvatarWithPopover centré */}
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

        {/* Bouton Logout rouge */}
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
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}

//  Notification Component
function NotificationDropdown() {
  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const [markAllAsRead, { isLoading: isMarking }] = useMarkAllAsReadMutation();

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      message.success("All notifications marked as read");
    } catch (e) {
      message.error("Failed to mark notifications as read");
    }
  };

  const content = (
    <div style={{ width: 340, padding: 0, margin: -12 }}>
      {/* Header */}
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
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#FDE047",
            }}
          ></div>
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>
            Notification
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
          {isMarking ? <Spin size="small" /> : "Mark all as read"}
        </button>
      </div>

      {/* Body */}
      <div style={{ maxHeight: 380, overflowY: "auto" }}>
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
            You're all caught up!
          </div>
        ) : (
          notifications.map((n, idx) => (
            <div
              key={n.id}
              style={{
                padding: "16px 20px",
                borderBottom:
                  idx !== notifications.length - 1
                    ? "1px solid #EEF2F7"
                    : "none",
                display: "flex",
                gap: 12,
                background: n.isRead ? "#fff" : "#F8FAFC",
                transition: "background 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#F1F5F9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = n.isRead
                  ? "#fff"
                  : "#F8FAFC")
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
                ></div>
              </div>
              <div>
                <p
                  style={{
                    margin: "0 0 2px 0",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#023B6A",
                  }}
                >
                  {n.title}
                </p>
                <p
                  style={{
                    margin: "0 0 4px 0",
                    fontSize: 12,
                    color: "#64748B",
                  }}
                >
                  {n.message}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>
                  {n.timeAgo}
                </p>
              </div>
            </div>
          ))
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
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "1.5px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            background: "#fff",
          }}
        >
          <BellOutlined style={{ fontSize: 17, color: "#64748B" }} />
        </div>
      </Badge>
    </Popover>
  );
}

//  Top Header
function TopHeader({ isDarkMode, setIsDarkMode, user }) {
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
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${border}`,
        position: "sticky",
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}
    >
      {/* Search */}
      <div style={{ position: "relative", width: 400 }}>
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
          placeholder="Search projects, messages..."
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
          }}
        />
      </div>

      {/* Right: theme toggle + notif + user */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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
        <NotificationDropdown />

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarWithPopover
            name={
              user ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim() : "Admin"
            }
            email={user?.email ?? ""}
            size={38}
          />
          <div>
            <p
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: textMain,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {user
                ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim()
                : "Administrateur"}
            </p>
            <p style={{ fontSize: 11, color: textSub, margin: 0 }}>
              {user?.role ?? "Admin"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── AdminLayout ─────────────────────────────────────────────────────────────
export default function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutApiMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch (_) {
      // Silently ignore backend errors — token invalidation is best-effort
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
      {/* Modal de confirmation de déconnexion */}
      <Modal
        open={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onOk={handleLogout}
        confirmLoading={isLoggingOut}
        okText="Se déconnecter"
        cancelText="Annuler"
        okButtonProps={{ danger: true, icon: <LogoutOutlined /> }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ExclamationCircleOutlined
              style={{ color: "#DC2626", fontSize: 22 }}
            />
            <span style={{ fontWeight: 700 }}>Confirmer la déconnexion</span>
          </div>
        }
        centered
      >
        <p style={{ margin: "16px 0", color: "#475569" }}>
          Êtes-vous sûr(e) de vouloir vous déconnecter ? Votre session sera
          fermée.
        </p>
      </Modal>

      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          background: isDarkMode ? "#0F172A" : "#F0F2F8",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <Sidebar
          user={user}
          onLogoutClick={() => setLogoutModalOpen(true)}
          isDarkMode={isDarkMode}
        />

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: isDarkMode ? "#0F172A" : "#F0F2F8",
            transition: "background 0.3s ease",
          }}
        >
          <TopHeader
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            user={user}
          />
          <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
            <AdminThemeContext.Provider value={isDarkMode}>
              <Outlet />
            </AdminThemeContext.Provider>
          </div>
        </main>
      </div>
    </ConfigProvider>
  );
}
