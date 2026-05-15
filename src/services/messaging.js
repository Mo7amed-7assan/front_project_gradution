import api from './api'

export const getConversations = async () =>
{
    return api.get('/conversations')
}

export const getConversationMessages = async (conversationId) =>
{
    return api.get(`/conversations/${conversationId}/messages`)
}

export const sendMessage = async (conversationId, payload) =>
{
    return api.post(`/conversations/${conversationId}/messages`, payload)
}

export const startConversation = async (payload) =>
{
    return api.post('/conversations', payload)
}

export default { getConversations, getConversationMessages, sendMessage, startConversation }
