import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getConnections, removeConnection, respondToConnection } from '../services/connections'
import { getCurrentUserId } from '../utils/projectAccess'

const CONNECTION_REFRESH_EVENT = 'connections:refresh'

const normalizeId = (value) => {
  if (value === null || value === undefined) return ''
  return `${value}`
}

const normalizeKey = (value) => normalizeId(value).toLowerCase()

const extractConnectionList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data?.data)) return value.data.data
  if (Array.isArray(value?.data?.connections)) return value.data.connections
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.connections)) return value.connections
  if (Array.isArray(value?.items)) return value.items
  return []
}

const getRequesterId = (connection) =>
  normalizeKey(
    connection?.requester?.id ||
    connection?.requester?.uuid ||
    connection?.requester_id ||
    connection?.requester_uuid ||
    connection?.requester
  )

const getRecipientId = (connection) =>
  normalizeKey(
    connection?.recipient?.id ||
    connection?.recipient?.uuid ||
    connection?.recipient_id ||
    connection?.recipient_uuid ||
    connection?.recipient
  )

const mergeConnections = (...groups) => {
  const map = new Map()
  groups.flat().forEach((connection, index) => {
    if (!connection) return
    const key = connection.id || `${getRequesterId(connection)}:${getRecipientId(connection)}:${connection.status || ''}:${index}`
    map.set(key, connection)
  })
  return Array.from(map.values())
}

const statusClass = (status) => {
  const value = `${status || ''}`.toLowerCase()
  if (value === 'accepted') return 'bg-green-100 text-green-800'
  if (value === 'pending') return 'bg-yellow-100 text-yellow-800'
  if (value === 'rejected') return 'bg-red-100 text-red-800'
  if (value === 'blocked') return 'bg-gray-200 text-gray-800'
  return 'bg-gray-100 text-gray-700'
}

export default function Connections() {
  const { user } = useAuth()
  const [connections, setConnections] = useState([])
  const [receivedRequests, setReceivedRequests] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('connections')
  const [requestTab, setRequestTab] = useState('received')
  const [responding, setResponding] = useState(null)
  const [removing, setRemoving] = useState(null)

  const notifyConnectionRefresh = () => {
    window.dispatchEvent(new CustomEvent(CONNECTION_REFRESH_EVENT))
  }

  const loadConnections = async () => {
    setLoading(true)
    setError(null)
    try {
      const [allResult, pendingResult, sentResult, receivedResult] = await Promise.allSettled([
        getConnections({ sort_by: 'all' }),
        getConnections({ status: 'pending', sort_by: 'all' }),
        getConnections({ status: 'pending', sort_by: 'sent' }),
        getConnections({ status: 'pending', sort_by: 'received' }),
      ])
      const allConnections = allResult.status === 'fulfilled' ? allResult.value : []
      const pendingConnections = pendingResult.status === 'fulfilled' ? pendingResult.value : []
      const sentConnections = sentResult.status === 'fulfilled' ? sentResult.value : []
      const receivedConnections = receivedResult.status === 'fulfilled' ? receivedResult.value : []
      const allList = extractConnectionList(allConnections)
      const pendingList = extractConnectionList(pendingConnections)
      const sentList = extractConnectionList(sentConnections)
      const receivedList = extractConnectionList(receivedConnections)
      const list = mergeConnections(allList, pendingList, sentList, receivedList)
      const myId = normalizeKey(getCurrentUserId(user))
      console.log('GET /connections allConnections:', allConnections)
      console.log('GET /connections pending:', { pendingConnections, sentConnections, receivedConnections })
      console.log('DEBUG: My ID:', myId, 'First Conn:', list[0])

      setConnections(list.filter((conn) => `${conn.status || ''}`.toLowerCase() === 'accepted'))
      const receivedById = list.filter((conn) => {
        const isPending = `${conn.status || ''}`.toLowerCase() === 'pending'
        const recipientId = getRecipientId(conn)
        return isPending && recipientId === myId
      })
      const sentById = list.filter((conn) => {
        const isPending = `${conn.status || ''}`.toLowerCase() === 'pending'
        const requesterId = getRequesterId(conn)
        return isPending && requesterId === myId
      })
      const receivedByEndpoint = receivedList.filter((conn) => `${conn.status || ''}`.toLowerCase() === 'pending')
      const sentByEndpoint = sentList.filter((conn) => `${conn.status || ''}`.toLowerCase() === 'pending')
      const received = mergeConnections(receivedById, receivedByEndpoint)
      const sent = mergeConnections(sentById, sentByEndpoint)

      console.log('DEBUG: Split connections:', { total: list.length, received: received.length, sent: sent.length })
      setReceivedRequests(received)
      setSentRequests(sent)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnections()
    const onRefresh = () => loadConnections()
    window.addEventListener(CONNECTION_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(CONNECTION_REFRESH_EVENT, onRefresh)
  }, [user])

  useEffect(() => {
    console.log({
      total: connections.length,
      received: receivedRequests.length,
      sent: sentRequests.length
    })
  }, [connections, receivedRequests, sentRequests])

  const clearConnectionFromState = (connectionId) => {
    setConnections((prev) => prev.filter((item) => item.id !== connectionId))
    setReceivedRequests((prev) => prev.filter((item) => item.id !== connectionId))
    setSentRequests((prev) => prev.filter((item) => item.id !== connectionId))
  }

  const handleRespond = async (connectionId, status) => {
    setResponding(connectionId)
    setLoading(true)
    try {
      await respondToConnection(connectionId, status)
      clearConnectionFromState(connectionId)
      notifyConnectionRefresh()
      await loadConnections()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to respond to connection request')
    } finally {
      setResponding(null)
      setLoading(false)
    }
  }

  const handleRemove = async (connectionId, label = 'Remove this connection?') => {
    if (!confirm(label)) return
    setRemoving(connectionId)
    setLoading(true)
    try {
      await removeConnection(connectionId)
      clearConnectionFromState(connectionId)
      notifyConnectionRefresh()
      await loadConnections()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove connection')
    } finally {
      setRemoving(null)
      setLoading(false)
    }
  }

  const getOtherUser = (connection) => {
    if (!user) return null
    return getRequesterId(connection) === normalizeKey(getCurrentUserId(user))
      ? connection.recipient
      : connection.requester
  }

  const PersonSummary = ({ connection, person, fallbackId }) => {
    const otherUser = person || getOtherUser(connection)
    const isUserObject = otherUser && typeof otherUser === 'object'
    const displayId = fallbackId || (!isUserObject ? otherUser : null)
    const profileUrl = isUserObject ? otherUser.profile_picture_url : null
    const displayName = isUserObject
      ? otherUser.full_name || otherUser.username || `User #${displayId || 'Unknown'}`
      : `User #${displayId || 'Unknown'}`
    const username = isUserObject ? otherUser.username : null
    const linkId = isUserObject ? otherUser.id : displayId

    return (
      <div className="flex items-center space-x-3 min-w-0">
        <img
          src={profileUrl || '/default-avatar.png'}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="min-w-0">
          <Link
            to={`/users/${linkId}`}
            className="font-medium text-gray-900 hover:text-blue-600"
          >
            {displayName}
          </Link>
          <p className="text-sm text-gray-500">{username ? `@${username}` : displayId || 'unknown'}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusClass(connection.status)}`}>
              {connection.status || 'pending'}
            </span>
            {connection.connection_type && (
              <span className="text-xs text-gray-400 capitalize">
                {connection.connection_type.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  const RequestCard = ({ request, mode }) => {
    const status = `${request.status || 'pending'}`.toLowerCase()
    const person = mode === 'sent' ? request.recipient : request.requester
    const fallbackId = mode === 'sent'
      ? request.recipient_id || request.recipient_uuid || request.recipient
      : request.requester_id || request.requester_uuid || request.requester

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <PersonSummary connection={request} person={person} fallbackId={fallbackId} />
          {mode === 'received' ? (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleRespond(request.id, 'accepted')}
                disabled={responding === request.id}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {responding === request.id ? '...' : 'Accept'}
              </button>
              <button
                onClick={() => handleRespond(request.id, 'rejected')}
                disabled={responding === request.id}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {responding === request.id ? '...' : 'Reject'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleRemove(
                request.id,
                'Withdraw this request?'
              )}
              disabled={removing === request.id}
              className="text-sm text-red-600 hover:text-red-800 shrink-0 disabled:opacity-50"
            >
              {removing === request.id ? 'Removing...' : 'Withdraw Request'}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Network</h1>
        <p className="text-gray-600 mt-1">Manage your professional connections</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('connections')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'connections'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          My Connections ({connections.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'requests'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Requests ({receivedRequests.length + sentRequests.length})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'connections' && (
        <div>
          {connections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">Network</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
              <p className="text-gray-500 mb-4">Start building your professional network</p>
              <Link
                to="/discover"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Discover People
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((connection) => (
                <div key={connection.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-4">
                    <PersonSummary connection={connection} />
                    <div className="flex items-center space-x-2 shrink-0">
                      <Link
                        to={`/messages?user=${getOtherUser(connection)?.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Message
                      </Link>
                      <button
                        onClick={() => handleRemove(connection.id)}
                        disabled={removing === connection.id}
                        className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {removing === connection.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRequestTab('received')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                requestTab === 'received'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Received ({receivedRequests.length})
            </button>
            <button
              onClick={() => setRequestTab('sent')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                requestTab === 'sent'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sent Requests ({sentRequests.length})
            </button>
          </div>

          {requestTab === 'received' && (
            receivedRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">Inbox</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No received requests</h3>
                <p className="text-gray-500">Connection requests you receive will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {receivedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} mode="received" />
                ))}
              </div>
            )
          )}

          {requestTab === 'sent' && (
            sentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">Sent</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't sent any requests yet</h3>
                <p className="text-gray-500">Requests you send will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sentRequests.map((request) => (
                  <RequestCard key={request.id} request={request} mode="sent" />
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

