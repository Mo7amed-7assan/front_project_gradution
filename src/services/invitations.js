import api from './api'

export const INVITATION_TYPES = {
    PROJECT_JOIN: 'project_join',
    TEAM_INVITE: 'team_invite',
    COLLABORATION_REQUEST: 'collaboration_request',
    MENTORSHIP: 'mentorship'
}

const getData = (res) => {
    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
    if (Array.isArray(res?.data?.data)) return res.data.data
    return res?.data?.data ?? res?.data ?? res
}

export async function getInvitations(params = {}) {
    const res = await api.get('/invitations', { params })
    return getData(res)
}

export async function sendInvitation(recipient_id, invitation_type, project_id = null) {
    const res = await api.post('/invitations', { recipient_id, invitation_type, project_id })
    return res.data
}

export const sendInvite = sendInvitation

export async function respondToInvitation(id, response) {
    const res = await api.patch(`/invitations/${id}/respond`, { response })
    return res.data
}

export async function withdrawInvitation(id) {
    const res = await api.patch(`/invitations/${id}/withdraw`)
    return res.data
}

export default {
    getInvitations,
    sendInvitation,
    sendInvite,
    respondToInvitation,
    withdrawInvitation
}
