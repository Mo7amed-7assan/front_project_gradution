import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import RealtimeChatPanel from '../components/RealtimeChatPanel'
import { getConversations } from '../services/messaging'

const extractConversations = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data?.data?.data)) return value.data.data.data
  if (Array.isArray(value?.data?.data)) return value.data.data
  if (Array.isArray(value?.data?.conversations)) return value.data.conversations
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.conversations)) return value.conversations
  if (Array.isArray(value?.items)) return value.items
  return []
}

export default function Conversation(){
  const { id } = useParams()
  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(id)
  const [error, setError] = useState(null)

  useEffect(() => {
    setSelectedConversationId(id)
  }, [id])

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await getConversations()
        setConversations(extractConversations(res))
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Failed to load conversations.')
      }
    }

    loadConversations()
  }, [])

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Conversation</h2>
      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">{error}</div>}
      <RealtimeChatPanel
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={setSelectedConversationId}
      />
    </div>
  )
}
