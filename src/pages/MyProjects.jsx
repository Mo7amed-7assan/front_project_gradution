import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import SkeletonCard from '../components/SkeletonCard'
import { deleteProject, getMyProjects } from '../services/projects'
import { getCurrentUserId, getProjectOwnerId, getProjectRelation } from '../utils/projectAccess'

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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading...' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          to="/projects/create"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          + Create Project
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : projects.length === 0
          ? (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">🚀</div>
              <p className="text-lg font-medium">No projects yet</p>
              <p className="text-sm mt-1">Create your first project and start building your team.</p>
              <Link
                to="/projects/create"
                className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                Create a Project
              </Link>
            </div>
          )
          : projects.map(p => {
            const statusKey   = (p.status || '').toLowerCase()
            const statusClass = STATUS_STYLES[statusKey] || 'bg-gray-100 text-gray-600'
            const roles       = p.project_roles || p.roles || []
            const relation    = getProjectRelation(p, user)

            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col">
                {/* Title */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link
                    to={`/projects/${p.id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 truncate text-base"
                  >
                    {p.title || p.name}
                  </Link>
                  {p.status && (
                    <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${statusClass}`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm flex-1 mb-3">
                  {p.description
                    ? (p.description.length > 120 ? p.description.slice(0, 120) + '…' : p.description)
                    : 'No description provided.'}
                </p>

                {/* Roles */}
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {roles.slice(0, 4).map(r => (
                      <span
                        key={r.id}
                        className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full"
                      >
                        {r.role_name || r.name || r.title}
                      </span>
                    ))}
                    {roles.length > 4 && (
                      <span className="text-xs text-gray-400">+{roles.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-gray-50">
                  <Link
                    to={`/projects/${p.id}`}
                    className="flex-1 text-center text-xs px-2 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium transition-colors"
                  >
                    Open
                  </Link>
                  {relation.isOwner && (
                    <Link
                      to={`/projects/${p.id}/edit`}
                      className="flex-1 text-center text-xs px-2 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                    >
                      Edit
                    </Link>
                  )}
                  {relation.isOwner && (
                    <button
                    onClick={(e) => handleDelete(p.id, e)}
                    disabled={deleting === p.id}
                    className="flex-1 text-xs px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors disabled:opacity-50"
                  >
                    {deleting === p.id ? '…' : 'Delete'}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
