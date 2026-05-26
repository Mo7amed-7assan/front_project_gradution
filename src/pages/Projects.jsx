import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getProjects } from '../services/project'
import { getCurrentUserId, getProjectOwnerId } from '../utils/projectAccess'
import ProjectsUI from '../ui/pages/ProjectsUI'

export default function Projects() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('projects')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(9)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    skill: '',
    search: '',
    accepting_applications: '',
    sort: 'created_at'
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const params = { page, per_page: perPage, ...filters }
      // remove empty filters
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k] })
      const response = await getProjects(params)
      const items = response?.data?.data || response?.data || []
      const projectItems = Array.isArray(items) ? items : []
      console.log('GET /projects projects array:', response?.data?.data)
      console.log('Current User:', getCurrentUserId(user))
      projectItems.forEach((project) => console.log('Project Owner:', getProjectOwnerId(project)))
      setProjects(projectItems)
      
      // try to set pagination meta
      const meta = response?.data?.meta || {}
      if (meta?.last_page) setTotalPages(meta.last_page)
      else if (meta?.total && meta?.per_page) {
        setTotalPages(Math.ceil(meta.total / meta.per_page))
      } else setTotalPages(1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProjects() }, [page, perPage, filters, user?.id])

  return (
    <ProjectsUI
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      projects={projects}
      loading={loading}
      page={page}
      perPage={perPage}
      setPerPage={setPerPage}
      totalPages={totalPages}
      filters={filters}
      setFilters={setFilters}
      showFilters={showFilters}
      setShowFilters={setShowFilters}
      setPage={setPage}
      user={user}
    />
  )
}
