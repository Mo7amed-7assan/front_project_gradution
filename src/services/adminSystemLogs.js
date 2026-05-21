import api from './api'

function getData(res) {
  return res?.data?.data || res?.data || []
}

export async function listSystemLogs(params = {}) {
  const res = await api.get('/admin/system-logs', { params })
  return getData(res)
}

export async function getSystemLogById(id) {
  const res = await api.get(`/admin/system-logs/${id}`)
  return getData(res)
}
