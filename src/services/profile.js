import api from './api'

const getData = (res) => res?.data || {}

export async function getMyProfile(params = {})
{
    const res = await api.get('/profile', { params })
    return getData(res)
}

export async function updateMyProfile(payload)
{
    const res = await api.put('/profile', payload)
    return getData(res)
}

export async function changePassword(current_password, password, password_confirmation)
{
    const res = await api.post('/profile/change-password', { current_password, password, password_confirmation })
    return getData(res)
}

export async function getMySkills(params = {})
{
    const res = await api.get('/profile/skills', { params })
    return getData(res)
}

export async function addMySkill(payload)
{
    const res = await api.post('/profile/skills', payload)
    return getData(res)
}

export async function updateMySkill(skillId, payload)
{
    const res = await api.put(`/profile/skills/${skillId}`, payload)
    return getData(res)
}

export async function deleteMySkill(skillId)
{
    const res = await api.delete(`/profile/skills/${skillId}`)
    return getData(res)
}

export async function endorseSkill(skillId)
{
    const res = await api.post(`/skills/${skillId}/endorse`)
    return getData(res)
}

export async function unendorseSkill(skillId)
{
    const res = await api.delete(`/skills/${skillId}/endorse`)
    return getData(res)
}

export async function getMyPortfolio(params = {})
{
    const res = await api.get('/profile/portfolio', { params })
    return getData(res)
}

export async function addPortfolioItem(payload)
{
    const res = await api.post('/profile/portfolio', payload)
    return getData(res)
}

export async function updatePortfolioItem(itemId, payload)
{
    const res = await api.put(`/profile/portfolio/${itemId}`, payload)
    return getData(res)
}

export async function deletePortfolioItem(itemId)
{
    const res = await api.delete(`/profile/portfolio/${itemId}`)
    return getData(res)
}

export async function searchUsers(params = {})
{
    const res = await api.get('/users', { params })
    return getData(res)
}

export async function getUserById(userId)
{
    const res = await api.get(`/users/${userId}`)
    return getData(res)
}

export async function getUserPortfolio(userId, params = {})
{
    const res = await api.get(`/users/${userId}/portfolio`, { params })
    return getData(res)
}

export default {
    getMyProfile,
    updateMyProfile,
    changePassword,
    getMySkills,
    addMySkill,
    updateMySkill,
    deleteMySkill,
    endorseSkill,
    unendorseSkill,
    getMyPortfolio,
    addPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    searchUsers,
    getUserById,
    getUserPortfolio
}
