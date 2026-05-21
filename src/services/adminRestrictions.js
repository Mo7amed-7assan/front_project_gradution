import api from './api'

function getData(res) {
  return res?.data?.data || res?.data || []
}

export async function listRestrictions(params = {}) {
  const res = await api.get('/admin/restrictions', { params })
  return getData(res)
}

export async function getRestrictionById(id) {
  const res = await api.get(`/admin/restrictions/${id}`)
  return getData(res)
}

export async function restrictUser(payload) {
  const res = await api.post('/admin/restrictions', payload)
  return getData(res)
}

export async function liftRestriction(id) {
  const res = await api.patch(`/admin/restrictions/${id}/lift`)
  return getData(res)
}

export async function getUserRestrictions(userId) {
  const res = await api.get(`/admin/users/${userId}/restrictions`, { params: { per_page: 50 } })
  return getData(res)
}
