import { useState, useRef, useEffect } from 'react'
import { MessageOutlined, CloseOutlined, SendOutlined } from '@ant-design/icons'
import logo from '../assets/logo.png'

function getBotResponse(text, t, lang) {
  const lower = text.toLowerCase()
  const a = t.chatbot.answers
  if (lower.includes('service') || lower.includes('offr') || lower.includes('offer') || lower.includes('speciali')) return a.services
  if (lower.includes('office') || lower.includes('bureau') || lower.includes('locat') || lower.includes('adress') || lower.includes('situé')) return a.location
  if (lower.includes('quote') || lower.includes('devis') || lower.includes('consult') || lower.includes('contact') || lower.includes('price') || lower.includes('prix')) return a.quote
  if (lower.includes('hour') || lower.includes('heure') || lower.includes('open') || lower.includes('ouvert') || lower.includes('support') || lower.includes('24')) return a.hours
  return a.fallback
}

export default function ChatWidget({ t, currentLang }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Show greeting message on open
  useEffect(() => {
    if (open && !hasGreeted) {
      setMessages([
        { from: 'bot', text: t.chatbot.welcome, time: new Date() }
      ])
      setHasGreeted(true)
    }
  }, [open, hasGreeted, t])

  // Reset greeting when language changes
  useEffect(() => {
    if (open) {
      setMessages([{ from: 'bot', text: t.chatbot.welcome, time: new Date() }])
    }
  }, [currentLang]) // eslint-disable-line

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { from: 'user', text: text.trim(), time: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    setTimeout(() => {
      const response = getBotResponse(text, t, currentLang)
      setMessages(prev => [...prev, { from: 'bot', text: response, time: new Date() }])
      setTyping(false)
    }, 900 + Math.random() * 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const formatTime = (date) =>
    date.toLocaleTimeString(currentLang === 'EN' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* Floating Button */}
      <button
        id="chat-widget-button"
        onClick={() => setOpen(!open)}
        aria-label="Open chat support"
        className={`fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-500 shadow-2xl shadow-blue-600/30 flex items-center justify-center text-white transition-all duration-300 cursor-pointer ${
          open ? 'scale-90 rotate-12' : 'scale-100 rotate-0'
        } hover:scale-105 active:scale-95`}
      >
        {open ? <CloseOutlined className="text-xl" /> : <MessageOutlined className="text-xl" />}
        {!open && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-[100] w-80 sm:w-96 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
            maxHeight: '480px',
            animation: 'slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-4 bg-blue-600/90 border-b border-white/10">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <img src={logo} alt="Compulec" className="w-8 h-8 object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">
                Compulec {currentLang === 'EN' ? 'Support' : 'Assistance'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-blue-200">{currentLang === 'EN' ? 'Online · Virtual Assistant' : 'En ligne · Assistant Virtuel'}</span>
              </div>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '240px', maxHeight: '280px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white/8 text-slate-200 rounded-bl-sm border border-white/5'
                  }`}
                >
                  {msg.text}
                  <div className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-blue-200 text-right' : 'text-slate-500'}`}>
                    {formatTime(msg.time)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white/8 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-slate-400"
                      style={{ animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && !typing && (
            <div className="px-4 pb-2 flex flex-col gap-1.5">
              {t.chatbot.suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left text-xs text-blue-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="flex items-center gap-2 p-3 border-t border-white/10 bg-white/3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentLang === 'EN' ? 'Type your message...' : 'Tapez votre message...'}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all cursor-pointer"
            >
              <SendOutlined className="text-sm" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95) }
          to   { opacity: 1; transform: translateY(0)    scale(1)    }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
      `}</style>
    </>
  )
}
