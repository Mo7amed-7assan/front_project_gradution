import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import SkeletonCard from '../components/SkeletonCard'
import { deleteProject, getMyProjects } from '../services/projects'
import { getCurrentUserId, getProjectOwnerId, getProjectRelation } from '../utils/projectAccess'
import MyProjectsUI from '../ui/pages/MyProjectsUI'

const PROJECT_REFRESH_EVENT = 'projects:refresh'

const STATUS_STYLES = {
  planning:    'bg-yellow-100 text-yellow-700',
  active:      'bg-green-100 text-green-700',
  on_hold:     'bg-blue-100  text-blue-700',
  completed:   'bg-gray-100  text-gray-600',
  cancelled:   'bg-red-100 text-red-700',
}

// Extract projects array from response
function extractProjects(res) {
  const d = res?.data ?? res
  if (Array.isArray(d?.data?.data?.data)) return { items: d.data.data.data, meta: d.data.data.meta || {} }
  if (Array.isArray(d?.data?.data))       return { items: d.data.data,       meta: d.data.meta || {} }
  if (Array.isArray(d?.data?.items))      return { items: d.data.items,       meta: d.data.meta || {} }
  if (Array.isArray(d?.data?.projects))   return { items: d.data.projects,    meta: d.data.meta || {} }
  if (Array.isArray(d?.data))             return { items: d.data,             meta: d.meta || {} }
  if (Array.isArray(d?.items))            return { items: d.items,            meta: d.meta || {} }
  if (Array.isArray(d))                   return { items: d,                  meta: {} }
  return { items: [], meta: {} }
}

export default function MyProjects() {
  const { user }   = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetchMyProjects = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!getCurrentUserId(user)) {
        setProjects([])
        return
      }

      console.log('Current User:', getCurrentUserId(user))

      const result = await getMyProjects({ per_page: 100 })
      const items = extractProjects(result).items
      items.forEach((project) => {
        console.log('Project Owner:', getProjectOwnerId(project))
      })
      setProjects(items)
    } catch (err) {
      console.error('MyProjects fetch error:', err)
      setError('Failed to load your projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMyProjects() }, [user])

  useEffect(() => {
    const onProjectRefresh = () => fetchMyProjects()
    window.addEventListener(PROJECT_REFRESH_EVENT, onProjectRefresh)
    return () => window.removeEventListener(PROJECT_REFRESH_EVENT, onProjectRefresh)
  }, [user])

  const handleDelete = async (projectId, e) => {
    e.preventDefault()
    if (!confirm('Delete this project? This cannot be undone.')) return
    setDeleting(projectId)
    try {
      await deleteProject(projectId)
      setProjects(prev => prev.filter(p => p.id !== projectId))
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete project.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <MyProjectsUI
      projects={projects}
      loading={loading}
      error={error}
      deleting={deleting}
      handleDelete={handleDelete}
      user={user}
      STATUS_STYLES={STATUS_STYLES}
      getProjectRelation={getProjectRelation}
    />
  )
}
