import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAdminTheme } from "../AdminThemeContext";
import { useTranslation } from "react-i18next";
import {
  Input,
  Button,
  Tag,
  Badge,
  Popconfirm,
  Pagination,
  Spin,
  message as antMessage,
} from "antd";
import {
  SyncOutlined,
  CheckCircleOutlined,
  UserSwitchOutlined,
  ArrowLeftOutlined,
  RobotOutlined,
  CustomerServiceOutlined,
  SoundOutlined,
  MutedOutlined,
  DesktopOutlined,
} from "@ant-design/icons";
import StatCard from "../Dashboard/StatCard";
import {
  useSearchChatSessionsQuery,
  useGetChatCountsQuery,
  useGetSessionDetailQuery,
  useTakeOverSessionMutation,
  useAdminReplyMutation,
  useMarkSessionReadMutation,
  useCloseSessionMutation,
} from "../../../services/api/chatApi";
import { selectCurrentUser } from "../../../store/authSlice";
import { useChatRealtimeStatus } from "../../../services/chatRealtime";
import {
  desktopNotificationsSupported,
  desktopPermission,
  isSoundEnabled,
  playChime,
  requestDesktopPermission,
  setSoundEnabled,
} from "../../../services/chatAlerts";

// --- ICONS ---
const IconMessage = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);
const IconUserCheck = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);
const IconCheckCircle = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const IconSend = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const IconBot = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);
const IconUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// --- STATUTS ---
const STATUS_CONFIG = {
  WAITING_ADMIN: { color: "gold", icon: <UserSwitchOutlined />, key: "statusWaiting" },
  WITH_ADMIN: { color: "purple", icon: <SyncOutlined spin />, key: "statusWithAdmin" },
  ACTIVE: { color: "blue", icon: <RobotOutlined />, key: "statusBot" },
  CLOSED: { color: "green", icon: <CheckCircleOutlined />, key: "statusClosed" },
};

// Onglets : l'ordre correspond aux priorités de l'équipe
const TABS = ["WAITING_ADMIN", "WITH_ADMIN", "ACTIVE", "CLOSED"];
const PAGE_SIZE = 20;
// Les mises à jour arrivent en temps réel ; l'actualisation périodique n'est qu'un filet de sécurité
const SAFETY_POLLING = { pollingInterval: 30000, skipPollingIfUnfocused: true };

function AIChatStatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.WAITING_ADMIN;
  return (
    <Tag
      icon={cfg.icon}
      color={cfg.color}
      style={{ borderRadius: 999, padding: "1px 8px", fontWeight: 600, margin: 0, fontSize: 11 }}
    >
      {t(`admin.aiChat.${cfg.key}`)}
    </Tag>
  );
}

/** Heure si c'est aujourd'hui, sinon date courte. */
function formatActivity(dateStr, lang) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const locale = lang === "en" ? "en-GB" : "fr-FR";
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(locale, { day: "2-digit", month: "short" });
}

function formatTime(dateStr, lang) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Valeur qui ne change qu'après une pause de saisie (évite une requête par touche). */
function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// --- MAIN COMPONENT ---
export default function AdminAIChat() {
  const isDark = useAdminTheme();
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "fr").startsWith("en") ? "en" : "fr";
  const currentUser = useSelector(selectCurrentUser);
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const [activeTab, setActiveTab] = useState("WAITING_ADMIN");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedToken, setSelectedToken] = useState(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);
  const debouncedSearch = useDebounced(search);

  // Revenir à la première page quand l'onglet ou la recherche change
  useEffect(() => setPage(0), [activeTab, debouncedSearch]);

  // Requêtes (actualisées régulièrement, en pause quand l'onglet du navigateur est caché)
  const realtime = useChatRealtimeStatus();
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [desktop, setDesktop] = useState(desktopPermission());

  // Temps réel coupé : on revient à une actualisation fréquente le temps de la reconnexion
  const polling = realtime ? SAFETY_POLLING : { pollingInterval: 5000, skipPollingIfUnfocused: true };
  const { data: countsData } = useGetChatCountsQuery(undefined, polling);
  const { data: listData, isFetching: loadingList, isLoading: firstLoad } = useSearchChatSessionsQuery(
    { status: activeTab, q: debouncedSearch, page, size: PAGE_SIZE },
    polling,
  );
  const { data: detailData, isLoading: loadingDetail } = useGetSessionDetailQuery(selectedToken, {
    skip: !selectedToken,
    ...polling,
  });

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    if (next) playChime("message", { force: true });
  };

  const enableDesktop = async () => {
    const result = await requestDesktopPermission();
    setDesktop(result);
    if (result === "granted") antMessage.success(t("admin.aiChat.desktopEnabled"));
    else antMessage.warning(t("admin.aiChat.desktopDenied"));
  };

  const [takeOver, { isLoading: isTaking }] = useTakeOverSessionMutation();
  const [adminReply, { isLoading: isReplying }] = useAdminReplyMutation();
  const [markRead] = useMarkSessionReadMutation();
  const [closeSession, { isLoading: isClosing }] = useCloseSessionMutation();

  const counts = countsData?.data || {};
  const sessions = listData?.data?.content || [];
  const totalInTab = listData?.data?.totalElements ?? 0;
  const selectedChat = detailData?.data;
  const isMine = selectedChat?.assignedAdminEmail && selectedChat.assignedAdminEmail === currentUser?.email;
  const isClosed = selectedChat?.status === "CLOSED";

  // Défilement vers le dernier message
  const messageCount = selectedChat?.messages?.length || 0;
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageCount, selectedToken]);

  // Conversation ouverte avec des messages non lus → marquée comme lue
  useEffect(() => {
    if (selectedToken && selectedChat?.unreadCount > 0) {
      markRead(selectedToken);
    }
  }, [selectedToken, selectedChat?.unreadCount, markRead]);

  const handleTakeOver = async () => {
    try {
      await takeOver(selectedToken).unwrap();
      antMessage.success(t("admin.aiChat.takenOver"));
    } catch (err) {
      antMessage.error(err?.data?.message || t("admin.aiChat.errorGeneric"));
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedToken) return;
    try {
      await adminReply({ sessionToken: selectedToken, message: replyText.trim() }).unwrap();
      setReplyText("");
    } catch (err) {
      antMessage.error(err?.data?.message || t("admin.aiChat.errorSend"));
    }
  };

  const handleCloseSession = async () => {
    if (!selectedToken) return;
    try {
      await closeSession(selectedToken).unwrap();
      antMessage.success(t("admin.aiChat.closedSuccess"));
    } catch (err) {
      antMessage.error(err?.data?.message || t("admin.aiChat.errorGeneric"));
    }
  };

  const noScrollbar =
    "[&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [scrollbar-width:none] [-ms-overflow-style:none]";

  const pad = (n) => (n < 10 ? `0${n}` : n);

  const tabLabel = (tab) => t(`admin.aiChat.${STATUS_CONFIG[tab].key}`);

  return (
    <div className="pb-6 lg:pb-10 font-['Poppins',sans-serif] w-full min-w-0">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: textMain }}>
            {t("admin.aiChat.title")}
          </h1>
          <p className="text-xs sm:text-sm m-0" style={{ color: textSub }}>
            {t("admin.aiChat.pageDesc")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span
            className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full"
            style={{ backgroundColor: bgCard, border: `1px solid ${border}`, color: textSub }}
            title={realtime ? t("admin.aiChat.realtimeOnHelp") : t("admin.aiChat.realtimeOffHelp")}
          >
            <span
              className={`w-2 h-2 rounded-full inline-block ${realtime ? "animate-pulse" : ""}`}
              style={{ backgroundColor: realtime ? "#10B981" : "#F59E0B" }}
            />
            {realtime ? t("admin.aiChat.realtimeOn") : t("admin.aiChat.realtimeOff")}
          </span>
          <Button
            size="small"
            icon={soundOn ? <SoundOutlined /> : <MutedOutlined />}
            onClick={toggleSound}
            title={soundOn ? t("admin.aiChat.soundOnHelp") : t("admin.aiChat.soundOffHelp")}
          >
            {soundOn ? t("admin.aiChat.soundOn") : t("admin.aiChat.soundOff")}
          </Button>
          {desktopNotificationsSupported() && desktop !== "granted" && (
            <Button size="small" icon={<DesktopOutlined />} onClick={enableDesktop}>
              {t("admin.aiChat.enableDesktop")}
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards : 1 colonne mobile, 3 colonnes dès sm (tablette) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6 sm:h-40">
        <StatCard
          title={t("admin.aiChat.statusWaiting")}
          value={pad(counts.WAITING_ADMIN || 0)}
          subtitle={t("admin.aiChat.waitingSubtitle")}
          icon={<IconUserCheck />}
          iconBg={isDark ? "#713F12" : "#FEF08A"}
          iconColor={isDark ? "#FDE047" : "#EAB308"}
          cardBg={isDark ? "#422006" : "#FEF9C3"}
          cardBorder={isDark ? "#92400E" : "#FEF08A"}
          textColor={isDark ? "#FCD34D" : "#CA8A04"}
          onClick={() => setActiveTab("WAITING_ADMIN")}
        />
        <StatCard
          title={t("admin.aiChat.statusWithAdmin")}
          value={pad(counts.WITH_ADMIN || 0)}
          subtitle={t("admin.aiChat.withAdminSubtitle")}
          icon={<IconMessage />}
          iconBg={isDark ? "#312E81" : "#E0E7FF"}
          iconColor={isDark ? "#A5B4FC" : "#6366F1"}
          cardBg={isDark ? "#1E1B4B" : "#EEF2FF"}
          cardBorder={isDark ? "#3730A3" : "#E0E7FF"}
          textColor={isDark ? "#A5B4FC" : "#4F46E5"}
          onClick={() => setActiveTab("WITH_ADMIN")}
        />
        <StatCard
          title={t("admin.aiChat.unread")}
          value={pad(counts.UNREAD || 0)}
          subtitle={t("admin.aiChat.unreadSubtitle")}
          icon={<IconCheckCircle />}
          iconBg={isDark ? "#7F1D1D" : "#FECACA"}
          iconColor={isDark ? "#FCA5A5" : "#DC2626"}
          cardBg={isDark ? "#450A0A" : "#FEF2F2"}
          cardBorder={isDark ? "#991B1B" : "#FECACA"}
          textColor={isDark ? "#FCA5A5" : "#B91C1C"}
        />
      </div>

      {/*
        Layout principal
        - Mobile / tablette (< lg) : une seule vue à la fois (liste OU conversation) + bouton retour
        - Desktop (>= lg) : liste + conversation côte à côte
      */}
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100dvh-14rem)] min-h-[480px] lg:h-[620px]">
        {/* Left Sidebar */}
        <div
          className={`${selectedToken ? "hidden lg:flex" : "flex"} w-full lg:w-[370px] lg:shrink-0 flex-col gap-3 sm:gap-4 min-h-0 flex-1 lg:flex-none`}
        >
          {/* Search & Tabs */}
          <div className="rounded-xl p-3 sm:p-4" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
            <Input.Search
              placeholder={t("admin.aiChat.searchPlaceholder")}
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              loading={loadingList && !!debouncedSearch}
              className="mb-3 sm:mb-4"
            />

            <div
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-1 p-1 rounded-lg"
              style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-1.5 sm:px-2 py-2 sm:py-1.5 text-[11px] sm:text-xs rounded-md cursor-pointer min-w-0 text-center truncate transition-all ${
                      isActive ? "font-semibold shadow-sm" : "font-medium"
                    }`}
                    style={{ color: isActive ? textMain : textSub, backgroundColor: isActive ? bgCard : "transparent" }}
                  >
                    {tabLabel(tab)} ({counts[tab] || 0})
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of Chats */}
          <div
            className={`flex-1 min-h-0 rounded-xl overflow-y-auto flex flex-col ${noScrollbar}`}
            style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}
          >
            {firstLoad ? (
              <div className="flex justify-center items-center h-full">
                <Spin />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center text-slate-400 mt-10 text-sm px-4">
                {debouncedSearch ? t("admin.aiChat.noResult") : t("admin.aiChat.emptyTab")}
              </div>
            ) : (
              <>
                {sessions.map((chat, idx) => {
                  const selected = selectedToken === chat.sessionToken;
                  return (
                    <div
                      key={chat.sessionToken}
                      onClick={() => setSelectedToken(chat.sessionToken)}
                      className="p-3 sm:p-4 cursor-pointer transition-colors border-l-4"
                      style={{
                        backgroundColor: selected ? (isDark ? "#0F172A" : "#F8FAFC") : bgCard,
                        borderLeftColor: selected ? primary : "transparent",
                        borderBottom: idx !== sessions.length - 1 ? `1px solid ${border}` : "none",
                      }}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <span
                          className="text-sm truncate min-w-0 flex-1"
                          style={{ color: textMain, fontWeight: chat.unreadCount > 0 ? 800 : 600 }}
                        >
                          {chat.visitorName || t("admin.aiChat.anonymous")}
                        </span>
                        <span className="text-[11px] text-slate-400 shrink-0">
                          {formatActivity(chat.lastActivityAt, lang)}
                        </span>
                      </div>
                      <div
                        className="text-[12px] truncate mb-2"
                        style={{ color: chat.unreadCount > 0 ? textMain : textSub }}
                      >
                        {chat.lastMessagePreview || "—"}
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[11px] truncate min-w-0" style={{ color: textSub }}>
                          {chat.assignedAdminName
                            ? t("admin.aiChat.handledBy", { name: chat.assignedAdminName })
                            : t("admin.aiChat.questions", { count: chat.questionCount || 0 })}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {chat.unreadCount > 0 && <Badge count={chat.unreadCount} />}
                          <AIChatStatusBadge status={chat.status} />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {totalInTab > PAGE_SIZE && (
                  <div className="flex justify-center p-3 mt-auto" style={{ borderTop: `1px solid ${border}` }}>
                    <Pagination
                      simple
                      size="small"
                      current={page + 1}
                      pageSize={PAGE_SIZE}
                      total={totalInTab}
                      onChange={(p) => setPage(p - 1)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Chat View */}
        <div
          className={`${selectedToken ? "flex" : "hidden lg:flex"} flex-1 min-w-0 min-h-0 rounded-xl flex-col overflow-hidden`}
          style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}
        >
          {/* Chat Header */}
          <div
            className="px-3 sm:px-6 py-3 sm:py-4 border-b flex justify-between items-center gap-2 sm:gap-3"
            style={{ borderColor: border }}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* Bouton retour : visible seulement mobile / tablette */}
              {/* (enveloppé dans un span : le style d'Ant Design écrase « lg:hidden » posé sur le bouton) */}
              {selectedToken && (
                <span className="lg:hidden shrink-0">
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined style={{ color: textMain }} />}
                    onClick={() => setSelectedToken(null)}
                    aria-label={t("admin.aiChat.backToList")}
                  />
                </span>
              )}
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-bold m-0 truncate" style={{ color: textMain }}>
                  {selectedChat ? selectedChat.visitorName || t("admin.aiChat.anonymous") : t("admin.aiChat.viewChat")}
                </h2>
                {selectedChat && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <AIChatStatusBadge status={selectedChat.status} />
                    {selectedChat.assignedAdminName && (
                      <span className="text-[11px]" style={{ color: textSub }}>
                        {isMine
                          ? t("admin.aiChat.handledByYou")
                          : t("admin.aiChat.handledBy", { name: selectedChat.assignedAdminName })}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {selectedChat && !isClosed && (
              <div className="flex gap-2 shrink-0">
                {!isMine && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<CustomerServiceOutlined />}
                    loading={isTaking}
                    onClick={handleTakeOver}
                    className="sm:!h-8 sm:!px-4 sm:!text-sm"
                    style={{ background: primary, borderColor: primary }}
                  >
                    <span className="hidden sm:inline">
                      {selectedChat.assignedAdminName ? t("admin.aiChat.takeOverFromColleague") : t("admin.aiChat.takeOver")}
                    </span>
                  </Button>
                )}
                <Popconfirm
                  title={t("admin.aiChat.closeConfirm")}
                  description={t("admin.aiChat.closeConfirmDesc")}
                  onConfirm={handleCloseSession}
                  okText={t("admin.common.yes")}
                  cancelText={t("admin.common.no")}
                >
                  <Button
                    loading={isClosing}
                    size="small"
                    className="bg-yellow-300 text-yellow-900 font-semibold border-none rounded-md shadow-[0_2px_4px_rgba(253,224,71,0.2)] sm:!h-8 sm:!px-4 sm:!text-sm"
                  >
                    {t("admin.aiChat.closeChat")}
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>

          {/* Visitor banner */}
          {selectedChat && (
            <div
              className="px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 shrink-0 shadow-sm z-10 relative border-b"
              style={{ backgroundColor: isDark ? "#422006" : "#FFFBEB", borderColor: isDark ? "#713F12" : "#FDE68A" }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold shadow-sm">
                {selectedChat.visitorName?.charAt(0).toUpperCase() || <IconUser />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs sm:text-sm leading-tight truncate" style={{ color: isDark ? "#FDE047" : "#78350F" }}>
                  {selectedChat.visitorEmail || t("admin.aiChat.noEmail")}
                </div>
                <div className="text-[11px] mt-0.5 truncate" style={{ color: isDark ? "#FBBF24" : "#B45309" }}>
                  {t("admin.aiChat.sessionInfo", {
                    id: selectedChat.sessionToken.slice(0, 8).toUpperCase(),
                    count: selectedChat.questionCount || 0,
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div
            className={`flex-1 min-h-0 p-3 sm:p-6 overflow-y-auto flex flex-col gap-4 sm:gap-6 ${noScrollbar}`}
            style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}
          >
            {loadingDetail ? (
              <div className="flex justify-center items-center h-full">
                <Spin />
              </div>
            ) : selectedChat?.messages?.length > 0 ? (
              selectedChat.messages.map((msg) => {
                const isBot = msg.senderType === "BOT";
                const isAdmin = msg.senderType === "ADMIN";
                const alignLeft = isBot || isAdmin;
                const senderLabel = isBot
                  ? t("admin.aiChat.bot")
                  : isAdmin
                    ? msg.authorName || t("admin.aiChat.admin")
                    : selectedChat.visitorName || t("admin.aiChat.user");
                return (
                  <div key={msg.id} className={`flex gap-2 sm:gap-4 items-start ${alignLeft ? "flex-row" : "flex-row-reverse"}`}>
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: isBot ? primary : isAdmin ? "#059669" : bgCard,
                        color: isBot || isAdmin ? "#ffffff" : textSub,
                        border: !isBot && !isAdmin ? `1px solid ${border}` : "none",
                      }}
                    >
                      {isBot ? <IconBot /> : isAdmin ? (msg.authorName || "A").charAt(0).toUpperCase() : <IconUser />}
                    </div>

                    {/* Bubble */}
                    <div
                      className={`max-w-[82%] sm:max-w-[75%] min-w-0 p-3 sm:p-4 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                        alignLeft ? "rounded-tl-none" : "rounded-tr-none"
                      }`}
                      style={{
                        backgroundColor: isBot ? primary : isAdmin ? "#059669" : bgCard,
                        color: isBot || isAdmin ? "#ffffff" : textMain,
                        border: !isBot && !isAdmin ? `1px solid ${border}` : "none",
                      }}
                    >
                      <div
                        className="text-[10px] sm:text-[11px] font-medium mb-1 sm:mb-1.5"
                        style={{ color: alignLeft ? (isBot ? "#bae6fd" : "#a7f3d0") : textSub }}
                      >
                        {senderLabel} · {formatTime(msg.createdAt, lang)}
                      </div>
                      <div className="text-[13px] sm:text-sm leading-relaxed" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-400 mt-16 sm:mt-24 px-4">{t("admin.aiChat.selectConversation")}</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          {selectedChat && !isClosed ? (
            <div
              className="p-3 sm:p-5 flex flex-col gap-2 shrink-0"
              style={{ backgroundColor: bgCard, borderTop: `1px solid ${border}` }}
            >
              {!isMine && (
                <div className="text-[11px]" style={{ color: textSub }}>
                  {selectedChat.assignedAdminName
                    ? t("admin.aiChat.replyWillTakeOverFromColleague", { name: selectedChat.assignedAdminName })
                    : t("admin.aiChat.replyWillTakeOver")}
                </div>
              )}
              <div className="flex gap-2 sm:gap-4">
                <Input.TextArea
                  placeholder={t("admin.aiChat.replyPlaceholder", { name: selectedChat.visitorName || "" })}
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  maxLength={2000}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  disabled={isReplying}
                  className="rounded-lg min-w-0"
                  style={{ borderColor: border, backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textMain }}
                />
                <Button
                  size="large"
                  loading={isReplying}
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  aria-label={t("admin.aiChat.send")}
                  className="bg-amber-300 text-yellow-900 font-semibold border-none rounded-lg flex items-center justify-center gap-2 px-3 sm:px-6 shrink-0 shadow-[0_2px_4px_rgba(253,224,71,0.2)]"
                >
                  {!isReplying && <IconSend />}
                  {/* Texte masqué sur mobile : seule l'icône reste */}
                  <span className="hidden sm:inline">{t("admin.aiChat.send")}</span>
                </Button>
              </div>
            </div>
          ) : isClosed ? (
            <div
              className="p-4 sm:p-5 text-center text-sm shrink-0"
              style={{ borderTop: `1px solid ${border}`, backgroundColor: isDark ? "#0F172A" : "#F1F5F9", color: textSub }}
            >
              {t("admin.aiChat.closedInfo")}
            </div>
          ) : (
            <div
              className="p-4 sm:p-5 text-center text-sm italic shrink-0"
              style={{ borderTop: `1px solid ${border}`, backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textSub }}
            >
              {t("admin.aiChat.selectConversation")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
