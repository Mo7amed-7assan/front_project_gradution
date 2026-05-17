import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchUsers } from '../services/profile'
import Spinner from '../components/Spinner'
import SuggestedMatches from '../components/SuggestedMatches'

export default function DiscoverPeople() {
  const [activeTab, setActiveTab] = useState('search')
  const [query, setQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadUsers = async (search = '', page = 1) => {
    setError(null)
    setLoading(true)
    try {
      const params = {
        per_page: '20',
        page: `${page}`,
        sort_by: 'full_name',
        sort_dir: 'asc'
      }
      if (search.trim()) params.search = search.trim()

      const res = await searchUsers(params)
      const data = Array.isArray(res?.data) ? res.data : []
      setUsers(data)
      setMeta(res?.meta || null)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    setActiveSearch(query.trim())
    loadUsers(query, 1)
  }

  const handleClear = () => {
    setQuery('')
    setActiveSearch('')
    loadUsers()
  }

  const handlePageChange = (page) => {
    loadUsers(activeSearch, page)
  }

  const currentPage = meta?.current_page || 1
  const lastPage = meta?.last_page || 1
  const canGoBack = currentPage > 1
  const canGoForward = currentPage < lastPage

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Discover People</h1>
          <p className="text-gray-600">Search the community and view public profiles.</p>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 rounded text-sm font-semibold ${activeTab === 'search' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Search People
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded text-sm font-semibold ${activeTab === 'suggestions' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          Suggested Users
        </button>
      </div>
      {activeTab === 'suggestions' ? (
        <SuggestedMatches kind="user" />
      ) : (
      <>
      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, username, or skill"
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
        {query && (
          <button type="button" onClick={handleClear} className="bg-gray-100 text-gray-700 px-4 py-2 rounded">Clear</button>
        )}
      </form>
      {loading && <Spinner />}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading && !error && users.length === 0 && (
        <div className="text-gray-500">No users found yet. Try a different search.</div>
      )}
      {!loading && users.length > 0 && (
        <>
          {meta && (
            <p className="text-sm text-gray-500 mb-3">
              Showing {users.length} of {meta.total ?? users.length} users
            </p>
          )}
          <div className="space-y-3">
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/users/${user.id}`}
                className="block border rounded p-4 hover:border-blue-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{user.full_name || user.username}</h2>
                    <p className="text-sm text-gray-500">{user.username}</p>
                  </div>
                  <span className="text-sm text-gray-400">View profile</span>
                </div>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>{user.location || 'No location'}</div>
                  <div>{user.role || 'No role listed'}</div>
                  <div>{user.identity_verified ? 'Verified' : 'Not verified'}</div>
                </div>
              </Link>
            ))}
          </div>
          {lastPage > 1 && (
            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!canGoBack || loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {lastPage}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!canGoForward || loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
      </>
      )}
    </div>
  )
}
