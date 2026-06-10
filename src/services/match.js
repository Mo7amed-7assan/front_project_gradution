import api from './api'

const getData = (res) => {
    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
    if (Array.isArray(res?.data?.data)) return res.data.data
    return res?.data?.data ?? res?.data ?? res
}

export async function getMatches(params = {}) {
    const res = await api.get('/matches', { params })
    // Return the full response so callers can navigate the structure
    return res
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
