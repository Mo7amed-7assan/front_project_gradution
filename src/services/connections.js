import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res
const CONNECTION_EXISTS_STATUSES = new Set([400, 422])
const RECONNECTABLE_STATUSES = new Set(['rejected', 'deleted'])

const isAlreadyExistsError = (err) => {
    const status = err?.response?.status
    const message = `${err?.response?.data?.message || err?.message || ''}`.toLowerCase()
    return CONNECTION_EXISTS_STATUSES.has(status) && (
        message.includes('already') ||
        message.includes('exists') ||
        message.includes('connection request')
    )
}

const involvesRecipient = (connection, recipientId) => {
    const rId = String(recipientId).toLowerCase()
    const reqId = String(connection?.requester?.id || connection?.requester_id || '').toLowerCase()
    const recId = String(connection?.recipient?.id || connection?.recipient_id || '').toLowerCase()
    return reqId === rId || recId === rId
}

export async function getConnections(params = {})
{
    const res = await api.get('/connections', { params })
    return getData(res)
}

export async function sendConnectionRequest(recipient_id, connection_type = null)
{
    const payload = { recipient_id, connection_type }
    try {
        const res = await api.post('/connections', payload)
        return getData(res)
    } catch (err) {
        if (!isAlreadyExistsError(err)) throw err

        const connections = await getConnections().catch(() => [])
        const existing = Array.isArray(connections)
            ? connections.find((connection) => involvesRecipient(connection, recipient_id))
            : null
        const existingStatus = `${existing?.status || ''}`.toLowerCase()

        if (existing?.id && RECONNECTABLE_STATUSES.has(existingStatus)) {
            await removeConnection(existing.id)
            const retry = await api.post('/connections', payload)
            return getData(retry)
        }

        const error = new Error(
            existingStatus === 'pending'
                ? 'A connection request is already pending.'
                : existingStatus === 'accepted'
                ? 'You are already connected.'
                : err?.response?.data?.message || 'A connection request already exists.'
        )
        error.response = err.response
        error.existingConnection = existing || null
        throw error
    }
}

export async function respondToConnection(connection_id, status)
{
    const res = await api.patch(`/connections/${connection_id}/accept`, { status })
    return getData(res)
}

export async function removeConnection(connection_id)
{
    const res = await api.delete(`/connections/${connection_id}`)
    return getData(res)
}

export default {
    getConnections,
    sendConnectionRequest,
    respondToConnection,
    removeConnection,
}
