import api from './api'

export const fileReport = async (payload) =>
{
    const res = await api.post('/reports', payload)
    return res
}

export const listMyReports = async (params = {}) =>
{
    const res = await api.get('/reports', { params })
    return res
}

export const getReport = async (reportId) =>
{
    const res = await api.get(`/reports/${reportId}`)
    return res
}

export const updateReport = async (reportId, payload) =>
{
    const res = await api.patch(`/reports/${reportId}`, payload)
    return res
}

export const withdrawReport = async (reportId) =>
{
    const res = await api.patch(`/reports/${reportId}/withdraw`)
    return res
}

export const deleteReport = async (reportId) =>
{
    const res = await api.delete(`/reports/${reportId}/`)
    return res
}
