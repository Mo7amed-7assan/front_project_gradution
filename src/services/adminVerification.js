import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

export async function listVerifications(params = {}) {
  const res = await api.get('/admin/verifications', { params })
  return getData(res)
}

export async function getVerificationById(id) {
  const res = await api.get(`/admin/verifications/${id}`)
  return getData(res)
}

export async function getVerificationByUserId(userId) {
  const res = await api.get(`/admin/users/${userId}/verification`)
  return getData(res)
}

export async function claimVerification(id) {
  const res = await api.patch(`/admin/verifications/${id}/claim`)
  return getData(res)
}

export async function escalateVerification(id, payload = {}) {
  const res = await api.patch(`/admin/verifications/${id}/escalate`, payload)
  return getData(res)
}

export async function reviewVerification(id, payload = {}) {
  const res = await api.post(`/admin/verifications/${id}/review`, payload)
  return getData(res)
}

export default {
  listVerifications,
  getVerificationById,
  getVerificationByUserId,
  claimVerification,
  escalateVerification,
  reviewVerification,
}
