export const normalizeId = (value) => {
  if (value === null || value === undefined) return null
  return `${value}`
}

export const getCurrentUserId = (user) =>
  normalizeId(user?.id || user?.user_id || user?.data?.id || user?.user?.id)

export const getProjectOwnerId = (project) =>
  normalizeId(
    project?.owner?.id ||
    project?.owner?.uuid
  )

export const getProjectTeam = (project) => {
  if (Array.isArray(project?.team)) return project.team
  if (Array.isArray(project?.members)) return project.members
  if (Array.isArray(project?.project_team)) return project.project_team
  if (Array.isArray(project?.team_members)) return project.team_members
  return []
}

export const getProjectRoles = (project) => {
  if (Array.isArray(project?.roles)) return project.roles
  if (Array.isArray(project?.project_roles)) return project.project_roles
  return []
}

export const getMemberUserId = (member) =>
  normalizeId(member?.user?.id || member?.user_id)

export const isProjectOwner = (project, user) => {
  const userId = getCurrentUserId(user)
  const ownerId = getProjectOwnerId(project)
  return !!userId && !!ownerId && ownerId === userId
}

export const isProjectMember = (project, user) => {
  const userId = getCurrentUserId(user)
  if (!userId) return false
  return getProjectTeam(project).some((member) => getMemberUserId(member) === userId)
}

export const getProjectRelation = (project, user) => ({
  isOwner: isProjectOwner(project, user),
  isMember: isProjectMember(project, user),
})
