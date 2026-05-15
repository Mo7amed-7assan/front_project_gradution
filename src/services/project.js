import api from './api'

const getData = (res) => res?.data?.data ?? res?.data ?? res

export async function getProjects(params = {})
{
    const res = await api.get('/projects', { params })
    console.log('GET /projects response:', res?.data)
    return res
}

export async function getMyProjects(params = {})
{
    const res = await api.get('/my-projects', { params })
    console.log('GET /my-projects response:', res?.data)
    return res
}

export async function getProjectById(id)
{
    const res = await api.get(`/projects/${id}`)
    return getData(res)
}

export async function getProjectDetails(id)
{
    const project = await getProjectById(id)

    const [teamResult, rolesResult] = await Promise.allSettled([
        Array.isArray(project?.team) ? Promise.resolve(project.team) : getProjectTeam(id),
        Array.isArray(project?.roles) || Array.isArray(project?.project_roles)
            ? Promise.resolve(project.roles || project.project_roles)
            : getProjectRoles(id),
    ])

    return {
        ...project,
        team: teamResult.status === 'fulfilled' ? teamResult.value : (project?.team || []),
        roles: rolesResult.status === 'fulfilled' ? rolesResult.value : (project?.roles || project?.project_roles || []),
    }
}

export async function createProject(payload)
{
    const res = await api.post('/projects', payload)
    return getData(res)
}

export async function updateProject(id, payload)
{
    const res = await api.put(`/projects/${id}`, payload)
    return getData(res)
}

export async function deleteProject(id)
{
    const res = await api.delete(`/projects/${id}`)
    return getData(res)
}

export async function getProjectRoles(projectId, params = {})
{
    const res = await api.get(`/projects/${projectId}/roles`, { params })
    return getData(res)
}

export async function createProjectRole(projectId, payload)
{
    const res = await api.post(`/projects/${projectId}/roles`, payload)
    return getData(res)
}

export async function updateProjectRole(projectId, roleId, payload)
{
    const res = await api.put(`/projects/${projectId}/roles/${roleId}`, payload)
    return getData(res)
}

export async function deleteProjectRole(projectId, roleId)
{
    const res = await api.delete(`/projects/${projectId}/roles/${roleId}`)
    return getData(res)
}

export async function getProjectSkills(projectId, params = {})
{
    const project = await getProjectById(projectId)
    return project?.skills || []
}

export async function addProjectSkill(projectId, payload)
{
    const res = await api.post(`/projects/${projectId}/skills`, payload)
    return getData(res)
}

export async function updateProjectSkill(projectId, skillId, payload)
{
    const res = await api.put(`/projects/${projectId}/skills/${skillId}`, payload)
    return getData(res)
}

export async function deleteProjectSkill(projectId, skillId)
{
    const res = await api.delete(`/projects/${projectId}/skills/${skillId}`)
    return getData(res)
}

export async function getProjectTeam(projectId, params = {})
{
    const res = await api.get(`/projects/${projectId}/team`, { params })
    return getData(res)
}

export async function updateProjectTeamMember(projectId, userId, payload)
{
    const res = await api.put(`/projects/${projectId}/team/${userId}`, payload)
    return getData(res)
}

export async function removeProjectTeamMember(projectId, userId)
{
    const res = await api.delete(`/projects/${projectId}/team/${userId}`)
    return getData(res)
}

export async function leaveProjectTeam(projectId)
{
    const res = await api.post(`/projects/${projectId}/team/leave`)
    return getData(res)
}

export async function getProjectMilestones(projectId, params = {})
{
    const res = await api.get(`/projects/${projectId}/milestones`, { params })
    return getData(res)
}

export async function createProjectMilestone(projectId, payload)
{
    const res = await api.post(`/projects/${projectId}/milestones`, payload)
    return getData(res)
}

export async function updateProjectMilestone(projectId, milestoneId, payload)
{
    const res = await api.put(`/projects/${projectId}/milestones/${milestoneId}`, payload)
    return getData(res)
}

export async function deleteProjectMilestone(projectId, milestoneId)
{
    const res = await api.delete(`/projects/${projectId}/milestones/${milestoneId}`)
    return getData(res)
}

export default {
    getProjects,
    getMyProjects,
    getProjectById,
    getProjectDetails,
    createProject,
    updateProject,
    deleteProject,
    getProjectRoles,
    createProjectRole,
    updateProjectRole,
    deleteProjectRole,
    getProjectSkills,
    addProjectSkill,
    updateProjectSkill,
    deleteProjectSkill,
    getProjectTeam,
    updateProjectTeamMember,
    removeProjectTeamMember,
    leaveProjectTeam,
    getProjectMilestones,
    createProjectMilestone,
    updateProjectMilestone,
    deleteProjectMilestone
}
