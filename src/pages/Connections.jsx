import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getConnections, removeConnection, respondToConnection } from '../services/connections'
import { getCurrentUserId } from '../utils/projectAccess'
import ConnectionsUI from '../ui/pages/ConnectionsUI'
import MyReports from './MyReports'

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
  if (value === 'blocked') return 'bg-gray-200 text-[var(--text-primary)]'
  return 'bg-[var(--bg-hover)] text-[var(--text-primary)]'
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

  return (
    <ConnectionsUI
      user={user}
      connections={connections}
      receivedRequests={receivedRequests}
      sentRequests={sentRequests}
      loading={loading}
      error={error}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      requestTab={requestTab}
      setRequestTab={setRequestTab}
      responding={responding}
      removing={removing}
      handleRespond={handleRespond}
      handleRemove={handleRemove}
      getOtherUser={getOtherUser}
      getRequesterId={getRequesterId}
      getRecipientId={getRecipientId}
      normalizeKey={normalizeKey}
      getCurrentUserId={getCurrentUserId}
    >
      {activeTab === 'reports' && <MyReports />}
    </ConnectionsUI>
  )
}

