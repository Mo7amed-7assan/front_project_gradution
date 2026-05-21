import api from './api'

function getData(res) {
  return res?.data?.data || res?.data || []
}

export async function listSettings(params = {}) {
  const res = await api.get('/admin/settings', { params })
  return getData(res)
}

export async function getSettingByKey(key) {
  const res = await api.get(`/admin/settings/${key}`)
  return getData(res)
}

export async function updateSetting(key, payload) {
  const res = await api.patch(`/admin/settings/${key}`, payload)
  return getData(res)
}

export async function getSettingHistory(key, params = {}) {
  const res = await api.get(`/admin/settings/${key}/history`, { params })
  return getData(res)
}
