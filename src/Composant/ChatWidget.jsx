import { useState, useRef, useEffect } from 'react'
import {
  CloseOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  WechatOutlined,
  ArrowRightOutlined,
  MailOutlined,
} from '@ant-design/icons'
import {
  ConfigProvider,
  theme,
  Input,
  Button,
  Avatar,
  Tooltip,
  Form,
  message as antMessage,
} from 'antd'
import logo from '../assets/logo.png'
import {
  useStartChatMutation,
  useSendMessageMutation,
  useRequestAdminTransferMutation,
  useGetChatHistoryQuery,
} from '../services/api/chatApi'

export default function ChatWidget({ t, currentLang, onNavigate }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)

  // Intake form state
  const [showIntakeForm, setShowIntakeForm] = useState(false)
  const [visitorName, setVisitorName] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [nameError, setNameError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  // Session state (persisted in localStorage)
  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem('chatSessionToken'))
  const [sessionVisitorName, setSessionVisitorName] = useState(() => localStorage.getItem('chatVisitorName') || '')
  const [sessionStatus, setSessionStatus] = useState(null)
  const [showTransferPrompt, setShowTransferPrompt] = useState(false)

  const bottomRef = useRef(null)
  const inputRef = useRef(null)
  const nameInputRef = useRef(null)

  // API Hooks
  const [startChat] = useStartChatMutation()
  const [sendMessageApi] = useSendMessageMutation()
  const [requestAdmin] = useRequestAdminTransferMutation()

  // Polling history – active only when session exists and in admin mode
  const { data: historyData, refetch } = useGetChatHistoryQuery(sessionToken, {
    skip: !sessionToken,
    pollingInterval: (sessionStatus === 'WAITING_ADMIN' || sessionStatus === 'WITH_ADMIN') ? 5000 : 0,
  })

  // When widget opens: show intake form if no session yet, else go straight to chat
  useEffect(() => {
    if (open) {
      if (!sessionToken) {
        setShowIntakeForm(true)
        // Focus name input after animation
        setTimeout(() => nameInputRef.current?.focus(), 350)
      } else {
        setShowIntakeForm(false)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
    }
  }, [open, sessionToken])

  // Sync session status from polling
  useEffect(() => {
    if (historyData?.data?.status && historyData.data.status !== sessionStatus) {
      setSessionStatus(historyData.data.status)
    }
  }, [historyData, sessionStatus])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historyData, typing, showTransferPrompt])

  const messages = historyData?.data?.messages || []
  const assignedAdmin = historyData?.data?.assignedAdminName || null
  const isClosed = sessionStatus === 'CLOSED'
  const isWaiting = sessionStatus === 'WAITING_ADMIN'
  const isWithAdmin = sessionStatus === 'WITH_ADMIN'

  // ── Start session after form submit ──────────────────────────────
  const handleStartSession = async () => {
    if (!visitorName.trim()) {
      setNameError(currentLang === 'EN' ? 'Please enter your name.' : 'Veuillez entrer votre nom.')
      return
    }
    setNameError('')
    setIsStarting(true)
    try {
      const res = await startChat({
        visitorName: visitorName.trim(),
        visitorEmail: visitorEmail.trim() || null,
      }).unwrap()
      if (res?.data?.sessionToken) {
        setSessionToken(res.data.sessionToken)
        setSessionStatus(res.data.status)
        setSessionVisitorName(visitorName.trim())
        localStorage.setItem('chatSessionToken', res.data.sessionToken)
        localStorage.setItem('chatVisitorName', visitorName.trim())
        setShowIntakeForm(false)
        setTimeout(() => inputRef.current?.focus(), 150)
      }
    } catch (err) {
      antMessage.error('Impossible de démarrer le chat. Réessayez.')
    } finally {
      setIsStarting(false)
    }
  }

  // ── Send message ─────────────────────────────────────────────────
  const sendMessage = async (text) => {
    if (!text.trim() || !sessionToken) return
    setInput('')
    setTyping(true)
    setShowTransferPrompt(false)
    try {
      const res = await sendMessageApi({ sessionToken, message: text.trim() }).unwrap()
      if (res?.data?.showAdminTransfer) setShowTransferPrompt(true)
      refetch()
    } catch {
      antMessage.error("Erreur lors de l'envoi du message.")
    } finally {
      setTyping(false)
    }
  }

  const handleRequestAdmin = async () => {
    if (!sessionToken) return
    try {
      await requestAdmin(sessionToken).unwrap()
      setShowTransferPrompt(false)
      antMessage.success('Un conseiller a été notifié et vous répondra sous peu.')
      refetch()
    } catch {
      antMessage.error('Erreur lors de la demande de transfert.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleIntakeKeyDown = (e) => {
    if (e.key === 'Enter') handleStartSession()
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleTimeString(currentLang === 'EN' ? 'en-GB' : 'fr-FR', {
      hour: '2-digit', minute: '2-digit',
    })
  }

  // ── Reset session (nouvelle conversation) ──────────────────────
  const resetSession = () => {
    localStorage.removeItem('chatSessionToken')
    localStorage.removeItem('chatVisitorName')
    setSessionToken(null)
    setSessionStatus(null)
    setSessionVisitorName('')
    setVisitorName('')
    setVisitorEmail('')
    setShowIntakeForm(true)
    setTimeout(() => nameInputRef.current?.focus(), 350)
  }

  const chatTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
      colorPrimary: '#023B6A',
      borderRadius: 12,
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
      Input: {
        colorBgContainer: '#f8fafc',
        colorBorder: '#e2e8f0',
        colorText: '#1e293b',
        colorTextPlaceholder: '#94a3b8',
        borderRadius: 10,
        paddingBlock: 9,
        paddingInline: 14,
        activeBorderColor: '#023B6A',
        hoverBorderColor: '#023B6A',
        activeShadow: '0 0 0 2px rgba(2,59,106,0.1)',
      },
      Button: { colorPrimary: '#023B6A', colorPrimaryHover: '#034e8a', borderRadius: 10 },
    },
  }

  return (
    <ConfigProvider theme={chatTheme}>
      {/* ── Floating Button ── */}
      <Tooltip
        title={open ? '' : currentLang === 'EN' ? 'Chat with us' : 'Discutez avec nous'}
        placement="left"
        color="#ffe052"
        overlayInnerStyle={{ color: '#023B6A', fontWeight: 'bold', fontSize: '13px', padding: '6px 12px' }}
      >
        <button
          id="chat-widget-button"
          onClick={() => setOpen(!open)}
          aria-label="Open chat support"
          className={`fixed bottom-6 right-6 z-[1000] w-14 h-14 rounded-full border-none cursor-pointer flex items-center justify-center text-white text-[22px] transition-all duration-300 shadow-[0_8px_24px_rgba(2,59,106,0.4)] ${
            open
              ? 'bg-slate-600 scale-90 rotate-90'
              : 'bg-gradient-to-br from-[#023B6A] to-[#0a5fa8] scale-100 rotate-0'
          }`}
          style={{ transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {open ? <CloseOutlined /> : <WechatOutlined />}
          {!open && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </Tooltip>

      {/* ── Chat Window ── */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[1000] w-[360px] rounded-2xl bg-white border border-slate-200 flex flex-col shadow-[0_20px_60px_rgba(2,59,106,0.18),0_4px_16px_rgba(0,0,0,0.10)] overflow-hidden"
          style={{ animation: 'chat-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[#023B6A] to-[#0a5fa8] px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0 border-[2.5px] border-white/50 shadow-sm overflow-hidden p-1">
              <img src={logo} alt="Compulec" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-[15px] leading-tight">
                {isWithAdmin && assignedAdmin ? assignedAdmin : 'COMPULEC Support'}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {isClosed
                  ? <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                  : <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />}
                <span className="text-xs text-white/75">
                  {isClosed ? 'Session terminée'
                    : isWithAdmin ? `Conseiller connecté`
                    : isWaiting ? 'Connexion en cours...'
                    : 'Bot en ligne'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="bg-white/15 hover:bg-white/30 border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer text-white transition-colors duration-200 shrink-0"
            >
              <CloseOutlined className="text-[13px]" />
            </button>
          </div>

          {/* ══════════════════════════════════════════
              INTAKE FORM — avant démarrage de session
          ══════════════════════════════════════════ */}
          {showIntakeForm ? (
            <div className="flex flex-col flex-1 bg-slate-50">
              {/* Illustration / intro */}
              <div className="px-6 pt-7 pb-4 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#023B6A] to-[#0a5fa8] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <WechatOutlined className="text-white text-2xl" />
                </div>
                <h3 className="font-bold text-slate-800 text-[16px] mb-1">
                  {currentLang === 'EN' ? 'Start a conversation' : 'Démarrer une conversation'}
                </h3>
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  {currentLang === 'EN'
                    ? 'Tell us a bit about yourself so we can help you better.'
                    : 'Renseignez-vous pour que nous puissions mieux vous aider.'}
                </p>
              </div>

              {/* Form fields */}
              <div className="px-5 pb-5 flex flex-col gap-4">
                {/* Name */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                    {currentLang === 'EN' ? 'Your name' : 'Votre nom'} <span className="text-red-400">*</span>
                  </label>
                  <Input
                    ref={nameInputRef}
                    prefix={<UserOutlined className="text-slate-400 text-[13px]" />}
                    value={visitorName}
                    onChange={(e) => { setVisitorName(e.target.value); setNameError('') }}
                    onKeyDown={handleIntakeKeyDown}
                    placeholder={currentLang === 'EN' ? 'Jean Dupont' : 'Jean Dupont'}
                    status={nameError ? 'error' : ''}
                    size="large"
                    className="rounded-xl"
                  />
                  {nameError && (
                    <div className="text-red-500 text-[11px] mt-1">{nameError}</div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                    {currentLang === 'EN' ? 'Your email' : 'Votre email'}
                    <span className="text-slate-400 font-normal ml-1">
                      ({currentLang === 'EN' ? 'optional' : 'optionnel'})
                    </span>
                  </label>
                  <Input
                    prefix={<MailOutlined className="text-slate-400 text-[13px]" />}
                    value={visitorEmail}
                    onChange={(e) => setVisitorEmail(e.target.value)}
                    onKeyDown={handleIntakeKeyDown}
                    placeholder="jean@entreprise.com"
                    type="email"
                    size="large"
                    className="rounded-xl"
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="primary"
                  size="large"
                  loading={isStarting}
                  onClick={handleStartSession}
                  className="w-full rounded-xl font-semibold h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-[#023B6A] to-[#0a5fa8] border-none shadow-[0_4px_14px_rgba(2,59,106,0.35)] mt-1"
                  icon={!isStarting ? <ArrowRightOutlined /> : null}
                  iconPosition="end"
                >
                  {isStarting
                    ? (currentLang === 'EN' ? 'Starting...' : 'Démarrage...')
                    : (currentLang === 'EN' ? 'Start chatting' : 'Démarrer le chat')}
                </Button>

                <p className="text-[11px] text-slate-400 text-center -mt-1">
                  {currentLang === 'EN'
                    ? '🔒 Your information is kept confidential.'
                    : '🔒 Vos informations restent confidentielles.'}
                </p>
              </div>
            </div>

          ) : (
            /* ══════════════════════════════════════════
                CHAT VIEW — session démarrée
            ══════════════════════════════════════════ */
            <>
              {/* Visitor identity strip */}
              {sessionToken && (
                <div className="px-4 py-2 bg-[#023B6A]/5 border-b border-[#023B6A]/10 flex items-center gap-2 shrink-0">
                  <Avatar size={22} icon={<UserOutlined />} className="bg-[#023B6A] shrink-0" />
                  <span className="text-[12px] text-slate-600 font-medium">
                    {sessionVisitorName || 'Visiteur Anonyme'}
                  </span>
                  {!isClosed && (
                    <button
                      onClick={resetSession}
                      className="ml-auto text-[11px] text-slate-400 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer underline underline-offset-2"
                    >
                      {currentLang === 'EN' ? 'New session' : 'Nouvelle session'}
                    </button>
                  )}
                </div>
              )}

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden chat-scroll px-4 py-4 pb-2 flex flex-col gap-3 min-h-[200px] max-h-[300px] bg-slate-50">

                {/* Welcome message if no messages yet */}
                {messages.length === 0 && (
                  <div className="flex items-end gap-2 justify-start">
                    <Avatar size={28} icon={<RobotOutlined />} className="bg-[#023B6A] shrink-0 mb-1" />
                    <div className="max-w-[78%] px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm bg-white text-slate-800 rounded-[14px_14px_14px_4px] border border-slate-200">
                      {t.chatbot.welcome}
                    </div>
                  </div>
                )}

                {messages.map((msg) => {
                  const isVisitor = msg.senderType === 'VISITOR'
                  const isAdmin   = msg.senderType === 'ADMIN'
                  const isBot     = msg.senderType === 'BOT'
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${isVisitor ? 'justify-end' : 'justify-start'}`}>
                      {!isVisitor && (
                        <Avatar
                          size={28}
                          icon={isBot ? <RobotOutlined /> : <UserOutlined />}
                          className={`shrink-0 mb-1 ${isAdmin ? 'bg-emerald-600' : 'bg-[#023B6A]'}`}
                        />
                      )}
                      <div
                        className={`max-w-[78%] px-3.5 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                          isVisitor
                            ? 'bg-gradient-to-br from-[#023B6A] to-[#0a5fa8] text-white rounded-[14px_14px_4px_14px]'
                            : isAdmin
                            ? 'bg-emerald-600 text-white rounded-[14px_14px_14px_4px]'
                            : 'bg-white text-slate-800 rounded-[14px_14px_14px_4px] border border-slate-200'
                        }`}
                      >
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                        <div className={`text-[10px] mt-1 opacity-60 ${isVisitor ? 'text-right text-white/80' : 'text-left text-slate-300'}`}>
                          {isAdmin ? 'Conseiller' : isBot ? 'Bot' : ''} {formatTime(msg.createdAt)}
                        </div>
                      </div>
                      {isVisitor && (
                        <Avatar size={28} icon={<UserOutlined />} className="bg-[#ffe052] text-[#023B6A] shrink-0 mb-1" />
                      )}
                    </div>
                  )
                })}

                {/* Typing Indicator */}
                {typing && (
                  <div className="flex items-end gap-2">
                    <Avatar size={28} icon={<RobotOutlined />} className="bg-[#023B6A] shrink-0" />
                    <div className="bg-white border border-slate-200 rounded-[14px_14px_14px_4px] px-4 py-3 flex gap-1.5 items-center shadow-sm">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Transfer Prompt */}
                {showTransferPrompt && !isClosed && (
                  <div className="mt-2 p-3 border border-amber-200 bg-amber-50 rounded-xl shadow-sm">
                    <div className="text-[13px] text-amber-900 mb-2 font-medium">
                      {currentLang === 'EN'
                        ? 'Would you like to speak with a COMPULEC advisor?'
                        : 'Souhaitez-vous être mis en relation avec un conseiller COMPULEC ?'}
                    </div>
                    <div className="flex gap-2">
                      <Button size="small" type="primary" onClick={handleRequestAdmin} style={{ background: '#d97706', borderColor: '#d97706' }}>
                        {currentLang === 'EN' ? 'Yes, connect me' : 'Oui, contacter un humain'}
                      </Button>
                      <Button size="small" onClick={() => setShowTransferPrompt(false)}>
                        {currentLang === 'EN' ? 'No thanks' : 'Non merci'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Waiting for admin */}
                {isWaiting && (
                  <div className="text-center text-xs text-slate-500 italic my-2 flex items-center gap-2 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-pulse" />
                    {currentLang === 'EN'
                      ? 'An advisor has been notified and will reply shortly...'
                      : "Un conseiller a été notifié et vous répondra d'ici peu..."}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Suggested Questions (only at start) */}
              {messages.length === 0 && !typing && !isClosed && (
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 shrink-0">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {currentLang === 'EN' ? 'Suggested Questions' : 'Questions suggérées'}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {t.chatbot.suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q)}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-[13px] text-slate-700 cursor-pointer text-left transition-all duration-200 hover:bg-slate-50 hover:border-[#023B6A] hover:text-[#023B6A]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="px-3.5 py-3 border-t border-slate-200 bg-white flex items-center gap-2.5 shrink-0">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isClosed || !sessionToken}
                  placeholder={
                    isClosed
                      ? (currentLang === 'EN' ? 'Session closed.' : 'Session fermée.')
                      : (currentLang === 'EN' ? 'Type your message...' : 'Écrivez votre message...')
                  }
                  className="flex-1 rounded-xl text-[13px]"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isClosed || !sessionToken}
                  className={`rounded-xl h-9 w-9 p-0 flex items-center justify-center shrink-0 border-none ${
                    input.trim() && !isClosed && sessionToken ? 'bg-gradient-to-br from-[#023B6A] to-[#0a5fa8]' : ''
                  }`}
                />
              </div>

              {/* Footer */}
              <div className="px-4 py-2 text-center bg-white border-t border-slate-50 rounded-b-2xl shrink-0">
                <button
                  onClick={() => { setOpen(false); if (onNavigate) onNavigate('contact') }}
                  className="bg-transparent border-none text-[12px] text-[#023B6A] cursor-pointer font-semibold underline underline-offset-2 hover:text-[#0a5fa8] transition-colors"
                >
                  {currentLang === 'EN' ? 'Go to contact page' : 'Aller à la page de contact'}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes chat-slide-up {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .chat-scroll::-webkit-scrollbar { display: none; }
        .chat-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </ConfigProvider>
  )
}
