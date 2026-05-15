import React, { useEffect, useState } from 'react'
import SkeletonCard from '../components/SkeletonCard'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getProjects } from '../services/project'
import { getCurrentUserId, getProjectOwnerId, getProjectRelation } from '../utils/projectAccess'

export default function Projects(){
  const { user } = useAuth()
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

  useEffect(()=>{ fetchProjects() }, [page, perPage, filters, user?.id])

  return (
    <div>
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Explore Projects</h2>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowFilters(!showFilters)} className="px-3 py-1 bg-blue-600 text-white rounded">Filters</button>
            <label className="text-sm text-gray-600">Per page</label>
            <select value={perPage} onChange={e=>setPerPage(Number(e.target.value))} className="border rounded px-2 py-1">
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
            </select>
          </div>
        </div>
        {showFilters && (
          <div className="bg-white p-4 rounded shadow mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select value={filters.status} onChange={e=>setFilters(f=>({...f, status: e.target.value}))} className="mt-1 block w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input value={filters.category} onChange={e=>setFilters(f=>({...f, category: e.target.value}))} placeholder="e.g. Tech, Finance" className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Skill</label>
                <input value={filters.skill} onChange={e=>setFilters(f=>({...f, skill: e.target.value}))} placeholder="e.g. React, Python" className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Search</label>
                <input value={filters.search} onChange={e=>setFilters(f=>({...f, search: e.target.value}))} placeholder="Search projects" className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Applications</label>
                <select value={filters.accepting_applications} onChange={e=>setFilters(f=>({...f, accepting_applications: e.target.value}))} className="mt-1 block w-full border rounded px-3 py-2">
                  <option value="">All</option>
                  <option value="true">Accepting</option>
                  <option value="false">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort</label>
                <select value={filters.sort} onChange={e=>setFilters(f=>({...f, sort: e.target.value}))} className="mt-1 block w-full border rounded px-3 py-2">
                  <option value="created_at">Newest</option>
                  <option value="view_count">Most Viewed</option>
                  <option value="application_count">Most Applications</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={()=>setFilters({ status: '', category: '', skill: '', search: '', accepting_applications: '', sort: 'created_at' })} className="px-3 py-1 bg-gray-200 rounded">Clear Filters</button>
            </div>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? Array.from({length: perPage}).map((_,i)=>(<SkeletonCard key={i}/>)) : projects.length === 0 ? (
          <div className="col-span-full text-center py-16 text-gray-400">
            <p className="text-lg font-medium">No projects found</p>
          </div>
        ) : (
          projects.map(p=> {
            const relation = getProjectRelation(p, user)
            return (
            <div key={p?.id} className="bg-white p-4 rounded shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-lg font-semibold"><Link to={`/projects/${p?.id}`} className="hover:underline">{p?.title || p?.name}</Link></h3>
                {(relation.isOwner || relation.isMember) && (
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                    {relation.isOwner ? 'Owner' : 'Member'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">Owner: {p?.owner?.full_name || p?.owner?.username || 'Unknown'}</p>
              <p className="text-gray-600 text-sm mb-3">{p?.short_description || p?.description ? ((p?.short_description || p?.description).length>140? (p?.short_description || p?.description).slice(0,140)+'...': (p?.short_description || p?.description)) : 'No description'}</p>
              <div className="flex flex-wrap gap-2">
                {(p?.skills || p?.required_skills || p?.roles || []).slice(0,5).map((s,idx)=> (
                  <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{s.skill_name || s.role_name || s.name || s.title || String(s)}</span>
                ))}
              </div>
            </div>
          )})
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-3">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
        <div className="text-sm text-gray-600">Page {page} / {totalPages}</div>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} className="px-3 py-1 bg-gray-200 rounded">Next</button>
      </div>
    </div>
  )
}
