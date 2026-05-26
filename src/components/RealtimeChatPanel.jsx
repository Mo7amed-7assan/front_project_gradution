import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listenToConversationMessages, sendRealtimeMessage } from '../services/realtimeChat'

const getConversationLabel = (c) =>
  c?.title || c?.name || c?.conversation_type || `Conversation ${c?.id || ''}`

const getUserName = (user) =>
  user?.full_name || user?.name || user?.username || user?.email || 'You'

const formatMessageTime = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function Avatar({ name, isMine }) {
  const letter = (name || 'U').charAt(0).toUpperCase()
  if (isMine) {
    return (
      <div className="w-8 h-8 rounded-full bg-brand-secondary flex items-center justify-center text-white text-xs font-bold shrink-0 border-2 border-white shadow-sm z-10 relative">
        {letter}
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center text-white text-xs font-bold shrink-0 border-2 border-white shadow-sm z-10 relative">
      {letter}
    </div>
  )
}

function ChatPlaceholder({ hasConversation }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-3xl bg-brand-primaryLight/50 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-brand-secondary">
        {hasConversation ? 'It\'s quiet here... too quiet.' : 'Select a connection'}
      </p>
      <p className="text-xs text-slate-500 mt-1 max-w-xs">
        {hasConversation ? 'Break the ice! Send a message or share an idea below.' : 'Choose someone from your connections list to start chatting.'}
      </p>
    </div>
  )
}

export default function RealtimeChatPanel({
  conversations = [],
  selectedConversationId,
  onSelectConversation,
  compact = false,
  showConversationSelector = true,
}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const currentConversation = useMemo(
    () => conversations.find(c => String(c.id) === String(selectedConversationId)),
    [conversations, selectedConversationId]
  )

  useEffect(() => {
    setMessages([])
    setChatError(null)
    if (!selectedConversationId) return undefined
    return listenToConversationMessages(
      selectedConversationId,
      setMessages,
      (err) => setChatError(err?.message || 'Failed to load messages.')
    )
  }, [selectedConversationId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (event) => {
    event.preventDefault()
    setChatError(null)
    const text = draft.trim()
    if (!text || !selectedConversationId) return
    setSending(true)
    try {
      await sendRealtimeMessage(selectedConversationId, {
        text,
        senderId: user?.id,
        senderName: getUserName(user),
        senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
      })
      setDraft('')
      inputRef.current?.focus()
    } catch (err) {
      setChatError(err?.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
  }

  // Quick Action Handlers (Visual placeholders for future integration)
  const handleAttach = () => console.log('Attach file')
  const handleEmoji = () => console.log('Insert emoji')
  const handleCode = () => {
    setDraft(prev => prev + '\n```\n// Your code here\n```\n')
    inputRef.current?.focus()
  }

  return (
    <section className="card flex flex-col overflow-hidden bg-white shadow-xl shadow-brand-primary/5 border-brand-primaryLight" style={{ minHeight: '36rem' }}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md shrink-0 z-10 sticky top-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
             <div className="w-10 h-10 rounded-xl bg-brand-primaryLight flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
             </div>
             <div className="min-w-0">
                <h3 className="font-bold text-brand-secondary text-sm truncate">
                  {currentConversation ? getConversationLabel(currentConversation) : 'Live Chat'}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                  <p className="text-xs text-slate-500 truncate">
                    {selectedConversationId ? 'Connected & Secured' : 'Select a conversation'}
                  </p>
                </div>
             </div>
          </div>
          {showConversationSelector && conversations.length > 0 && (
            <select
              value={selectedConversationId || ''}
              onChange={(e) => onSelectConversation?.(e.target.value)}
              className="form-select text-xs py-2 w-48 bg-slate-50 border-none focus:ring-1 focus:ring-brand-primary"
            >
              {conversations.map(c => (
                <option key={c.id} value={c.id}>{getConversationLabel(c)}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error */}
      {chatError && (
        <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs shrink-0 flex items-center gap-2">
           <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
          {chatError}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 scrollbar-thin relative">
        {!selectedConversationId ? (
          <ChatPlaceholder hasConversation={false} />
        ) : messages.length === 0 ? (
          <ChatPlaceholder hasConversation={true} />
        ) : (
          <div className="space-y-6 relative">
            {/* Subtle thread line for visual connection */}
            <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-200/60 z-0"></div>
            
            {messages.map((message, idx) => {
              const isMine = String(message.senderId) === String(user?.id)
              const isLast = idx === messages.length - 1
              const prevMine = idx > 0 && String(messages[idx - 1].senderId) === String(user?.id)
              
              return (
                <div key={message.id} className={`flex items-end gap-3 relative ${isMine ? 'flex-row-reverse' : 'flex-row'} ${prevMine === isMine ? 'mt-2' : 'mt-6'}`}>
                  {(!isMine || true) && ( // Always render space for alignment, but only show avatar if not mine or if we want to show our own
                     <div className={`shrink-0 ${isMine ? 'hidden sm:block' : 'block'}`}>
                        <Avatar name={message.senderName} isMine={isMine} />
                     </div>
                  )}
                  
                  <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    {(!isMine && prevMine !== isMine) && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">
                        {message.senderName || 'User'}
                      </span>
                    )}
                    
                    <div className={`px-4 py-3 text-sm shadow-sm relative group ${
                      isMine
                        ? 'bg-brand-primary text-white rounded-2xl rounded-br-sm'
                        : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-sm'
                    }`}>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
                      
                      {/* Message Actions (Hover) */}
                      <div className={`absolute top-1/2 -translate-y-1/2 ${isMine ? '-left-12' : '-right-12'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}>
                         <button className="p-1 rounded bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-brand-primary transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         </button>
                      </div>
                    </div>
                    <span className={`text-[9px] font-medium text-slate-400 mt-1.5 ${isMine ? 'mr-1' : 'ml-1'}`}>
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 bg-white shrink-0 z-10">
        <div className="flex flex-col gap-2 p-1 rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary/50 transition-all">
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!selectedConversationId || sending}
            placeholder={selectedConversationId ? 'Message...' : 'Select a conversation first'}
            className="w-full bg-transparent resize-none px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none min-h-[44px] max-h-32 leading-relaxed"
            onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px' }}
          />
          
          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between px-2 pb-2">
             <div className="flex items-center gap-1">
                <button type="button" onClick={handleAttach} disabled={!selectedConversationId} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-brand-primaryLight/50 transition-colors disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                </button>
                <button type="button" onClick={handleEmoji} disabled={!selectedConversationId} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-brand-primaryLight/50 transition-colors disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                <button type="button" onClick={handleCode} disabled={!selectedConversationId} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-brand-primaryLight/50 transition-colors disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </button>
             </div>
             
             <button
               type="submit"
               disabled={!draft.trim() || !selectedConversationId || sending}
               className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-brand-primary text-white shadow-sm shadow-brand-primary/30 hover:bg-brand-primaryDark transition-all disabled:opacity-50 disabled:shadow-none shrink-0"
             >
               {sending ? (
                 <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                 </svg>
               ) : (
                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                   <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                 </svg>
               )}
             </button>
          </div>
        </div>
      </form>
    </section>
  )
}
