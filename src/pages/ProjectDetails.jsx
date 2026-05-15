import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { submitApplication, getProjectApplications, getApplicationDetails, reviewApplication, getMyApplications } from '../services/applications'
import { useAuth } from '../context/AuthContext'
import { deleteProject } from '../services/projects'
import { getMySkills } from '../services/profile'
import Spinner from '../components/Spinner'
import {
  getProjectDetails,
  getProjectTeam,
  getProjectMilestones,
  updateProjectTeamMember,
  removeProjectTeamMember,
  leaveProjectTeam,
  createProjectMilestone,
  updateProjectMilestone,
  deleteProjectMilestone,
  getProjectRoles
} from '../services/project'
import { getCurrentUserId, getProjectOwnerId, getProjectRelation, normalizeId } from '../utils/projectAccess'

const tabs = ['Overview', 'Roadmap', 'Team', 'Applications']
const APPLICATION_REFRESH_EVENT = 'applications:refresh'

const isTruthyBoolean = (value) =>
  value === true || value === 1 || value === '1' || value === 'true'

function extractApplications(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data?.data?.data)) return data.data.data.data
  if (Array.isArray(data?.data?.data)) return data.data.data
  if (Array.isArray(data?.data?.items)) return data.data.items
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.applications)) return data.applications
  if (Array.isArray(data?.team)) return data.team
  return []
}

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [team, setTeam] = useState([])
  const [milestones, setMilestones] = useState([])
  const [applications, setApplications] = useState([])
  const [myApplications, setMyApplications] = useState([])
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [loadingApps, setLoadingApps] = useState(false)
  const [applying, setApplying] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [projectRoleId, setProjectRoleId] = useState(null)
  const [proposedRole, setProposedRole] = useState('')
  const [projectRoles, setProjectRoles] = useState([])
  const [loadingRoles, setLoadingRoles] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('I would like to apply.')
  const [availability, setAvailability] = useState('full_time')
  const [userSkills, setUserSkills] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillProficiency, setNewSkillProficiency] = useState(3)
  const [milestoneModalOpen, setMilestoneModalOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState(null)
  const [milestoneForm, setMilestoneForm] = useState({ title: '', description: '', due_date: '' })
  const [teamEditModalOpen, setTeamEditModalOpen] = useState(false)
  const [teamEditMember, setTeamEditMember] = useState(null)
  const [teamEditRole, setTeamEditRole] = useState('')
  const [teamEditPermission, setTeamEditPermission] = useState('')
  const [applicationDetailModalOpen, setApplicationDetailModalOpen] = useState(false)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [reviewing, setReviewing] = useState(false)

  // Rating state
  const [rateModalOpen, setRateModalOpen] = useState(false)
  const [rateMember, setRateMember] = useState(null)
  const [ratingVal, setRatingVal] = useState(5)
  const [ratingComment, setRatingComment] = useState('')
  const [submittingRating, setSubmittingRating] = useState(false)

  const fetchProject = async () => {
    setLoading(true)
    try {
      const data = await getProjectDetails(id)
      setProject(data)
      setTeam(extractApplications(data.team))
      setProjectRoles(extractApplications(data.roles || data.project_roles))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeam = async () => {
    try {
      const data = await getProjectTeam(id)
      const list = extractApplications(data)
      setTeam(list)
      setProject((prev) => prev ? { ...prev, team: list } : prev)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMilestones = async () => {
    try {
      const data = await getProjectMilestones(id)
      setMilestones(data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchApplications = async () => {
    if (!isOwner()) return
    setLoadingApps(true)
    try {
      const data = await getProjectApplications(id)
      setApplications(extractApplications(data))
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingApps(false)
    }
  }

  const fetchMyApplications = async () => {
    if (!user) {
      setMyApplications([])
      return
    }
    try {
      const data = await getMyApplications({ per_page: 100 })
      setMyApplications(extractApplications(data))
    } catch (err) {
      console.error(err)
      setMyApplications([])
    }
  }

  const fetchProjectRoles = async () => {
    setLoadingRoles(true)
    try {
      const data = await getProjectRoles(id)
      const list = extractApplications(data)
      setProjectRoles(list)
      setProject((prev) => prev ? { ...prev, roles: list } : prev)
    } catch (err) {
      console.error('Failed to fetch project roles:', err)
      setProjectRoles([])
    } finally {
      setLoadingRoles(false)
    }
  }

  const fetchUserSkills = async () => {
    try {
      const data = await getMySkills()
      let list = []
      if (Array.isArray(data)) list = data
      else if (Array.isArray(data?.data)) list = data.data
      else if (Array.isArray(data?.skills)) list = data.skills
      setUserSkills(list)
    } catch (err) {
      console.error('Failed to fetch user skills:', err)
      setUserSkills([])
    }
  }

  useEffect(() => {
    fetchProject()
    fetchTeam()
    fetchMilestones()
    fetchMyApplications()
  }, [id, user?.id])

  useEffect(() => {
    if (project && isOwner()) fetchApplications()
  }, [project?.id, user?.id])

  useEffect(() => {
    if (!project || !user) return
    console.log('Current User:', getCurrentUserId(user))
    console.log('Project Owner:', getProjectOwnerId(project))
  }, [project, user])

  useEffect(() => {
    const onRefresh = (event) => {
      const projectId = event.detail?.projectId
      if (projectId && `${projectId}` !== `${id}`) return
      fetchMyApplications()
      fetchTeam()
      if (isOwner()) fetchApplications()
    }
    window.addEventListener(APPLICATION_REFRESH_EVENT, onRefresh)
    return () => window.removeEventListener(APPLICATION_REFRESH_EVENT, onRefresh)
  }, [id, user?.id, project?.id])

  const resolveUserId = (item) => item.user?.id
  const resolveApplicantId = (app) => app.applicant_id || app.user_id || app.applicant?.id || app.user?.id
  const resolveProjectId = (app) => app.project_id || app.project?.id
  const resolveUserName = (item) => item.user?.full_name || item.user?.name || item.user?.username || item.full_name || item.name || item.username || 'Unknown member'
  const resolveRoleValue = (item) => item.role_name || item.role?.role_name || item.role?.name || item.role?.title || item.position || item.title || ''
  const resolvePermissionValue = (item) => item.permission_level ?? item.permissions ?? item.permission ?? ''

  const isOwner = () => {
    return getProjectRelation({ ...project, team }, user).isOwner
  }

  const isCurrentTeamMember = () => {
    return getProjectRelation({ ...project, team }, user).isMember
  }

  const currentUserApplication = () => {
    if (!user) return null
    return myApplications.find((app) => `${resolveProjectId(app)}` === `${id}`) || null
  }

  const hasAcceptedApplication = () => {
    return (currentUserApplication()?.status || '').toLowerCase() === 'accepted'
  }

  const hasApplied = () => {
    if (!user) return false
    const app = currentUserApplication()
    if (app) return ['pending', 'accepted'].includes((app.status || '').toLowerCase())
    return applications.some((item) => normalizeId(resolveApplicantId(item)) === getCurrentUserId(user))
  }

  const notifyApplicationRefresh = (detail = {}) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(APPLICATION_REFRESH_EVENT, { detail: { projectId: id, ...detail } }))
    }
  }

  const refreshApplicationViews = async () => {
    const tasks = [fetchMyApplications()]
    if (isOwner()) tasks.push(fetchApplications())
    await Promise.allSettled(tasks)
    notifyApplicationRefresh()
  }

  const openApply = async () => {
    setProjectRoleId(null)
    setProposedRole('')
    setApplicationMessage('I would like to apply.')
    setAvailability('full_time')
    setSelectedSkills([])
    setNewSkillName('')
    setNewSkillProficiency(3)
    await fetchProjectRoles()
    await fetchUserSkills()
    setShowApplyModal(true)
  }

  const addSkillToApplication = () => {
    if (!newSkillName.trim()) {
      alert('Please enter a skill name.')
      return
    }
    const skillExists = selectedSkills.some(s => s.skill_name.toLowerCase() === newSkillName.toLowerCase())
    if (skillExists) {
      alert('This skill is already added.')
      return
    }
    setSelectedSkills([...selectedSkills, { skill_name: newSkillName.trim(), proficiency_claimed: parseInt(newSkillProficiency) }])
    setNewSkillName('')
    setNewSkillProficiency(3)
  }

  const removeSkillFromApplication = (skillName) => {
    setSelectedSkills(selectedSkills.filter(s => s.skill_name !== skillName))
  }

  const handleSubmitApplication = async () => {
    if (!projectRoleId) {
      alert('Please select a role from the dropdown.')
      return
    }
    
    setApplying(true)
    try {
      const payload = {
        project_role_id: projectRoleId,
        cover_message: applicationMessage,
        availability: availability,
        skills: selectedSkills
      }
      
      await submitApplication(id, payload)
      alert('Application submitted')
      setShowApplyModal(false)
      await refreshApplicationViews()
    } catch (err) {
      console.log('Application Submission Error:', err.response?.data)
      alert(err?.response?.data?.message || 'Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return
    try {
      await deleteProject(id)
      alert('Project deleted')
      navigate('/projects')
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete project')
    }
  }

  const openMilestoneModal = (milestone = null) => {
    setEditingMilestone(milestone)
    setMilestoneForm({
      title: milestone?.title || '',
      description: milestone?.description || '',
      due_date: milestone?.due_date?.split('T')[0] || milestone?.due || ''
    })
    setMilestoneModalOpen(true)
  }

  const closeMilestoneModal = () => {
    setEditingMilestone(null)
    setMilestoneForm({ title: '', description: '', due_date: '' })
    setMilestoneModalOpen(false)
  }

  const saveMilestone = async () => {
    if (!milestoneForm.title.trim() || !milestoneForm.due_date) {
      alert('Title and due date are required.')
      return
    }
    try {
      const payload = {
        title: milestoneForm.title.trim(),
        description: milestoneForm.description.trim() || null,
        due_date: milestoneForm.due_date,
        order_index: editingMilestone?.order_index ?? milestones.length + 1,
        status: editingMilestone?.status || 'pending'
      }
      if (editingMilestone?.id) {
        await updateProjectMilestone(id, editingMilestone.id, payload)
      } else {
        await createProjectMilestone(id, payload)
      }
      await fetchMilestones()
      closeMilestoneModal()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save milestone')
    }
  }

  const handleDeleteMilestone = async (milestoneId) => {
    if (!confirm('Delete this milestone?')) return
    try {
      await deleteProjectMilestone(id, milestoneId)
      await fetchMilestones()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete milestone')
    }
  }

  const openTeamEditModal = (member) => {
    setTeamEditMember(member)
    setTeamEditRole(member.role?.id || member.role_id || '')
    setTeamEditPermission(`${resolvePermissionValue(member)}`)
    setTeamEditModalOpen(true)
  }

  const closeTeamEditModal = () => {
    setTeamEditMember(null)
    setTeamEditRole('')
    setTeamEditPermission('')
    setTeamEditModalOpen(false)
  }

  const saveTeamMemberChanges = async () => {
    if (!teamEditMember) return
    const userId = resolveUserId(teamEditMember)
    if (!userId) {
      alert('Unable to update this team member because the API did not include member.user.id.')
      return
    }
    const payload = {}
    if (teamEditRole) payload.role_id = teamEditRole
    if (teamEditPermission !== '') payload.permissions = teamEditPermission
    if (Object.keys(payload).length === 0) {
      closeTeamEditModal()
      return
    }
    try {
      await updateProjectTeamMember(id, userId, payload)
      await fetchTeam()
      closeTeamEditModal()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save member settings')
    }
  }

  const handleRemoveMember = async (member) => {
    const userId = resolveUserId(member)
    if (!userId) {
      alert('Unable to remove this team member because the API did not include member.user.id.')
      return
    }
    if (!confirm('Remove this member from the team?')) return
    try {
      await removeProjectTeamMember(id, userId)
      await fetchTeam()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleLeaveTeam = async () => {
    if (!confirm('Leave this project team?')) return
    try {
      await leaveProjectTeam(id)
      await fetchTeam()
      await fetchProject()
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to leave team')
    }
  }

  const openApplicationDetail = async (app) => {
    try {
      const details = await getApplicationDetails(id, app.id)
      setSelectedApplication(details)
      setApplicationDetailModalOpen(true)
    } catch (err) {
      alert('Failed to load application details')
    }
  }

  const closeApplicationDetailModal = () => {
    setSelectedApplication(null)
    setApplicationDetailModalOpen(false)
  }

  const reviewApplicationAction = async (applicationId, status) => {
    const feedback = status === 'rejected' ? prompt('Optional feedback for rejection:') : ''
    setReviewing(true)
    try {
      await reviewApplication(id, applicationId, { status, feedback: feedback || undefined })
      await refreshApplicationViews()
      if (status === 'accepted') {
        await fetchTeam()
      }
      notifyApplicationRefresh({ status, applicationId })
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to review application')
    } finally {
      setReviewing(false)
    }
  }

  const openRateModal = (member) => {
    if (user?.role === 'guest') {
      alert('Only registered users can rate team members.')
      return
    }
    setRateMember(member)
    setRatingVal(5)
    setRatingComment('')
    setRateModalOpen(true)
  }

  const handleRateSubmit = async () => {
    setSubmittingRating(true)
    try {
      const ratedUserId = resolveUserId(rateMember)
      if (!ratedUserId) {
        alert('Unable to rate this team member because the API did not include member.user.id.')
        return
      }
      const { createRating } = await import('../services/rating')
      await createRating({
        rated_user_id: ratedUserId,
        project_id: id,
        rating: Number(ratingVal),
        comment: ratingComment
      })
      alert('Rating submitted successfully')
      setRateModalOpen(false)
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to submit rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  if (loading) return <div className="min-h-[16rem] flex items-center justify-center"><Spinner /></div>
  if (!project) return <div className="p-8">Project not found.</div>

  const currentApplicationStatus = (currentUserApplication()?.status || '').toLowerCase()
  const currentUserId = getCurrentUserId(user)
  const currentMember = isCurrentTeamMember()
    ? team.find((member) => normalizeId(resolveUserId(member)) === currentUserId) || { user: { id: currentUserId }, role: 'Member' }
    : null
  const isAcceptingApplications = isTruthyBoolean(project.is_accepting_applications)

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">{project.title || project.name}</h1>
          <p className="text-gray-600 mt-2">{project.short_description || project.description || project.summary}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwner() && (
            <>
              <Link to={`/projects/${id}/edit`} className="bg-yellow-600 text-white px-4 py-2 rounded">Edit Project</Link>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded">Delete Project</button>
            </>
          )}
          {!isOwner() && !currentMember && !hasApplied() && isAcceptingApplications && (
            <button onClick={openApply} disabled={applying} className="bg-blue-600 text-white px-4 py-2 rounded">Apply</button>
          )}
          {!isOwner() && currentMember && (
            <button onClick={handleLeaveTeam} className="bg-red-600 text-white px-4 py-2 rounded">Leave Project</button>
          )}
          {!isOwner() && currentApplicationStatus && currentApplicationStatus !== 'accepted' && (
            <span className="px-4 py-2 rounded bg-gray-100 text-gray-700 capitalize">Application {currentApplicationStatus}</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-2">Status</h3>
              <p>{project.status || 'Unknown'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-2">Visibility</h3>
              <p>{project.visibility || 'Public'}</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold mb-2">Team Size</h3>
              <p>{project.team_size_min || '?'} – {project.team_size_max || '?'}</p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Full Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{project.full_description || project.description || 'No description provided.'}</p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold mb-3">Goals</h3>
            <p className="text-gray-700 whitespace-pre-line">{project.goals || 'No goals specified.'}</p>
          </div>
        </div>
      )}

      {activeTab === 'Roadmap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Roadmap</h2>
            {isOwner() && (
              <button onClick={() => openMilestoneModal()} className="bg-green-600 text-white px-4 py-2 rounded">Create Milestone</button>
            )}
          </div>

          {milestones.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-6 text-gray-500">No milestones added yet.</div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{milestone.title}</h3>
                      <p className="text-gray-600 mt-1">Due: {milestone.due_date?.split('T')[0] || milestone.due || 'No due date'}</p>
                    </div>
                    {isOwner() && (
                      <div className="flex gap-2">
                        <button onClick={() => openMilestoneModal(milestone)} className="px-3 py-2 bg-yellow-500 text-white rounded">Edit</button>
                        <button onClick={() => handleDeleteMilestone(milestone.id)} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 mt-3 whitespace-pre-line">{milestone.description || 'No description added.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Team</h2>
            <p className="text-sm text-gray-500">{team.length} member{team.length === 1 ? '' : 's'}</p>
          </div>

          {team.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-6 text-gray-500">No team members yet.</div>
          ) : (
            <div className="space-y-3">
              {team.map((member) => {
                const memberId = resolveUserId(member)
                const memberName = resolveUserName(member)
                const memberRole = resolveRoleValue(member)
                const memberPermissions = resolvePermissionValue(member)
                return (
                  <div key={memberId || member.id} className="rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <p className="font-semibold">{memberName}</p>
                      <p className="text-gray-600">Role: {memberRole || 'Member'}</p>
                      <p className="text-gray-600">Permissions: {memberPermissions || 'Standard'}</p>
                      {isOwner() && normalizeId(memberId) === currentUserId && <span className="text-xs inline-block mt-2 px-2 py-1 rounded bg-yellow-100 text-yellow-800">Owner</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {isOwner() && normalizeId(memberId) !== currentUserId && (
                        <>
                          <button onClick={() => openTeamEditModal(member)} className="px-3 py-2 bg-blue-600 text-white rounded">Edit</button>
                          <button onClick={() => handleRemoveMember(member)} className="px-3 py-2 bg-red-600 text-white rounded">Remove</button>
                        </>
                      )}
                      {!isOwner() && normalizeId(memberId) === currentUserId && (
                        <button onClick={handleLeaveTeam} className="px-3 py-2 bg-red-600 text-white rounded">Leave Project</button>
                      )}
                      {normalizeId(memberId) !== currentUserId && user && user.role !== 'guest' && (
                        <button onClick={() => openRateModal(member)} className="px-3 py-2 bg-indigo-600 text-white rounded">Rate Member</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Applications' && isOwner() && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Incoming Applications</h2>
            <p className="text-sm text-gray-500">{applications.length} application{applications.length === 1 ? '' : 's'}</p>
          </div>

          {loadingApps ? (
            <div className="flex justify-center p-6"><div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
          ) : applications.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-6 text-gray-500">No applications received yet.</div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <p className="font-semibold">{app.applicant?.full_name || app.user?.full_name || app.applicant?.username || app.user?.username || 'Unknown applicant'}</p>
                      <p className="text-gray-600">Applied for: {app.role_name || app.proposed_role || 'General'}</p>
                      <p className="text-gray-600 text-sm mt-1">Status: <span className={`font-medium ${
                        app.status === 'accepted' ? 'text-green-600' :
                        app.status === 'rejected' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>{app.status || 'pending'}</span></p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openApplicationDetail(app)} className="px-3 py-2 bg-blue-600 text-white rounded">View Details</button>
                      {app.status === 'pending' && (
                        <>
                          <button onClick={() => reviewApplicationAction(app.id, 'accepted')} disabled={reviewing} className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50">Accept</button>
                          <button onClick={() => reviewApplicationAction(app.id, 'rejected')} disabled={reviewing} className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-50">Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Applications' && !isOwner() && (
        <div className="rounded-lg border border-gray-200 p-6 text-gray-500 text-center">
          Only project owners can view applications.
        </div>
      )}

      {showApplyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-3">Apply to project</h3>
            <div className="space-y-4">
              {loadingRoles ? (
                <div className="flex justify-center p-4">
                  <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : projectRoles.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                  No open roles for this project.
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Role *</label>
                  <select 
                    value={projectRoleId || ''} 
                    onChange={(e) => {
                      const selectedId = e.target.value
                      setProjectRoleId(selectedId)
                      if (selectedId) {
                        const selectedRole = projectRoles.find(r => r.id === selectedId)
                        if (selectedRole) {
                          setProposedRole(resolveRoleValue(selectedRole))
                        }
                      } else {
                        setProposedRole('')
                      }
                    }} 
                    className="mt-1 block w-full border rounded px-3 py-2"
                  >
                    <option value="">-- Choose a role --</option>
                    {projectRoles.map((r) => (
                      <option key={r.id} value={r.id}>{resolveRoleValue(r)}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Availability *</label>
                <select 
                  value={availability} 
                  onChange={(e) => setAvailability(e.target.value)} 
                  className="mt-1 block w-full border rounded px-3 py-2"
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="weekends">Weekends</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Message</label>
                <textarea value={applicationMessage} onChange={(e) => setApplicationMessage(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" rows={3} placeholder="Tell the project owner why you're a great fit for this role." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newSkillName} 
                      onChange={(e) => setNewSkillName(e.target.value)} 
                      placeholder="e.g. React, Python, UI Design" 
                      className="flex-1 border rounded px-3 py-2 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && addSkillToApplication()}
                    />
                    <select 
                      value={newSkillProficiency} 
                      onChange={(e) => setNewSkillProficiency(e.target.value)} 
                      className="border rounded px-2 py-2 text-sm"
                    >
                      <option value="1">Beginner (1)</option>
                      <option value="2">Basic (2)</option>
                      <option value="3">Intermediate (3)</option>
                      <option value="4">Advanced (4)</option>
                      <option value="5">Expert (5)</option>
                    </select>
                    <button 
                      type="button"
                      onClick={addSkillToApplication} 
                      className="px-3 py-2 bg-gray-600 text-white rounded text-sm"
                    >
                      Add
                    </button>
                  </div>
                  {selectedSkills.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {selectedSkills.map((skill) => (
                        <div key={skill.skill_name} className="flex items-center justify-between bg-blue-50 p-2 rounded text-sm">
                          <span>{skill.skill_name} <span className="text-gray-600">({skill.proficiency_claimed}/5)</span></span>
                          <button 
                            type="button"
                            onClick={() => removeSkillFromApplication(skill.skill_name)} 
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4">
                <button onClick={() => setShowApplyModal(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={handleSubmitApplication} disabled={applying || projectRoles.length === 0 || !projectRoleId} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed">{applying ? 'Submitting...' : 'Submit application'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {milestoneModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded shadow max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingMilestone ? 'Edit Milestone' : 'Create Milestone'}</h3>
              <button onClick={closeMilestoneModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={milestoneForm.title} onChange={(e) => setMilestoneForm((prev) => ({ ...prev, title: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={milestoneForm.description} onChange={(e) => setMilestoneForm((prev) => ({ ...prev, description: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" rows={4} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input type="date" value={milestoneForm.due_date} onChange={(e) => setMilestoneForm((prev) => ({ ...prev, due_date: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={closeMilestoneModal} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={saveMilestone} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {teamEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded shadow max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Member</h3>
              <button onClick={closeTeamEditModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-700">{resolveUserName(teamEditMember)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select value={teamEditRole} onChange={(e) => setTeamEditRole(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                  <option value="">No role change</option>
                  {projectRoles.map((role) => (
                    <option key={role.id} value={role.id}>{resolveRoleValue(role)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Permissions</label>
                <select value={teamEditPermission} onChange={(e) => setTeamEditPermission(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
                  <option value="">No permission change</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={closeTeamEditModal} className="px-3 py-2 rounded border">Cancel</button>
                <button onClick={saveTeamMemberChanges} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {applicationDetailModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded shadow max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Application Details</h3>
              <button onClick={closeApplicationDetailModal} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applicant</label>
                  <p className="mt-1 text-gray-700">{selectedApplication.applicant?.full_name || selectedApplication.user?.full_name || selectedApplication.applicant?.username || selectedApplication.user?.username || 'Unknown'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Applied For</label>
                  <p className="mt-1 text-gray-700">{selectedApplication.role_name || selectedApplication.proposed_role || 'General'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Message</label>
                <p className="mt-1 text-gray-700 whitespace-pre-line">{selectedApplication.cover_message || 'No message provided.'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1 text-gray-700">
                  <span className={`font-medium ${
                    selectedApplication.status === 'accepted' ? 'text-green-600' :
                    selectedApplication.status === 'rejected' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>{selectedApplication.status || 'pending'}</span>
                </p>
              </div>
              {selectedApplication.feedback && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Feedback</label>
                  <p className="mt-1 text-gray-700 whitespace-pre-line">{selectedApplication.feedback}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={closeApplicationDetailModal} className="px-4 py-2 bg-gray-200 rounded">Close</button>
                {selectedApplication.status === 'pending' && (
                  <>
                    <button onClick={() => reviewApplicationAction(selectedApplication.id, 'accepted')} disabled={reviewing} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">Accept</button>
                    <button onClick={() => reviewApplicationAction(selectedApplication.id, 'rejected')} disabled={reviewing} className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50">Reject</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {rateModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded shadow max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Rate {resolveUserName(rateMember)}</h3>
              <button onClick={() => setRateModalOpen(false)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={ratingVal}
                  onChange={(e) => setRatingVal(e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  rows={3}
                  placeholder="Share your experience working with this member..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setRateModalOpen(false)} className="px-3 py-2 rounded border text-gray-600">Cancel</button>
                <button onClick={handleRateSubmit} disabled={submittingRating} className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
