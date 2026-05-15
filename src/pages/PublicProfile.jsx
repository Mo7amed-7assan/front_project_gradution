import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUserById, getUserPortfolio, endorseSkill } from '../services/profile'
import { sendConnectionRequest, getConnections } from '../services/connections'
import { INVITATION_TYPES, sendInvitation } from '../services/invitations'
import { getUserRatings, updateRating, deleteRating } from '../services/rating'
import Spinner from '../components/Spinner'
import { getProjectRelation } from '../utils/projectAccess'
import { getMyProjects } from '../services/project'

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
  const [editRatingVal, setEditRatingVal] = useState(5)
  const [editRatingComment, setEditRatingComment] = useState('')

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
        let items = []
        let avg = 0
        let count = 0
        if (Array.isArray(ratingRes)) {
           items = ratingRes
           avg = items.length ? items.reduce((a,b)=>a+b.rating, 0)/items.length : 0
           count = items.length
        } else if (ratingRes?.ratings) {
           items = ratingRes.ratings
           avg = ratingRes.average_rating || (items.length ? items.reduce((a,b)=>a+b.rating, 0)/items.length : 0)
           count = ratingRes.total_ratings || items.length
        } else if (ratingRes?.data) {
           items = Array.isArray(ratingRes.data) ? ratingRes.data : (ratingRes.data.ratings || [])
           avg = ratingRes.data.average_rating || (items.length ? items.reduce((a,b)=>a+b.rating, 0)/items.length : 0)
           count = ratingRes.data.total_ratings || items.length
        }
        setRatingsData({ average: avg, count, items })
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
      await updateRating(editingRating, { rating: Number(editRatingVal), comment: editRatingComment })
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
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">{profile.full_name || profile.username}</h1>
          <p className="text-gray-600">{profile.location || 'Location not provided'}</p>
        </div>
        <div className="flex items-center gap-4">
          {!isOwnProfile && (
            <div className="flex items-center gap-2">
              {connectionStatus && (
                <button
                  onClick={handleConnect}
                  disabled={connecting || !canSendConnectionRequest}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    connectionStatus === 'connected'
                      ? 'bg-green-100 text-green-800 cursor-default'
                      : connectionStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800 cursor-default'
                      : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                  }`}
                >
                  {connecting ? 'Connecting...' :
                   connectionStatus === 'connected' ? '✓ Connected' :
                   connectionStatus === 'pending' ? 'Request Sent' :
                   'Connect'}
                </button>
              )}
              <button
                onClick={handleOpenInvite}
                className="px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {!currentUser || currentUser?.role === 'guest' ? 'Register to Invite' : 'Invite to Project'}
              </button>
            </div>
          )}
          <div className="text-sm text-gray-500">
            <Link to="/discover" className="text-blue-600 hover:underline">Back to discover</Link>
          </div>
        </div>
      </div>
      {actionMessage && (
        <div className={`mb-4 text-sm ${actionMessageType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
          {actionMessage}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">About</h2>
          <p className="mt-2 text-gray-700">{profile.bio || 'No bio provided.'}</p>
          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <div><strong>Email:</strong> {profile.email || '—'}</div>
            <div><strong>Website:</strong> {profile.website_url ? <a className="text-blue-600" href={profile.website_url}>{profile.website_url}</a> : '—'}</div>
            <div><strong>GitHub:</strong> {profile.github_url ? <a className="text-blue-600" href={profile.github_url}>{profile.github_url}</a> : '—'}</div>
            <div><strong>LinkedIn:</strong> {profile.linkedin_url ? <a className="text-blue-600" href={profile.linkedin_url}>{profile.linkedin_url}</a> : '—'}</div>
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold">Skills</h2>
          {profile.skills?.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <div key={skill.id} className="bg-gray-100 rounded-full px-3 py-1 flex items-center gap-2">
                  <span>{skill.skill_name}</span>
                  <span className="text-xs text-gray-500">{skill.endorsements_count ?? 0} endorsements</span>
                  {!isOwnProfile && (
                    <button
                      onClick={() => handleEndorse(skill.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Endorse
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-gray-500">No skills listed.</p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-4">Portfolio</h2>
        {portfolio.length > 0 ? (
          <div className="space-y-4">
            {portfolio.map((item) => (
              <div key={item.id} className="border rounded p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.item_type || 'Item'}</p>
                  </div>
                  {item.external_url && (
                    <a href={item.external_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">View</a>
                  )}
                </div>
                <p className="mt-2 text-gray-700">{item.description || 'No description provided.'}</p>
                {item.skills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                    {item.skills.map((skill) => (
                      <span key={skill} className="bg-gray-100 px-2 py-1 rounded-full">{skill}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No public portfolio items available.</p>
        )}
      </div>

      {/* Ratings Section */}
      <div className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Reviews & Ratings</h2>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl font-bold text-gray-900">{Number(ratingsData.average).toFixed(1)}</span>
          <span className="text-yellow-400 text-2xl">★</span>
          <span className="text-gray-500 text-sm">({ratingsData.count} reviews)</span>
        </div>
        
        {ratingsData.items.length > 0 ? (
          <div className="space-y-4">
            {ratingsData.items.map(r => (
              <div key={r.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{r.rater?.full_name || r.rater?.name || 'User'}</span>
                      <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating || 0)}{'☆'.repeat(5-(r.rating || 0))}</span>
                    </div>
                    {r.project && <p className="text-xs text-gray-500 mt-0.5">Project: {r.project.title || r.project.name}</p>}
                  </div>
                  {currentUser && (r.rater?.id === currentUser.id || r.rater_id === currentUser.id) && (
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setEditingRating(r.id)
                        setEditRatingVal(r.rating)
                        setEditRatingComment(r.comment || '')
                      }} className="text-xs text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDeleteRating(r.id)} className="text-xs text-red-600 hover:underline">Delete</button>
                    </div>
                  )}
                </div>
                {r.comment && <p className="text-gray-700 text-sm mt-2">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet.</p>
        )}
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Invite to Project</h3>
            {myProjects.length === 0 ? (
              <p className="text-gray-600 mb-6">You don't have any active projects to invite to.</p>
            ) : (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
                  <select
                    value={selectedProject}
                    onChange={e => setSelectedProject(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {myProjects.map(p => {
                      const projectId = getProjectId(p)
                      return (
                        <option key={projectId || p.title || p.name} value={projectId || ''}>{p.title || p.name}</option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invitation Type</label>
                  <select
                    value={invitationType}
                    onChange={e => setInvitationType(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={INVITATION_TYPES.TEAM_INVITE}>Team Invite</option>
                    <option value={INVITATION_TYPES.COLLABORATION_REQUEST}>Collaboration Request</option>
                    <option value={INVITATION_TYPES.PROJECT_JOIN}>Project Join</option>
                    <option value={INVITATION_TYPES.MENTORSHIP}>Mentorship</option>
                  </select>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              {myProjects.length > 0 && (
                <button
                  onClick={handleSendInvite}
                  disabled={inviting || !selectedProject}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {editingRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">Edit Rating</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editRatingVal}
                  onChange={(e) => setEditRatingVal(e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={editRatingComment}
                  onChange={(e) => setEditRatingComment(e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingRating(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRating}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
