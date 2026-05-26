import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserById, getUserPortfolio, endorseSkill } from '../services/profile'
import { sendConnectionRequest, getConnections } from '../services/connections'
import { INVITATION_TYPES, sendInvitation } from '../services/invitations'
import { RATING_FIELDS, extractRatings, getRatingFeedback, getRatingScore, getUserRatings, updateRating, deleteRating } from '../services/rating'
import Spinner from '../components/Spinner'
import { getProjectRelation } from '../utils/projectAccess'
import { getMyProjects } from '../services/project'
import PublicProfileUI from '../ui/pages/PublicProfileUI'

const CONNECTION_REFRESH_EVENT = 'connections:refresh'
const CONNECTABLE_STATUSES = new Set(['not_connected', 'rejected', 'deleted'])

const normalizeId = (value) => {
  if (value === null || value === undefined) return null
  return `${value}`
}

const getConnectionUserId = (user) => normalizeId(user?.id || user?.uuid)

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const isValidUuid = (value) => UUID_PATTERN.test(normalizeId(value) || '')

const getProjectId = (project) => normalizeId(project?.id || project?.uuid)

const getInviteErrorMessage = (err) => {
  const response = err?.response
  const data = response?.data
  const serverMessage = data?.message || data?.error || err?.message
  const validationText = JSON.stringify(data || {}).toLowerCase()

  if (response?.status === 422 && validationText.includes('invitation_type')) {
    return 'The server rejected this invitation type. Please choose a valid project invite type and try again.'
  }

  if (response?.status === 422) {
    return serverMessage || 'The invitation details are invalid. Please check the selected project and recipient.'
  }

  return serverMessage || 'Failed to send invitation'
}

const getConnectionStatusForUi = (connection) => {
  const status = `${connection?.status || ''}`.toLowerCase()
  if (status === 'accepted') return 'connected'
  if (status === 'pending') return 'pending'
  if (status === 'rejected' || status === 'deleted') return 'not_connected'
  return connection ? status : 'not_connected'
}

const DEFAULT_RATING_FORM = {
  overall_rating: 5,
  communication_rating: 5,
  reliability_rating: 5,
  skill_rating: 5,
  problem_solving_rating: 5,
  teamwork_rating: 5,
}

const getRatingAverages = (ratingRes, items) => {
  const source = ratingRes?.average_scores || ratingRes?.data?.average_scores || ratingRes?.data?.data?.average_scores
  if (source?.overall !== undefined) return source
  const average = items.length ? items.reduce((sum, rating) => sum + getRatingScore(rating), 0) / items.length : 0
  return { overall: average }
}

export default function PublicProfile() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [actionMessageType, setActionMessageType] = useState('success')
  const [connectionStatus, setConnectionStatus] = useState(null) // null, 'connected', 'pending', 'not_connected'
  const [connecting, setConnecting] = useState(false)

  // Invitation state
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [myProjects, setMyProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [invitationType, setInvitationType] = useState(INVITATION_TYPES.TEAM_INVITE)
  const [inviting, setInviting] = useState(false)

  // Ratings state
  const [ratingsData, setRatingsData] = useState({ average: 0, count: 0, items: [] })
  const [editingRating, setEditingRating] = useState(null)
  const [editRatingForm, setEditRatingForm] = useState(DEFAULT_RATING_FORM)
  const [editRatingComment, setEditRatingComment] = useState('')
  const [editRatingVisibility, setEditRatingVisibility] = useState('public')

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getUserById(id)
      setProfile(res?.data || res || null)
      const portfolioRes = await getUserPortfolio(id)
      const portfolioData = Array.isArray(portfolioRes?.data) ? portfolioRes.data : portfolioRes?.data?.data || []
      setPortfolio(portfolioData)

      // Check connection status
      if (currentUser && normalizeId(currentUser.id) !== normalizeId(id)) {
        try {
          const connections = await getConnections()
          const connection = connections.find(conn =>
            (getConnectionUserId(conn.requester) === normalizeId(currentUser.id) && getConnectionUserId(conn.recipient) === normalizeId(id)) ||
            (getConnectionUserId(conn.requester) === normalizeId(id) && getConnectionUserId(conn.recipient) === normalizeId(currentUser.id))
          )
          setConnectionStatus(getConnectionStatusForUi(connection))
        } catch (err) {
          setConnectionStatus('not_connected')
        }
      }

      // Fetch ratings
      try {
        const ratingRes = await getUserRatings(id)
        const items = extractRatings(ratingRes)
        const averages = getRatingAverages(ratingRes, items)
        const avg = Number(averages.overall || ratingRes?.average_rating || ratingRes?.data?.average_rating || 0)
        const count = ratingRes?.total_ratings || ratingRes?.data?.total_ratings || ratingRes?.meta?.total || ratingRes?.data?.meta?.total || items.length
        setRatingsData({ average: avg, count, items, averages })
      } catch(e) {
        console.error('Failed to load ratings', e)
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    const onConnectionRefresh = () => fetchProfile()
    window.addEventListener(CONNECTION_REFRESH_EVENT, onConnectionRefresh)
    return () => window.removeEventListener(CONNECTION_REFRESH_EVENT, onConnectionRefresh)
  }, [id])

  const notifyConnectionRefresh = () => {
    window.dispatchEvent(new CustomEvent(CONNECTION_REFRESH_EVENT))
  }

  const handleEndorse = async (skillId) => {
    setActionMessage(null)
    try {
      await endorseSkill(skillId)
      setActionMessageType('success')
      setActionMessage('Skill endorsed successfully.')
      fetchProfile()
    } catch (err) {
      setActionMessageType('error')
      setActionMessage(err?.response?.data?.message || err.message || 'Endorsement failed')
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    setActionMessage(null)
    try {
      await sendConnectionRequest(id)
      setConnectionStatus('pending')
      setActionMessageType('success')
      setActionMessage('Connection request sent!')
      notifyConnectionRefresh()
    } catch (err) {
      const existingStatus = getConnectionStatusForUi(err?.existingConnection)
      setConnectionStatus(existingStatus)
      setActionMessageType('error')
      setActionMessage(err?.message || err?.response?.data?.message || 'Failed to send connection request')
      notifyConnectionRefresh()
    } finally {
      setConnecting(false)
    }
  }

  const loadMyProjects = async () => {
    try {
      const d = await getMyProjects({ per_page: 100 })
      let all = d?.data?.data?.data || d?.data?.data || d?.data?.items || d?.data?.projects || d?.data || d?.items || []
      if (!Array.isArray(all)) all = []
      const mine = all.filter(p => getProjectRelation(p, currentUser).isOwner)
      setMyProjects(mine)
      if (mine.length > 0) setSelectedProject(getProjectId(mine[0]) || '')
    } catch (err) {
      console.error('Failed to load projects', err)
    }
  }

  const handleOpenInvite = () => {
    if (!currentUser || currentUser?.role === 'guest') {
      setActionMessageType('error')
      setActionMessage('Register to Invite')
      return
    }
    setShowInviteModal(true)
    loadMyProjects()
  }

  const handleSendInvite = async () => {
    if (!selectedProject) return
    if (!isValidUuid(id) || !isValidUuid(selectedProject)) {
      setActionMessageType('error')
      setActionMessage('Cannot send invitation because the recipient or project id is invalid.')
      return
    }

    setInviting(true)
    setActionMessage(null)
    try {
      await sendInvitation(normalizeId(id), invitationType, normalizeId(selectedProject))
      setActionMessageType('success')
      setActionMessage('Invitation sent successfully!')
      setShowInviteModal(false)
    } catch (err) {
      setActionMessageType('error')
      setActionMessage(getInviteErrorMessage(err))
    } finally {
      setInviting(false)
    }
  }

  const handleUpdateRating = async () => {
    if (!editingRating) return
    try {
      await updateRating(editingRating, {
        ...editRatingForm,
        written_feedback: editRatingComment,
        review_text: editRatingComment,
        visibility: editRatingVisibility
      })
      setActionMessageType('success')
      setActionMessage('Rating updated successfully')
      setEditingRating(null)
      fetchProfile()
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to update rating')
    }
  }

  const handleDeleteRating = async (ratingId) => {
    if (!confirm('Delete this rating?')) return
    try {
      await deleteRating(ratingId)
      setActionMessageType('success')
      setActionMessage('Rating deleted')
      fetchProfile()
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to delete rating')
    }
  }

  if (loading) return <div className="p-8"><Spinner /></div>
  if (error) return <div className="p-8 text-red-600">{error}</div>
  if (!profile) return <div className="p-8">Profile not found.</div>

  const isOwnProfile = normalizeId(currentUser?.id) === normalizeId(profile.id)
  const canSendConnectionRequest = CONNECTABLE_STATUSES.has(connectionStatus)

  return (
    <PublicProfileUI
      profile={profile}
      portfolio={portfolio}
      loading={loading}
      error={error}
      actionMessage={actionMessage}
      actionMessageType={actionMessageType}
      connectionStatus={connectionStatus}
      connecting={connecting}
      isOwnProfile={isOwnProfile}
      canSendConnectionRequest={canSendConnectionRequest}
      showInviteModal={showInviteModal}
      setShowInviteModal={setShowInviteModal}
      myProjects={myProjects}
      selectedProject={selectedProject}
      setSelectedProject={setSelectedProject}
      invitationType={invitationType}
      setInvitationType={setInvitationType}
      inviting={inviting}
      ratingsData={ratingsData}
      editingRating={editingRating}
      setEditingRating={setEditingRating}
      editRatingForm={editRatingForm}
      setEditRatingForm={setEditRatingForm}
      editRatingComment={editRatingComment}
      setEditRatingComment={setEditRatingComment}
      editRatingVisibility={editRatingVisibility}
      setEditRatingVisibility={setEditRatingVisibility}
      handleConnect={handleConnect}
      handleOpenInvite={handleOpenInvite}
      handleSendInvite={handleSendInvite}
      handleEndorse={handleEndorse}
      handleUpdateRating={handleUpdateRating}
      handleDeleteRating={handleDeleteRating}
      INVITATION_TYPES={INVITATION_TYPES}
      RATING_FIELDS={RATING_FIELDS}
      getProjectId={getProjectId}
      getRatingScore={getRatingScore}
      getRatingFeedback={getRatingFeedback}
      currentUser={currentUser}
    />
  )
}
