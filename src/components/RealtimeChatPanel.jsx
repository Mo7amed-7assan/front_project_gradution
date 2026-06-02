import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buildCallFrameUrl, cancelCall, endCall, getCall, initiateCall, joinCall, leaveCall } from '../services/calls'
import { listenToConversationMessages, sendRealtimeMessage } from '../services/realtimeChat'

const EMOJIS = ['😀', '😂', '😍', '😎', '😊', '👍', '🔥', '🎉', '❤️', '🙏', '💡', '✅', '🚀', '👏', '😅', '🤝', '💬', '⭐']
const MAX_INLINE_FILE_SIZE = 4 * 1024 * 1024

const getConversationLabel = (c) =>
  c?.title || c?.name || c?.conversation_type || `Conversation ${c?.id || ''}`

const getConversationId = (conversation) =>
  conversation?.id || conversation?.uuid || conversation?.conversation_id

const getUserName = (user) =>
  user?.full_name || user?.name || user?.username || user?.email || 'You'

const getCallId = (call) =>
  call?.id || call?.uuid || call?.call_id

const isCallJoinable = (call) =>
  ['scheduled', 'active'].includes(`${call?.status || ''}`.toLowerCase())

const formatMessageTime = (value) => {
  const date = value?.toDate ? value.toDate() : value ? new Date(value) : null
  if (!date || Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

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
  selectedConversation,
  selectedPersonPresence,
  onSelectConversation,
  onStartConversationCall,
  onJoinConversationCall,
  compact = false,
  showConversationSelector = true,
  hideHeader = false,
}) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [chatError, setChatError] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [recording, setRecording] = useState(false)
  const [startingCall, setStartingCall] = useState(false)
  const [joiningCallId, setJoiningCallId] = useState('')
  const [hiddenCallIds, setHiddenCallIds] = useState([])
  const [verifiedIncomingCall, setVerifiedIncomingCall] = useState(null)
  const [checkingIncomingCall, setCheckingIncomingCall] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const navigate = useNavigate()

  const currentConversation = useMemo(
    () => selectedConversation || conversations.find(c => String(getConversationId(c)) === String(selectedConversationId)),
    [conversations, selectedConversationId, selectedConversation]
  )

  const goToProfile = (userId) => {
    if (!userId) return
    const normalized = String(userId)
    if (normalized === String(user?.id)) {
      navigate('/profile')
      return
    }
    navigate(`/users/${normalized}`)
  }

  const latestIncomingCandidate = useMemo(() => {
    return [...messages].reverse().find((message) =>
      message.messageType === 'call_invite' &&
      message.callId &&
      !hiddenCallIds.includes(String(message.callId)) &&
      String(message.senderId) !== String(user?.id)
    )
  }, [hiddenCallIds, messages, user?.id])

  const hideCall = (callId) => {
    if (!callId) return
    setHiddenCallIds((prev) => {
      const normalized = String(callId)
      return prev.includes(normalized) ? prev : [...prev, normalized]
    })
  }

  useEffect(() => {
    setMessages([])
    setChatError(null)
    if (!selectedConversationId) return undefined
    return listenToConversationMessages(
      selectedConversationId,
      currentConversation?.conversation_type,
      setMessages,
      (err) => setChatError(err?.message || 'Failed to load messages.')
    )
  }, [selectedConversationId, currentConversation?.conversation_type])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let ignore = false
    const callId = latestIncomingCandidate?.callId
    let intervalId = null

    setVerifiedIncomingCall(null)
    if (!callId) {
      setCheckingIncomingCall(false)
      return undefined
    }

    const verifyIncomingCall = (showLoading = false) => {
      if (showLoading) setCheckingIncomingCall(true)
      return getCall(callId)
      .then((call) => {
        if (ignore) return
        if (isCallJoinable(call)) {
          setVerifiedIncomingCall({
            ...latestIncomingCandidate,
            callConversationId: call?.conversation_id || latestIncomingCandidate.callConversationId || selectedConversationId,
            callProjectId: call?.project_id || latestIncomingCandidate.callProjectId || '',
          })
          return
        }
        hideCall(callId)
      })
      .catch(() => {
        if (!ignore) hideCall(callId)
      })
      .finally(() => {
        if (!ignore && showLoading) setCheckingIncomingCall(false)
      })
    }

    verifyIncomingCall(true)
    intervalId = window.setInterval(() => verifyIncomingCall(false), 5000)

    return () => {
      ignore = true
      if (intervalId) window.clearInterval(intervalId)
    }
  }, [latestIncomingCandidate])

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
      }, currentConversation?.conversation_type)
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

  const handleAttach = () => fileInputRef.current?.click()

  const handleEmoji = () => setShowEmojiPicker((value) => !value)

  const appendEmoji = (emoji) => {
    setDraft((prev) => `${prev}${emoji}`)
    setShowEmojiPicker(false)
    inputRef.current?.focus()
  }

  const sendAttachment = async (file) => {
    if (!file || !selectedConversationId) return
    if (file.size > MAX_INLINE_FILE_SIZE) {
      setChatError('File is too large. Please choose a file under 4 MB.')
      return
    }

    setSending(true)
    setChatError(null)
    try {
      const fileData = await fileToDataUrl(file)
      await sendRealtimeMessage(selectedConversationId, {
        text: file.type.startsWith('image/') ? 'Sent an image.' : `Sent a file: ${file.name}`,
        senderId: user?.id,
        senderName: getUserName(user),
        senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
        messageType: file.type.startsWith('image/') ? 'image' : 'file',
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileData,
      }, currentConversation?.conversation_type)
    } catch (err) {
      setChatError(err?.message || 'Failed to send file.')
    } finally {
      setSending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    sendAttachment(file)
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  const startRecording = async () => {
    if (!selectedConversationId || recording) return
    setChatError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      audioChunksRef.current = []
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        setRecording(false)
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (!audioBlob.size) return
        if (audioBlob.size > MAX_INLINE_FILE_SIZE) {
          setChatError('Voice note is too large. Please record a shorter note.')
          return
        }

        setSending(true)
        try {
          const audioData = await fileToDataUrl(audioBlob)
          await sendRealtimeMessage(selectedConversationId, {
            text: 'Sent a voice note.',
            senderId: user?.id,
            senderName: getUserName(user),
            senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
            messageType: 'audio',
            audioData,
            audioType: audioBlob.type || 'audio/webm',
          }, currentConversation?.conversation_type)
        } catch (err) {
          setChatError(err?.message || 'Failed to send voice note.')
        } finally {
          setSending(false)
        }
      }

      recorder.start()
      setRecording(true)
    } catch (err) {
      setChatError('Microphone permission is required to record audio.')
    }
  }

  const handleAudioRecord = () => {
    if (recording) stopRecording()
    else startRecording()
  }

  const handleCode = () => {
    setDraft(prev => prev + '\n```\n// Your code here\n```\n')
    inputRef.current?.focus()
  }

  const openCallWindow = (url, callWindow) => {
    if (!url) throw new Error('The call did not return a room URL.')

    if (callWindow && !callWindow.closed) {
      callWindow.location.href = url
      callWindow.focus()
      return callWindow
    }

    const opened = window.open(url, '_blank')
    if (!opened) throw new Error('Please allow pop-ups to open the call room.')
    opened.opener = null
    return opened
  }

  const closeCallOnWindowClose = (callId, callWindow, isHost = false) => {
    if (!callId || !callWindow) return

    const intervalId = window.setInterval(async () => {
      if (!callWindow.closed) return
      window.clearInterval(intervalId)

      try {
        const call = await getCall(callId)
        const status = `${call?.status || ''}`.toLowerCase()
        if (status === 'scheduled') await cancelCall(callId)
        else if (status === 'active' && isHost) await endCall(callId)
        else if (status === 'active') await leaveCall(callId)
      } catch (err) {
        // The call may already be closed by another participant.
      }
    }, 1500)
  }

  const handleStartCall = async () => {
    if (!selectedConversationId || startingCall) return
    let callWindow = null
    setStartingCall(true)
    setChatError(null)

    try {
      if (onStartConversationCall) {
        await onStartConversationCall(selectedConversationId)
        return
      }

      callWindow = window.open('about:blank', '_blank')
      const call = await initiateCall({
        conversation_id: selectedConversationId,
        status: 'active',
      })
      const callId = getCallId(call)
      const callUrl = buildCallFrameUrl(call)

      if (!callId) throw new Error('The call was created, but no call ID was returned.')

      await sendRealtimeMessage(selectedConversationId, {
        text: `${getUserName(user)} started a video call.`,
        senderId: user?.id,
        senderName: getUserName(user),
        senderAvatar: user?.avatar || user?.avatar_url || user?.profile_photo_url,
        messageType: 'call_invite',
        callId,
        callConversationId: call?.conversation_id || selectedConversationId,
        callRoomName: call?.room_name || '',
      })

      const openedCallWindow = openCallWindow(callUrl, callWindow)
      closeCallOnWindowClose(callId, openedCallWindow, true)
    } catch (err) {
      callWindow?.close()
      setChatError(err?.response?.data?.message || err.message || 'Failed to start call.')
    } finally {
      setStartingCall(false)
    }
  }

  const handleJoinCall = async (message) => {
    const callId = message?.callId
    if (!callId || joiningCallId) return
    let callWindow = null
    setJoiningCallId(callId)
    setChatError(null)

    try {
      if (onJoinConversationCall) {
        await onJoinConversationCall(callId)
        hideCall(callId)
        return
      }

      callWindow = window.open('about:blank', '_blank')
      const call = await joinCall(callId)
      const openedCallWindow = openCallWindow(buildCallFrameUrl(call), callWindow)
      closeCallOnWindowClose(callId, openedCallWindow, false)
    } catch (err) {
      callWindow?.close()
      hideCall(callId)
      setChatError(err?.response?.data?.message || err.message || 'Failed to join call.')
    } finally {
      setJoiningCallId('')
    }
  }

  return (
    <section className="card flex h-full flex-col overflow-hidden bg-white shadow-xl shadow-brand-primary/5 border-brand-primaryLight" style={{ minHeight: '36rem' }}>
      {/* Header */}
      {!hideHeader && (
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
          <div className="flex items-center gap-2 shrink-0">
            {showConversationSelector && conversations.length > 0 && (
              <select
                value={selectedConversationId || ''}
                onChange={(e) => onSelectConversation?.(e.target.value)}
                className="form-select text-xs py-2 w-48 bg-slate-50 border-none focus:ring-1 focus:ring-brand-primary"
              >
                {conversations.map(c => (
                  <option key={getConversationId(c)} value={getConversationId(c)}>{getConversationLabel(c)}</option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={handleStartCall}
              disabled={!selectedConversationId || startingCall}
              title={startingCall ? 'Starting call' : 'Start video call'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-sm shadow-brand-primary/25 hover:bg-brand-primaryDark transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              {startingCall ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      {verifiedIncomingCall && (
        <div className="mx-6 mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-800 shrink-0 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Incoming call</p>
            <p className="text-sm font-semibold truncate">{verifiedIncomingCall.senderName || 'Someone'} is calling you.</p>
          </div>
          <button
            type="button"
            onClick={() => handleJoinCall(verifiedIncomingCall)}
            disabled={joiningCallId === verifiedIncomingCall.callId || checkingIncomingCall}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {joiningCallId === verifiedIncomingCall.callId ? 'Joining...' : 'Join'}
          </button>
        </div>
      )}

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
                     <button
                       type="button"
                       onClick={() => goToProfile(message.senderId)}
                       title="View profile"
                       className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
                     >
                        <Avatar name={message.senderName} isMine={isMine} />
                     </button>
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
                      {message.fileData && message.fileType?.startsWith('image/') && (
                        <a href={message.fileData} target="_blank" rel="noreferrer" className="mt-3 block">
                          <img src={message.fileData} alt={message.fileName || 'Attachment'} className="max-h-64 rounded-xl object-contain border border-white/20" />
                        </a>
                      )}
                      {message.fileData && !message.fileType?.startsWith('image/') && (
                        <a
                          href={message.fileData}
                          download={message.fileName || 'attachment'}
                          className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                            isMine ? 'bg-white text-brand-primary hover:bg-slate-100' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" /></svg>
                          <span className="truncate">{message.fileName || 'Download file'}</span>
                        </a>
                      )}
                      {message.audioData && (
                        <audio controls src={message.audioData} className="mt-3 w-64 max-w-full" />
                      )}
                      {message.callId && !hiddenCallIds.includes(String(message.callId)) ? (
                        <button
                          type="button"
                          onClick={() => handleJoinCall(message)}
                          disabled={joiningCallId === message.callId}
                          className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50 ${
                            isMine
                              ? 'bg-white text-brand-primary hover:bg-slate-100'
                              : 'bg-brand-primary text-white hover:bg-brand-primaryDark'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          {joiningCallId === message.callId ? 'Joining...' : 'Join Call'}
                        </button>
                      ) : message.callUrl && (
                        <a
                          href={message.callUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-3 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                            isMine
                              ? 'bg-white text-brand-primary hover:bg-slate-100'
                              : 'bg-brand-primary text-white hover:bg-brand-primaryDark'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.277A1 1 0 0121 8.677v6.646a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Join Call
                        </a>
                      )}
                      
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
      <form onSubmit={handleSend} className="sticky bottom-0 z-10 p-4 border-t border-slate-100 bg-white shrink-0">
        <div className="flex flex-col gap-2 p-1 rounded-2xl border border-slate-200 bg-slate-50 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary/50 transition-all">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
          {showEmojiPicker && (
            <div className="mx-2 mt-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
              <div className="grid grid-cols-9 gap-1">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => appendEmoji(emoji)}
                    className="h-8 w-8 rounded-lg text-lg hover:bg-brand-primaryLight transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
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
                <button
                  type="button"
                  onClick={handleAudioRecord}
                  disabled={!selectedConversationId || sending}
                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                    recording
                      ? 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                      : 'text-slate-400 hover:text-brand-primary hover:bg-brand-primaryLight/50'
                  }`}
                  title={recording ? 'Stop recording' : 'Record voice note'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a5 5 0 005-5V7a5 5 0 00-10 0v6.5a5 5 0 005 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19 11v2.5a7 7 0 01-14 0V11M12 20v2m-3 0h6" /></svg>
                </button>
                <button type="button" onClick={handleCode} disabled={!selectedConversationId} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-brand-primaryLight/50 transition-colors disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </button>
                {recording && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Recording
                  </span>
                )}
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
