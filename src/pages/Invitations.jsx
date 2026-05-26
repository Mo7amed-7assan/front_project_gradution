import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getInvitations, respondToInvitation, withdrawInvitation } from '../services/invitations'
import { getCurrentUserId } from '../utils/projectAccess'
import InvitationsUI from '../ui/pages/InvitationsUI'

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

  return (
    <InvitationsUI
      received={received}
      sent={sent}
      loading={loading}
      error={error}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      processing={processing}
      handleRespond={handleRespond}
      handleWithdraw={handleWithdraw}
    />
  )
}
