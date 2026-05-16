import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

export const extractCalls = (value) => {
    if (Array.isArray(value)) return value
    if (Array.isArray(value?.data?.data?.data)) return value.data.data.data
    if (Array.isArray(value?.data?.data)) return value.data.data
    if (Array.isArray(value?.data?.calls)) return value.data.calls
    if (Array.isArray(value?.data)) return value.data
    if (Array.isArray(value?.calls)) return value.calls
    if (Array.isArray(value?.items)) return value.items
    return []
}

export const buildCallFrameUrl = (call) => {
    const directUrl = call?.join_url || call?.meeting_url || call?.call_url
    if (directUrl) return directUrl

    const roomUrl = call?.room_url || call?.roomUrl
    const token = call?.join_token || call?.joinToken
    if (!roomUrl) return ''
    if (!token) return roomUrl

    const separator = roomUrl.includes('?') ? '&' : '?'
    return `${roomUrl}${separator}jwt=${encodeURIComponent(token)}`
}

export const initiateCall = async (payload) =>
{
    const res = await api.post('/calls', payload)
    return getData(res)
}

export const listCalls = async (params = {}) =>
{
    const res = await api.get('/calls', { params })
    return res.data
}

export const getCall = async (callId) =>
{
    const res = await api.get(`/calls/${callId}`)
    return getData(res)
}

export const joinCall = async (callId) =>
{
    const res = await api.post(`/calls/${callId}/join`)
    return getData(res)
}

export const leaveCall = async (callId) =>
{
    const res = await api.post(`/calls/${callId}/leave`)
    return getData(res)
}

export const endCall = async (callId) =>
{
    const res = await api.patch(`/calls/${callId}/end`)
    return getData(res)
}

export const cancelCall = async (callId) =>
{
    const res = await api.patch(`/calls/${callId}/cancel`)
    return getData(res)
}

export default {
    extractCalls,
    buildCallFrameUrl,
    initiateCall,
    listCalls,
    getCall,
    joinCall,
    leaveCall,
    endCall,
    cancelCall
}
