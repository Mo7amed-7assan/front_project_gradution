import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

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

export const markAllNotificationsAsRead = async () =>
{
    const res = await api.post('/notifications/read-all')
    return getData(res)
}

export const getNotificationPreferences = async () =>
{
    const res = await api.get('/notifications/preferences')
    return getData(res)
}

export const updateNotificationPreferences = async (payload) =>
{
    const res = await api.put('/notifications/preferences', payload)
    return getData(res)
}

export default {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getNotificationPreferences,
    updateNotificationPreferences
}
