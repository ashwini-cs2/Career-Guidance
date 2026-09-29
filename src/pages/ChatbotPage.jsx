import { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, Loader2, RefreshCw, Bot, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api, ApiError } from '../utils/api'

const starters = [
  { label: 'How do I transition into data science?', icon: '🔄' },
  { label: 'What skills are most in demand right now?', icon: '🔥' },
  { label: 'Review my career plan', icon: '📋' },
  { label: 'How to negotiate a higher salary?', icon: '💰' },
  { label: 'Best way to prepare for tech interviews?', icon: '💡' },
  { label: 'What certifications are worth getting?', icon: '🎓' },
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-brand-600' : 'bg-gradient-to-br from-brand-500 to-purple-600'} shadow-md`}>
        {isUser ? <User size={15} className="text-white" /> : <Bot size={15} className="text-white" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
        ? 'bg-brand-600 text-white rounded-tr-md'
        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-md'
      }`}>
        {msg.content.split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <p key={i} className="font-bold mb-1">{line.slice(2, -2)}</p>
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return <p key={i} className="flex gap-2 mb-0.5"><span className="flex-shrink-0 mt-1">•</span><span>{line.slice(2)}</span></p>
          }
          if (line.match(/^\d+\./)) {
            return <p key={i} className="mb-0.5 ml-1">{line}</p>
          }
          return line ? <p key={i} className="mb-1">{line}</p> : <br key={i} />
        })}
        {msg.typing && (
          <div className="flex gap-1 mt-1">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI career advisor. I can help you navigate career transitions, analyze job market trends, plan your learning path, or prepare for interviews.\n\nWhat's on your mind today?` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const bottomRef = useRef()
  const inputRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const content = text || input.trim()
    if (!content || loading) return
    setInput('')
    inputRef.current?.focus()

    setMessages(m => [...m, { role: 'user', content }])
    setLoading(true)
    setMessages(m => [...m, { role: 'assistant', content: '', typing: true }])

    try {
      // POST /api/v1/chat/message — backend keeps the conversation history
      // server-side keyed by session_id, so we only ever send the latest
      // message plus whatever session_id it gave us last time.
      const data = await api.post('/chat/message', {
        message: content,
        session_id: sessionId,
      })
      setSessionId(data.session_id)

      setMessages(m => {
        const updated = [...m]
        updated[updated.length - 1] = { role: 'assistant', content: data.reply }
        return updated
      })
    } catch (err) {
      const friendly = err instanceof ApiError
        ? err.message
        : 'Sorry, I had trouble connecting. Please try again.'
      setMessages(m => {
        const updated = [...m]
        updated[updated.length - 1] = { role: 'assistant', content: friendly }
        return updated
      })
    }
    setLoading(false)
  }

  const reset = () => {
    setMessages([{ role: 'assistant', content: `Chat reset! I'm still here to help with any career questions.` }])
    setInput('')
    setSessionId(null)
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-cyan-500 flex items-center justify-center">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-none">AI Career Advisor</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
              <span className="text-xs text-slate-500">Online · Powered by your backend</span>
            </div>
          </div>
        </div>
        <button onClick={reset} className="btn-ghost text-sm gap-1.5">
          <RefreshCw size={14} /> New chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5">
        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            {starters.map(s => (
              <button key={s.label} onClick={() => send(s.label)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:border-brand-300 dark:hover:border-brand-700 transition-all">
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 md:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex gap-3 items-end max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask about careers, skills, salary, interviews…"
              rows={1}
              className="input resize-none overflow-hidden pr-4 py-3"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={e => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
            />
          </div>
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            className="btn-primary py-3 px-4 self-end disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
