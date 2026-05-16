import api from './api'

export const RATING_FIELDS = [
    { key: 'overall_rating', label: 'Overall' },
    { key: 'communication_rating', label: 'Communication' },
    { key: 'reliability_rating', label: 'Reliability' },
    { key: 'skill_rating', label: 'Skill' },
    { key: 'problem_solving_rating', label: 'Problem solving' },
    { key: 'teamwork_rating', label: 'Teamwork' },
]

const getData = (res) => {
    if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
    if (Array.isArray(res?.data?.data)) return res.data.data
    return res?.data?.data ?? res?.data ?? res
}

const parseRating = (value, field) => {
    if (value === null || value === undefined || value === '') return undefined
    const rating = parseInt(value, 10)
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error(`${field} must be an integer between 1 and 5`)
    }
    return rating
}

export const getRatingScore = (rating) => {
    const explicit = rating?.overall_rating ?? rating?.rating
    if (explicit !== null && explicit !== undefined) return Number(explicit) || 0

    const values = RATING_FIELDS
        .filter((field) => field.key !== 'overall_rating')
        .map((field) => Number(rating?.[field.key]))
        .filter((value) => value > 0)

    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

export const getRatingFeedback = (rating) =>
    rating?.written_feedback || rating?.review_text || rating?.comment || ''

export const normalizeRatingPayload = (payload = {}) => {
    const normalized = { ...payload }

    if (normalized.rating !== undefined && normalized.overall_rating === undefined) {
        normalized.overall_rating = normalized.rating
    }

    if (normalized.comment !== undefined && normalized.written_feedback === undefined) {
        normalized.written_feedback = normalized.comment
    }

    if (normalized.comment !== undefined && normalized.review_text === undefined) {
        normalized.review_text = normalized.comment
    }

    RATING_FIELDS.forEach(({ key }) => {
        const parsed = parseRating(normalized[key], key)
        if (parsed === undefined) delete normalized[key]
        else normalized[key] = parsed
    })

    delete normalized.rating
    delete normalized.comment

    if (!normalized.visibility) normalized.visibility = 'public'

    return normalized
}

export const extractRatings = (value) => {
    if (Array.isArray(value)) return value
    if (Array.isArray(value?.data?.data?.data)) return value.data.data.data
    if (Array.isArray(value?.data?.data)) return value.data.data
    if (Array.isArray(value?.data?.ratings)) return value.data.ratings
    if (Array.isArray(value?.data)) return value.data
    if (Array.isArray(value?.ratings)) return value.ratings
    if (Array.isArray(value?.items)) return value.items
    return []
}

export async function getUserRatings(userId, params = {}) {
    const res = await api.get(`/users/${userId}/ratings`, { params })
    return res.data
}

export async function createRating(payload) {
    const res = await api.post('/ratings', normalizeRatingPayload(payload))
    return getData(res)
}

export async function updateRating(id, payload) {
    const res = await api.put(`/ratings/${id}`, normalizeRatingPayload(payload))
    return getData(res)
}

export async function deleteRating(id) {
    const res = await api.delete(`/ratings/${id}`)
    return getData(res)
}

export default {
    RATING_FIELDS,
    getRatingScore,
    getRatingFeedback,
    normalizeRatingPayload,
    extractRatings,
    getUserRatings,
    createRating,
    updateRating,
    deleteRating
}
