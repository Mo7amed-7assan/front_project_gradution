import api from './api'

function getData(res) {
  return res?.data?.data || res?.data || []
}

export async function listUsers(params = {}) {
  const res = await api.get('/admin/users', { params })
  return getData(res)
}

export async function getUserById(id) {
  const res = await api.get(`/admin/users/${id}`)
  return getData(res)
}

export async function updateUser(id, payload) {
  const res = await api.patch(`/admin/users/${id}`, payload)
  return getData(res)
}

export async function deleteUser(id) {
  const res = await api.delete(`/admin/users/${id}/delete`)
  return getData(res)
}
