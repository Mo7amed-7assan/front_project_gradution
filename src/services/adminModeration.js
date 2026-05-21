import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

export async function listModerations(params = {}) {
  const res = await api.get('/admin/moderation', { params })
  return getData(res)
}

export async function createModeration(payload = {}) {
  const res = await api.post('/admin/moderation', payload)
  return getData(res)
}

export default {
  listModerations,
  createModeration,
}
