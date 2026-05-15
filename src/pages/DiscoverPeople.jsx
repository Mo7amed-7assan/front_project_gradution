import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { searchUsers } from '../services/profile'
import Spinner from '../components/Spinner'

export default function DiscoverPeople() {
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await searchUsers({ search: query, per_page: 20 })
      const data = Array.isArray(res?.data) ? res.data : res?.data?.data || []
      setUsers(data)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Discover People</h1>
          <p className="text-gray-600">Search the community and view public profiles.</p>
        </div>
      </div>
      <form onSubmit={handleSearch} className="flex gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, username, or skill"
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </form>
      {loading && <Spinner />}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {!loading && !error && users.length === 0 && (
        <div className="text-gray-500">No users found yet. Try a different search.</div>
      )}
      {!loading && users.length > 0 && (
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
                <div>{user.email || ''}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
