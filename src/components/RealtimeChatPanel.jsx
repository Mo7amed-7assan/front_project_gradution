import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { listenToConversationMessages, sendRealtimeMessage } from '../services/realtimeChat'

const getConversationLabel = (conversation) =>
  conversation?.title ||
  conversation?.name ||
  conversation?.conversation_type ||
  `Conversation ${conversation?.id || ''}`

const getUserName = (user) =>
  user?.full_name || user?.name || user?.username || user?.email || 'You'

const formatMessageTime = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

  const currentConversation = useMemo(
    () => conversations.find((conversation) => String(conversation.id) === String(selectedConversationId)),
    [conversations, selectedConversationId]
  )

  useEffect(() => {
    setMessages([])
    setChatError(null)
    if (!selectedConversationId) return undefined

    return listenToConversationMessages(
      selectedConversationId,
      setMessages,
      (err) => setChatError(err?.message || 'Failed to load realtime messages.')
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
    } catch (err) {
      setChatError(err?.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="border rounded-lg bg-white overflow-hidden flex flex-col min-h-[32rem]">
      <div className="px-4 py-3 border-b bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900">Messages</h3>
            <p className="text-xs text-gray-500 truncate">
              {currentConversation ? getConversationLabel(currentConversation) : 'Choose a connection to chat'}
            </p>
          </div>

          {showConversationSelector && conversations.length > 0 && (
            <select
              value={selectedConversationId || ''}
              onChange={(event) => onSelectConversation?.(event.target.value)}
              className={`${compact ? 'w-full' : 'w-full sm:w-56'} border rounded px-3 py-2 text-sm bg-white`}
            >
              {conversations.map((conversation) => (
                <option key={conversation.id} value={conversation.id}>
                  {getConversationLabel(conversation)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {chatError && (
        <div className="m-4 p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
          {chatError}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {!selectedConversationId ? (
          <div className="h-full min-h-72 flex items-center justify-center text-center text-gray-500">
            Choose someone from your connections.
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full min-h-72 flex items-center justify-center text-center text-gray-500">
            No messages yet. Start the conversation.
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMine = String(message.senderId) === String(user?.id)
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-lg px-3 py-2 shadow-sm ${
                    isMine ? 'bg-blue-600 text-white' : 'bg-white text-gray-900 border'
                  }`}>
                    {!isMine && (
                      <p className="text-xs font-medium mb-1 text-gray-500">{message.senderName || 'User'}</p>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                    <p className={`text-[11px] mt-1 text-right ${isMine ? 'text-blue-100' : 'text-gray-400'}`}>
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={!selectedConversationId || sending}
            placeholder="Write a message..."
            className="flex-1 border rounded px-3 py-2 text-sm disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!draft.trim() || !selectedConversationId || sending}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </section>
  )
}
