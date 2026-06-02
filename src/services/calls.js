import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

export const extractCalls = (value) =>
{
    if (Array.isArray(value)) return value
    if (Array.isArray(value?.data?.data?.data)) return value.data.data.data
    if (Array.isArray(value?.data?.data)) return value.data.data
    if (Array.isArray(value?.data?.calls)) return value.data.calls
    if (Array.isArray(value?.data)) return value.data
    if (Array.isArray(value?.calls)) return value.calls
    if (Array.isArray(value?.items)) return value.items
    return []
}

export const buildCallFrameUrl = (call) =>
{
    const directUrl = call?.join_url || call?.meeting_url || call?.call_url
    if (directUrl) return directUrl

    const roomUrl = call?.room_url || call?.roomUrl
    const token = call?.join_token || call?.joinToken
    if (!roomUrl) return ''
    if (!token) return roomUrl

    const separator = roomUrl.includes('?') ? '&' : '?'
    return `${roomUrl}${separator}jwt=${encodeURIComponent(token)}`
}

const generateUuid = () =>
{
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function')
    {
        const bytes = new Uint8Array(16)
        crypto.getRandomValues(bytes)
        bytes[6] = (bytes[6] & 0x0f) | 0x40
        bytes[8] = (bytes[8] & 0x3f) | 0x80
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .map((hex, index) => ([4, 6, 8, 10].includes(index) ? `-${hex}` : hex))
            .join('')
    }

    const randomHex = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    return `${randomHex()}${randomHex()}-${randomHex()}-4${randomHex().substring(0, 3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomHex().substring(0, 3)}-${randomHex()}${randomHex()}${randomHex()}`
}

const sanitizeConversationId = (conversationId) =>
{
    if (!conversationId) return conversationId
    const raw = `${conversationId}`.trim()
    const uuidMatch = raw.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i)
    if (uuidMatch) return uuidMatch[0]
    if (/^[A-Za-z0-9_-]+$/.test(raw)) return raw
    return generateUuid()
}

export const initiateCall = async (payload) =>
{
    const body = {
        status: 'active',
        ...payload,
    }
    if (body.conversation_id)
    {
        body.conversation_id = sanitizeConversationId(body.conversation_id)
    }
    const res = await api.post('/calls', body)
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
