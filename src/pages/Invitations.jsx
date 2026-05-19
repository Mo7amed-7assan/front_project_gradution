import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getInvitations, respondToInvitation, withdrawInvitation } from '../services/invitations'
import { getCurrentUserId } from '../utils/projectAccess'

const normalizeId = (value) => {
  if (value === null || value === undefined) return ''
  return `${value}`.toLowerCase()
}

const extractInvitationList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data?.data?.received)) return value.data.data.received
  if (Array.isArray(value?.data?.data?.sent)) return value.data.data.sent
  if (Array.isArray(value?.data?.data?.incoming)) return value.data.data.incoming
  if (Array.isArray(value?.data?.data?.outgoing)) return value.data.data.outgoing
  if (Array.isArray(value?.data?.data?.data)) return value.data.data.data
  if (Array.isArray(value?.data?.data?.invitations)) return value.data.data.invitations
  if (Array.isArray(value?.data?.data?.items)) return value.data.data.items
  if (Array.isArray(value?.data?.data)) return value.data.data
  if (Array.isArray(value?.data?.received)) return value.data.received
  if (Array.isArray(value?.data?.sent)) return value.data.sent
  if (Array.isArray(value?.data?.incoming)) return value.data.incoming
  if (Array.isArray(value?.data?.outgoing)) return value.data.outgoing
  if (Array.isArray(value?.data?.invitations)) return value.data.invitations
  if (Array.isArray(value?.data?.items)) return value.data.items
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.received)) return value.received
  if (Array.isArray(value?.sent)) return value.sent
  if (Array.isArray(value?.incoming)) return value.incoming
  if (Array.isArray(value?.outgoing)) return value.outgoing
  if (Array.isArray(value?.invitations)) return value.invitations
  if (Array.isArray(value?.items)) return value.items
  return []
}

const extractInvitationGroup = (value, group) => {
  const keys =
    group === 'sent'
      ? ['sent', 'outgoing', 'sent_invitations', 'outgoing_invitations']
      : ['received', 'incoming', 'received_invitations', 'incoming_invitations']

  const roots = [value, value?.data, value?.data?.data, value?.data?.data?.data, value?.invitations, value?.data?.invitations]
  for (const root of roots) {
    if (!root || Array.isArray(root)) continue
    for (const key of keys) {
      if (Array.isArray(root[key])) return root[key]
    }
  }
  return []
}

const getSenderId = (invitation) =>
  normalizeId(
    invitation?.sender?.id ||
      invitation?.sender?.uuid ||
      invitation?.inviter?.id ||
      invitation?.inviter?.uuid ||
      invitation?.sender_id ||
      invitation?.sender_uuid ||
      invitation?.inviter_id ||
      invitation?.inviter_uuid ||
      invitation?.created_by ||
      invitation?.user_id
  )

const getRecipientId = (invitation) =>
  normalizeId(
    invitation?.recipient?.id ||
      invitation?.recipient?.uuid ||
      invitation?.invitee?.id ||
      invitation?.invitee?.uuid ||
      invitation?.recipient_id ||
      invitation?.recipient_uuid ||
      invitation?.invitee_id ||
      invitation?.invitee_uuid
  )

const getDirection = (invitation) =>
  `${invitation?.direction || invitation?.box || invitation?.folder || invitation?.type || ''}`.toLowerCase()

const isSentDirection = (invitation) => ['sent', 'outgoing', 'sender'].includes(getDirection(invitation))

const isReceivedDirection = (invitation) => ['received', 'incoming', 'recipient', 'inbox'].includes(getDirection(invitation))

const mergeInvitations = (...groups) => {
  const map = new Map()
  groups.flat().forEach((invitation, index) => {
    if (!invitation) return
    const key =
      invitation.id ||
      `${getSenderId(invitation)}:${getRecipientId(invitation)}:${invitation.project_id || invitation.project?.id || index}`
    map.set(key, invitation)
  })
  return Array.from(map.values())
}

const isPending = (status) => !status || `${status}`.toLowerCase() === 'pending'

const statusClass = (status) => {
  const value = `${status || 'pending'}`.toLowerCase()
  if (value === 'accepted') return 'bg-green-100 text-green-800'
  if (value === 'pending') return 'bg-yellow-100 text-yellow-800'
  if (value === 'declined' || value === 'rejected') return 'bg-red-100 text-red-800'
  if (value === 'withdrawn' || value === 'expired') return 'bg-gray-100 text-gray-700'
  return 'bg-gray-100 text-gray-700'
}

const formatLabel = (value, fallback = 'Member') => `${value || fallback}`.replaceAll('_', ' ')

const getPersonName = (person, fallback) => {
  if (!person || typeof person !== 'object') return fallback
  return person.full_name || person.name || person.username || fallback
}

const getProjectId = (invitation) =>
  invitation?.project?.id || invitation?.project?.uuid || invitation?.project_id || invitation?.project_uuid

const getProjectTitle = (invitation) =>
  invitation?.project?.title || invitation?.project?.name || `Project ${getProjectId(invitation) || ''}`.trim()

export default function Invitations() {
  const { user } = useAuth()
  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('received')
  const [processing, setProcessing] = useState(null)

  const loadInvitations = async () => {
    setLoading(true)
    setError(null)
    try {
      const [allResult, receivedResult, sentResult, incomingResult, outgoingResult] = await Promise.allSettled([
        getInvitations({ sort_by: 'created_at', sort_dir: 'desc' }),
        getInvitations({ direction: 'received', sort_by: 'created_at', sort_dir: 'desc' }),
        getInvitations({ direction: 'sent', sort_by: 'created_at', sort_dir: 'desc' }),
        getInvitations({ direction: 'incoming', sort_by: 'created_at', sort_dir: 'desc' }),
        getInvitations({ direction: 'outgoing', sort_by: 'created_at', sort_dir: 'desc' }),
      ])

      const allList = allResult.status === 'fulfilled' ? extractInvitationList(allResult.value) : []
      const groupedReceived = allResult.status === 'fulfilled' ? extractInvitationGroup(allResult.value, 'received') : []
      const groupedSent = allResult.status === 'fulfilled' ? extractInvitationGroup(allResult.value, 'sent') : []
      const receivedList = receivedResult.status === 'fulfilled' ? extractInvitationList(receivedResult.value) : []
      const sentList = sentResult.status === 'fulfilled' ? extractInvitationList(sentResult.value) : []
      const incomingList = incomingResult.status === 'fulfilled' ? extractInvitationList(incomingResult.value) : []
      const outgoingList = outgoingResult.status === 'fulfilled' ? extractInvitationList(outgoingResult.value) : []
      const all = mergeInvitations(allList, receivedList, sentList)
      const myId = normalizeId(getCurrentUserId(user))
      const receivedFromEndpoints = mergeInvitations(groupedReceived, receivedList, incomingList)
      const sentFromEndpoints = mergeInvitations(groupedSent, sentList, outgoingList)

      if (!myId) {
        setSent(sentFromEndpoints)
        setReceived(receivedFromEndpoints)
        return
      }

      const sentById = all.filter((invitation) => getSenderId(invitation) === myId || isSentDirection(invitation))
      const receivedById = all.filter((invitation) => {
        const recipientId = getRecipientId(invitation)
        const senderId = getSenderId(invitation)
        if (isReceivedDirection(invitation)) return true
        if (recipientId) return recipientId === myId
        return senderId !== myId
      })

      setSent(mergeInvitations(sentById, sentFromEndpoints))
      setReceived(mergeInvitations(receivedById, receivedFromEndpoints))
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load invitations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvitations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleRespond = async (id, responseType) => {
    setProcessing(id)
    try {
      await respondToInvitation(id, responseType)
      await loadInvitations()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to respond to invitation')
    } finally {
      setProcessing(null)
    }
  }

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this invitation?')) return
    setProcessing(id)
    try {
      await withdrawInvitation(id)
      await loadInvitations()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to withdraw invitation')
    } finally {
      setProcessing(null)
    }
  }

  const InvitationCard = ({ invitation, mode }) => {
    const projectId = getProjectId(invitation)
    const person = mode === 'sent' ? invitation.recipient || invitation.invitee : invitation.sender || invitation.inviter
    const personFallback = mode === 'sent' ? 'someone' : 'Someone'
    const status = invitation.status || 'pending'

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium text-gray-900">
              {mode === 'sent'
                ? `You invited ${getPersonName(person, personFallback)}`
                : `${getPersonName(person, personFallback)} invited you`}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Project:{' '}
              {projectId ? (
                <Link to={`/projects/${projectId}`} className="text-indigo-600 hover:underline">
                  {getProjectTitle(invitation)}
                </Link>
              ) : (
                <span>{getProjectTitle(invitation)}</span>
              )}
            </p>
            {invitation.message && <p className="text-sm text-gray-500 mt-1">{invitation.message}</p>}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${statusClass(status)}`}>
                {formatLabel(status, 'pending')}
              </span>
              <span className="text-xs text-gray-500 capitalize">
                {formatLabel(invitation.invitation_type || invitation.role)}
              </span>
            </div>
          </div>

          {mode === 'received' && isPending(invitation.status) && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => handleRespond(invitation.id, 'accepted')}
                disabled={processing === invitation.id}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {processing === invitation.id ? '...' : 'Accept'}
              </button>
              <button
                onClick={() => handleRespond(invitation.id, 'declined')}
                disabled={processing === invitation.id}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                {processing === invitation.id ? '...' : 'Reject'}
              </button>
            </div>
          )}

          {mode === 'sent' && isPending(invitation.status) && (
            <button
              onClick={() => handleWithdraw(invitation.id)}
              disabled={processing === invitation.id}
              className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50 shrink-0"
            >
              {processing === invitation.id ? '...' : 'Withdraw'}
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
        <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
        <p className="text-gray-600 mt-1">Manage your project invitations</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'received'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received ({received.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'sent' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent ({sent.length})
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

      {activeTab === 'received' && (
        <div>
          {received.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No received invitations</h3>
              <p className="text-gray-500">Invitations you receive will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {received.map((invitation) => (
                <InvitationCard key={invitation.id} invitation={invitation} mode="received" />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div>
          {sent.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sent invitations</h3>
              <p className="text-gray-500">Invitations you send will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sent.map((invitation) => (
                <InvitationCard key={invitation.id} invitation={invitation} mode="sent" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
