import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchUsers } from '../services/profile'
import Spinner from '../components/Spinner'
import SuggestedMatches from '../components/SuggestedMatches'
import DiscoverPeopleUI from '../ui/pages/DiscoverPeopleUI'

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
    <DiscoverPeopleUI
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      query={query}
      setQuery={setQuery}
      users={users}
      meta={meta}
      loading={loading}
      error={error}
      handleSearch={handleSearch}
      handleClear={handleClear}
      handlePageChange={handlePageChange}
      currentPage={currentPage}
      lastPage={lastPage}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
    />
  )
}
