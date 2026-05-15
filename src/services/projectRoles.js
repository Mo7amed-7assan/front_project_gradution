import api from './api'

export const createProjectRole = async (projectId, payload) =>
{
    const res = await api.post(`/projects/${projectId}/roles`, payload)
    return res
}

export const listProjectRoles = async (projectId) =>
{
    const res = await api.get(`/projects/${projectId}/roles`)
    return res
}

export const updateProjectRole = async (projectId, roleId, payload) =>
{
    const res = await api.put(`/projects/${projectId}/roles/${roleId}`, payload)
    return res
}

export const deleteProjectRole = async (projectId, roleId) =>
{
    const res = await api.delete(`/projects/${projectId}/roles/${roleId}`)
    return res
}
