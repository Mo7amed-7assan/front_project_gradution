import api from './api'

export const initiateCall = async (payload) =>
{
    const res = await api.post('/calls', payload)
    return res
}

export const listCalls = async (params = {}) =>
{
    const res = await api.get('/calls', { params })
    return res
}

export const getCall = async (callId) =>
{
    const res = await api.get(`/calls/${callId}`)
    return res
}

export const joinCall = async (callId) =>
{
    const res = await api.post(`/calls/${callId}/join`)
    return res
}

export const leaveCall = async (callId) =>
{
    const res = await api.post(`/calls/${callId}/leave`)
    return res
}

export const endCall = async (callId) =>
{
    const res = await api.patch(`/calls/${callId}/end`)
    return res
}

export const cancelCall = async (callId) =>
{
    const res = await api.patch(`/calls/${callId}/cancel`)
    return res
}
