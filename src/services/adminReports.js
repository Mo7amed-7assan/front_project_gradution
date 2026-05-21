import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

export async function listReports(params = {}) {
  const res = await api.get('/admin/reports', { params })
  return getData(res)
}

export async function getReportById(id) {
  const res = await api.get(`/admin/reports/${id}`)
  return getData(res)
}

export async function updateReport(id, payload = {}) {
  const res = await api.patch(`/admin/reports/${id}`, payload)
  return getData(res)
}

export default {
  listReports,
  getReportById,
  updateReport,
}
