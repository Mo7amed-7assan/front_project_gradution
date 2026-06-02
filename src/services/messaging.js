import
    {
        getFirebaseConversations,
        getFirebaseConversationMessages,
        sendRealtimeMessage as sendRealtimeMessageToFirebase,
        createFirebaseConversation,
    } from './realtimeChat'

export const getConversations = async (userId = '') =>
{
    return getFirebaseConversations(userId)
}

export const getConversationMessages = async (conversationId) =>
{
    return getFirebaseConversationMessages(conversationId)
}

export const sendMessage = async (conversationId, payload) =>
{
    return sendRealtimeMessageToFirebase(conversationId, payload)
}

export const startConversation = async (payload) =>
{
    return createFirebaseConversation(payload)
}

export default { getConversations, getConversationMessages, sendMessage, startConversation }
