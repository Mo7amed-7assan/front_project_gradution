import React, { useEffect, useState } from 'react'
import { initiateCall } from '../services/calls'
import { getConversations } from '../services/messaging'

export default function Messaging(){
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [callUrl, setCallUrl] = useState(null)
  const [error, setError] = useState(null)

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await getConversations()
      setConversations(res?.data?.data || [])
    } catch (err) {
      setError('Messaging is not fully available from the backend spec.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchConversations() }, [])

  const handleStartCall = async () => {
    setError(null)
    try {
      const res = await initiateCall({ call_type: 'direct', status: 'active' })
      const roomUrl = res?.data?.data?.room_url || res?.data?.data?.roomUrl
      setCallUrl(roomUrl)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to start call.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Messaging</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="mb-6">
        <button onClick={handleStartCall} className="bg-blue-600 text-white px-4 py-2 rounded">Start Video Call</button>
      </div>

      {callUrl && (
        <div className="mb-6 p-4 border rounded bg-green-50">
          <p className="font-medium">Call created successfully.</p>
          <p className="text-sm">Join URL:</p>
          <a href={callUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{callUrl}</a>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2">Conversations</h3>
        {loading ? (
          <p>Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <p>No conversations available.</p>
        ) : (
          <ul className="space-y-3">
            {conversations.map(conv => (
              <li key={conv.id} className="p-4 border rounded">
                <p className="font-medium">{conv.title || conv.conversation_type || 'Conversation'}</p>
                <p className="text-sm text-gray-600">Last message: {conv.latest_message?.content || 'No messages yet.'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}