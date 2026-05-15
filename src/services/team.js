import api from './api'

export const getProjectTeam = async (projectId) =>
{
    const res = await api.get(`/projects/${projectId}/team`)
    return res
}

export const removeTeamMember = async (projectId, userId) =>
{
    const res = await api.delete(`/projects/${projectId}/team/${userId}`)
    return res
}

export const leaveTeam = async (projectId) =>
{
    const res = await api.post(`/projects/${projectId}/team/leave`)
    return res
}
