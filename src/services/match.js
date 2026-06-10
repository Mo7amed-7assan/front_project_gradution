import api from './api'

export async function getMatches(params = {}) {
    // Returns full axios response: { data: { data: [...matches], meta: {...}, links: {...} } }
    return await api.get('/matches', { params })
}

export async function saveMatch(id, saved = true) {
    const res = await api.patch(`/matches/${id}/save`, { saved })
    return res.data
}

export async function markMatchAsViewed(id) {
    const res = await api.patch(`/matches/${id}/view`)
    return res.data
}

export async function submitMatchFeedback(id, feedback_type) {
    const validFeedbackTypes = ['relevant', 'not_relevant', 'already_connected', 'not_interested'];
    if (!validFeedbackTypes.includes(feedback_type)) {
        throw new Error(`Invalid feedback_type: ${feedback_type}. Allowed values: ${validFeedbackTypes.join(', ')}`);
    }
    const res = await api.post(`/matches/${id}/feedback`, { feedback_type })
    return res.data
}

export default {
    getMatches,
    saveMatch,
    markMatchAsViewed,
    submitMatchFeedback
}
