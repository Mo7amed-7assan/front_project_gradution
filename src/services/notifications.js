import api from './api'

export const getNotifications = async (params = {}) =>
{
    const res = await api.get('/notifications', { params })
    return res
}

export const markNotificationAsRead = async (id) =>
{
    const res = await api.patch(`/notifications/${id}/read`)
    return res
}