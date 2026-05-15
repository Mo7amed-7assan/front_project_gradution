import api from './api'

const getData = (res) => {
    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
    if (Array.isArray(res?.data?.data)) return res.data.data
    return res?.data?.data ?? res?.data ?? res
}

export async function getUserRatings(userId, params = {}) {
    const res = await api.get(`/users/${userId}/ratings`, { params })
    return res.data // Could contain average and list of ratings depending on API shape
}

export async function createRating(payload) {
    // payload: { rated_user_id, rating, comment, project_id (optional) }
    if (payload.rating !== undefined) {
        payload.rating = parseInt(payload.rating, 10);
        if (isNaN(payload.rating) || payload.rating < 1 || payload.rating > 5) {
            throw new Error('Rating must be an integer between 1 and 5');
        }
    }
    const res = await api.post('/ratings', payload)
    return res.data
}

export async function updateRating(id, payload) {
    if (payload.rating !== undefined) {
        payload.rating = parseInt(payload.rating, 10);
        if (isNaN(payload.rating) || payload.rating < 1 || payload.rating > 5) {
            throw new Error('Rating must be an integer between 1 and 5');
        }
    }
    const res = await api.put(`/ratings/${id}`, payload)
    return res.data
}

export async function deleteRating(id) {
    const res = await api.delete(`/ratings/${id}`)
    return res.data
}

export default {
    getUserRatings,
    createRating,
    updateRating,
    deleteRating
}
