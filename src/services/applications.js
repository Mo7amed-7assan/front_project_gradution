import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

export async function getProjectApplications(projectId, params = {})
{
    const res = await api.get(`/projects/${projectId}/applications`, { params })
    return getData(res)
}

export async function getApplicationDetails(projectId, applicationId)
{
    const res = await api.get(`/projects/${projectId}/applications/${applicationId}`)
    return getData(res)
}

export async function submitApplication(projectId, { project_role_id, cover_message, availability, skills })
{
    const payload = { project_role_id, cover_message, availability, skills }
    const res = await api.post(`/projects/${projectId}/applications`, payload)
    return getData(res)
}

export async function reviewApplication(projectId, applicationId, payload)
{
    const res = await api.patch(`/projects/${projectId}/applications/${applicationId}/review`, payload)
    return getData(res)
}

export async function getMyApplications(params = {})
{
    const res = await api.get('/applications/mine', { params })
    return getData(res)
}

export async function withdrawApplication(applicationId)
{
    const res = await api.patch(`/applications/${applicationId}/withdraw`)
    return getData(res)
}

export default {
    getProjectApplications,
    getApplicationDetails,
    submitApplication,
    reviewApplication,
    getMyApplications,
    withdrawApplication,
}
