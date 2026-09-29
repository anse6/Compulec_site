import React, { useState, useEffect, useRef } from "react";
import { useAdminTheme } from "../AdminThemeContext";
import { Input, Button, Tag, Popconfirm, Spin, message as antMessage } from "antd";
import { SyncOutlined, CheckCircleOutlined, UserSwitchOutlined, LoadingOutlined } from "@ant-design/icons";
import StatCard from "../Dashboard/StatCard";
import {
  useGetPendingSessionsQuery,
  useGetActiveSessionsQuery,
  useGetClosedSessionsQuery,
  useGetSessionDetailQuery,
  useAdminReplyMutation,
  useCloseSessionMutation,
} from "../../../services/api/chatApi";

const { Search } = Input;

// --- ICONS ---
const IconMessage = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);
const IconUserCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <polyline points="17 11 19 13 23 9"></polyline>
  </svg>
);
const IconCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);
const IconBot = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// --- STATUS COMPONENT ---
const AICHAT_STATUS_CONFIG = {
  'WITH_ADMIN':      { color: 'purple',  label: 'En cours',      icon: <SyncOutlined spin /> },
  'WAITING_ADMIN': { color: 'gold',    label: 'En attente', icon: <UserSwitchOutlined /> },
  'CLOSED':   { color: 'green',   label: 'Terminé',   icon: <CheckCircleOutlined /> },
};

function AIChatStatusBadge({ status }) {
  const cfg = AICHAT_STATUS_CONFIG[status] || AICHAT_STATUS_CONFIG['WAITING_ADMIN'];
  return (
    <Tag
      icon={cfg.icon}
      color={cfg.color}
      style={{ borderRadius: 999, padding: '1px 8px', fontWeight: 600, margin: 0, fontSize: 11 }}
    >
      {cfg.label}
    </Tag>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// --- MAIN COMPONENT ---
export default function AdminAIChat() {
  const isDark = useAdminTheme();
  const bgCard = isDark ? "#1E293B" : "#ffffff";
  const border = isDark ? "#334155" : "#E2E8F0";
  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#64748B";
  const primary = isDark ? "#38bdf8" : "#023B6A";

  const [activeTab, setActiveTab] = useState("Transferred"); // Transferred (waiting), Active, Closed
  const [selectedToken, setSelectedToken] = useState(null);
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  // Queries (with polling for real-time updates)
  const { data: pendingData, isLoading: loadingPending } = useGetPendingSessionsQuery(undefined, { pollingInterval: 5000 });
  const { data: activeData, isLoading: loadingActive } = useGetActiveSessionsQuery(undefined, { pollingInterval: 5000 });
  const { data: closedData, isLoading: loadingClosed } = useGetClosedSessionsQuery(undefined, { pollingInterval: 10000 });
  
  // Detail query for selected chat
  const { data: detailData, isLoading: loadingDetail } = useGetSessionDetailQuery(selectedToken, { 
    skip: !selectedToken,
    pollingInterval: 3000 // fast polling for active conversation
  });

  // Mutations
  const [adminReply, { isLoading: isReplying }] = useAdminReplyMutation();
  const [closeSession, { isLoading: isClosing }] = useCloseSessionMutation();

  const pendingSessions = pendingData?.data || [];
  const activeSessions = activeData?.data || [];
  const closedSessions = closedData?.data || [];
  
  const displaySessions = activeTab === "Transferred" 
    ? pendingSessions 
    : activeTab === "Active" 
      ? activeSessions 
      : closedSessions;
      
  const selectedChat = detailData?.data;

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedToken) return;
    try {
      await adminReply({ sessionToken: selectedToken, message: replyText.trim() }).unwrap();
      setReplyText("");
    } catch (err) {
      antMessage.error("Erreur lors de l'envoi de la réponse.");
    }
  };

  const handleCloseSession = async () => {
    if (!selectedToken) return;
    try {
      await closeSession(selectedToken).unwrap();
      antMessage.success("Session clôturée avec succès.");
      setSelectedToken(null);
    } catch (err) {
      antMessage.error("Erreur lors de la clôture.");
    }
  };

  const noScrollbar = "[&::-webkit-scrollbar]:hidden [&::-webkit-scrollbar]:w-0 [scrollbar-width:none] [-ms-overflow-style:none]";

  return (
    <div className="pb-10 font-['Poppins',sans-serif] w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold  mb-1" style={{ color: textMain }}>AI Chat</h1>
        <p className="text-sm  m-0" style={{ color: textSub }}>
          Supervisez les conversations du bot et reprenez la main quand nécessaire.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-5 mb-6 h-40">
        <StatCard
          title="Sessions Actives"
          value={activeSessions.length < 10 ? `0${activeSessions.length}` : activeSessions.length}
          subtitle="En cours avec un conseiller"
          icon={<IconMessage />}
          iconBg={isDark ? "#312E81" : "#E0E7FF"}
          iconColor={isDark ? "#A5B4FC" : "#6366F1"}
          cardBg={isDark ? "#1E1B4B" : "#EEF2FF"}
          cardBorder={isDark ? "#3730A3" : "#E0E7FF"}
          textColor={isDark ? "#A5B4FC" : "#4F46E5"}
        />

        <StatCard
          title="En Attente"
          value={pendingSessions.length < 10 ? `0${pendingSessions.length}` : pendingSessions.length}
          subtitle="Transféré par le bot"
          icon={<IconUserCheck />}
          iconBg={isDark ? "#064E3B" : "#A7F3D0"}
          iconColor={isDark ? "#6EE7B7" : "#10B981"}
          cardBg={isDark ? "#022C22" : "#D1FAE5"}
          cardBorder={isDark ? "#065F46" : "#A7F3D0"}
          textColor={isDark ? "#34D399" : "#059669"}
        />

        <StatCard
          title="Total"
          value={activeSessions.length + pendingSessions.length + closedSessions.length}
          subtitle="Toutes les sessions"
          icon={<IconCheckCircle />}
          iconBg={isDark ? "#713F12" : "#FEF08A"}
          iconColor={isDark ? "#FDE047" : "#EAB308"}
          cardBg={isDark ? "#422006" : "#FEF9C3"}
          cardBorder={isDark ? "#92400E" : "#FEF08A"}
          textColor={isDark ? "#FCD34D" : "#CA8A04"}
        />
      </div>

      {/* Main Layout: Sidebar + Chat View */}
      <div className="flex gap-6 h-[600px]">
        {/* Left Sidebar */}
        <div className="w-[350px] flex flex-col gap-4">
          {/* Search & Tabs */}
          <div className=" rounded-xl p-4" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
            <Search placeholder="Rechercher..." className="mb-4" />

            <div className="flex justify-between  p-1 rounded-lg" style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
              {["Transferred", "Active", "Closed"].map((tab) => {
                const isActive = activeTab === tab;
                const count = tab === "Transferred" ? pendingSessions.length 
                            : tab === "Active" ? activeSessions.length 
                            : closedSessions.length;
                const label = tab === "Transferred" ? "En attente" 
                            : tab === "Active" ? "En cours" 
                            : "Terminées";
                
                return (
                  <div
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-1.5 text-[11px] rounded-md cursor-pointer flex-1 text-center transition-all ${isActive ? "font-semibold shadow-sm" : "font-medium"}`}
                    style={{
                      color: isActive ? textMain : textSub,
                      backgroundColor: isActive ? bgCard : "transparent"
                    }}
                  >
                    {label} ({count})
                  </div>
                );
              })}
            </div>
          </div>

          {/* List of Chats */}
          <div className={`flex-1 rounded-xl overflow-y-auto ${noScrollbar}`} style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
            {loadingPending || loadingActive || loadingClosed ? (
              <div className="flex justify-center items-center h-full"><Spin /></div>
            ) : displaySessions.length === 0 ? (
              <div className="text-center text-slate-400 mt-10 text-sm">Aucune session</div>
            ) : (
              displaySessions.map((chat, idx) => (
                <div
                  key={chat.sessionToken}
                  onClick={() => setSelectedToken(chat.sessionToken)}
                  className={`p-4 cursor-pointer transition-colors border-l-4 ${idx !== displaySessions.length - 1 ? "border-b" : ""}`}
                  style={{
                    backgroundColor: selectedToken === chat.sessionToken ? (isDark ? "#0F172A" : "#F8FAFC") : bgCard,
                    borderColor: selectedToken === chat.sessionToken ? primary : "transparent",
                    borderBottomColor: idx !== displaySessions.length - 1 ? border : "transparent"
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold  text-sm truncate max-w-[150px]" style={{ color: textMain }}>
                      {chat.visitorName || "Anonyme"}
                    </span>
                    <AIChatStatusBadge status={chat.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] " style={{ color: textSub }}>
                      {chat.questionCount || 0} question(s)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatTime(chat.updatedAt || chat.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Chat View */}
        <div className="flex-1  rounded-xl flex flex-col" style={{ backgroundColor: bgCard, border: `1px solid ${border}` }}>
          {/* Chat Header */}
          <div className="px-6 py-5 border-b  flex justify-between items-center" style={{ borderColor: border }}>
            <h2 className="text-lg font-bold  m-0" style={{ color: textMain }}>
              {selectedChat ? `Session avec ${selectedChat.visitorName}` : "Sélectionnez une conversation"}
            </h2>
            {selectedChat && selectedChat.status !== 'CLOSED' && (
              <div className="flex gap-3">
                <Popconfirm
                  title="Clôturer cette session ?"
                  onConfirm={handleCloseSession}
                  okText="Oui"
                  cancelText="Non"
                >
                  <Button 
                    loading={isClosing}
                    className="bg-yellow-300 text-yellow-900 font-semibold border-none rounded-md shadow-[0_2px_4px_rgba(253,224,71,0.2)]"
                  >
                    Clôturer la session
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>

          {/* Chat Transcript Area */}
          {selectedChat && (
            <div className="px-6 py-3 flex items-center gap-3 shrink-0 shadow-sm z-10 relative border-b" style={{ backgroundColor: isDark ? "#422006" : "#FFFBEB", borderColor: isDark ? "#713F12" : "#FDE68A" }}>
              <div className="w-10 h-10 rounded-full bg-amber-400 text-white flex items-center justify-center font-bold shadow-sm">
                {selectedChat.visitorName?.charAt(0).toUpperCase() || <IconUser />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-sm leading-tight" style={{ color: isDark ? "#FDE047" : "#78350F" }}>
                  Vous répondez à {selectedChat.visitorName || "Anonyme"}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: isDark ? "#FBBF24" : "#B45309" }}>
                  {selectedChat.visitorEmail || "Aucun email fourni"}
                </div>
              </div>
              <Tag color="gold" className="m-0 font-medium" style={{ borderColor: isDark ? "#B45309" : "#FCD34D" }}>Session active</Tag>
            </div>
          )}

          <div className={`flex-1 p-6 overflow-y-auto flex flex-col gap-6 ${noScrollbar}`}
            style={{ backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }}>
            {loadingDetail ? (
              <div className="flex justify-center items-center h-full"><Spin /></div>
            ) : selectedChat?.messages?.length > 0 ? (
              selectedChat.messages.map((msg) => {
                // senderType: "BOT", "VISITOR", "ADMIN"
                const isBot = msg.senderType === 'BOT';
                const isAdmin = msg.senderType === 'ADMIN';
                const isVisitor = msg.senderType === 'VISITOR';
                // Bot et Admin s'affichent à gauche, Visiteur à droite
                const alignLeft = isBot || isAdmin;
                const senderLabel = isBot ? 'Bot' : isAdmin ? 'Admin' : 'Visiteur';
                return (
                  <div key={msg.id} className={`flex gap-4 items-start ${alignLeft ? "flex-row" : "flex-row-reverse"}`}>
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{
                        backgroundColor: isBot ? primary : isAdmin ? "#059669" : bgCard,
                        color: isBot || isAdmin ? "#ffffff" : textSub,
                        border: (!isBot && !isAdmin) ? `1px solid ${border}` : "none"
                      }}>
                      {isBot ? <IconBot /> : isAdmin ? 'A' : <IconUser />}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-[75%] p-4 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${alignLeft ? "rounded-tl-none" : "rounded-tr-none"}`}
                      style={{
                        backgroundColor: isBot ? primary : isAdmin ? "#059669" : bgCard,
                        color: isBot || isAdmin ? "#ffffff" : textMain,
                        border: (!isBot && !isAdmin) ? `1px solid ${border}` : "none"
                      }}>
                      <div className="text-[11px] font-medium mb-1.5" style={{ color: alignLeft ? (isBot ? "#bae6fd" : "#a7f3d0") : textSub }}>
                        {senderLabel} · {formatTime(msg.createdAt)}
                      </div>
                      <div className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-400 mt-24">
                Aucun message à afficher.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          {selectedChat && selectedChat.status !== 'CLOSED' ? (
            <div className="p-5 border-t flex gap-4" style={{ backgroundColor: bgCard, borderColor: border, borderTopWidth: 1, borderTopStyle: "solid" }}>
              <Input
                placeholder={`Répondre à ${selectedChat.visitorName || 'Anonyme'}...`}
                size="large"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onPressEnter={handleSendReply}
                disabled={isReplying}
                className="rounded-lg"
                style={{ borderColor: border, backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textMain }}
              />
              <Button
                size="large"
                loading={isReplying}
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="bg-amber-300 text-yellow-900 font-semibold border-none rounded-lg flex items-center gap-2 px-6 shadow-[0_2px_4px_rgba(253,224,71,0.2)]"
              >
                {!isReplying && <IconSend />} {isReplying ? 'Envoi...' : 'Envoyer'}
              </Button>
            </div>
          ) : selectedChat?.status === 'CLOSED' ? (
            <div className="p-5 border-t text-center text-sm" style={{ borderColor: border, backgroundColor: isDark ? "#0F172A" : "#F1F5F9", color: textSub }}>
              Cette session est clôturée. Vous ne pouvez plus répondre.
            </div>
          ) : (
            <div className="p-5 border-t text-center text-sm italic" style={{ borderColor: border, backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textSub }}>
              Sélectionnez une conversation à gauche pour commencer à discuter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
