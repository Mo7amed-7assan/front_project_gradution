import api from './api'

function getData(res) {
  return res?.data?.data || res?.data || []
}

export async function listActionLogs(params = {}) {
  const res = await api.get('/admin/action-logs', { params })
  return getData(res)
}

export async function getActionLogById(id) {
  const res = await api.get(`/admin/action-logs/${id}`)
  return getData(res)
}
