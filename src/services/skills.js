import api from './api'

export const searchUsers = async (params = {}) =>
{
    const res = await api.get('/users', { params })
    return res
}

export const endorseSkill = async (skillName) =>
{
    const res = await api.post(`/skills/${skillName}/endorse`)
    return res
}

export const getUserSkills = async (params = {}) =>
{
    const res = await api.get('/profile/skills', { params })
    return res
}

export const addUserSkill = async (payload) =>
{
    const res = await api.post('/profile/skills', payload)
    return res
}

export const updateUserSkill = async (skillName, payload) =>
{
    const res = await api.put(`/profile/skills/${skillName}`, payload)
    return res
}

export const deleteUserSkill = async (skillName) =>
{
    const res = await api.delete(`/profile/skills/${skillName}`)
    return res
}
