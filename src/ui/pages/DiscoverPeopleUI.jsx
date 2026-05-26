import React from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'
import SuggestedMatches from '../../components/SuggestedMatches'

export default function DiscoverPeopleUI({
  activeTab,
  setActiveTab,
  query,
  setQuery,
  users,
  meta,
  loading,
  error,
  handleSearch,
  handleClear,
  handlePageChange,
  currentPage,
  lastPage,
  canGoBack,
  canGoForward
}) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-gradient-to-r from-brand-primaryDark to-brand-primary p-8 rounded-3xl text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-brand-accent opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            Discover People
          </h1>
          <p className="text-brand-primaryLight font-medium text-lg">
            Search the community and view public profiles.
          </p>
        </div>
      </div>

      <div className="card p-2 shadow-sm border-brand-primaryLight flex gap-2 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === 'search' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          Search Community
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('suggestions')}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === 'suggestions' ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          AI Suggestions
        </button>
      </div>

      {activeTab === 'suggestions' ? (
        <SuggestedMatches kind="user" />
      ) : (
      <div className="space-y-6">
        <div className="card p-6 shadow-sm border-brand-primaryLight">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, username, or skills..."
                className="form-input pl-11 py-3 bg-slate-50 w-full text-base focus:bg-white transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary shadow-brand-primary/30 py-3 px-8 flex-1 sm:flex-none">
                Search
              </button>
              {query && (
                <button type="button" onClick={handleClear} className="btn-secondary px-6 shrink-0 text-slate-600 hover:text-slate-900">
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
             <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : !error && users.length === 0 ? (
          <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">No users found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search terms or filters.</p>
          </div>
        ) : users.length > 0 ? (
          <>
            <div className="flex items-center justify-between px-2">
              <h2 className="text-lg font-bold text-slate-900">Search Results</h2>
              {meta && (
                <p className="text-sm font-bold text-slate-500">
                  {users.length} of {meta.total ?? users.length} users
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => {
                const initial = (user.full_name || user.username || 'U').charAt(0).toUpperCase()
                return (
                  <Link
                    key={user.id}
                    to={`/users/${user.id}`}
                    className="card p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-primary/5 hover:border-brand-primary/30 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primaryLight to-brand-primary text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-sm">
                          {initial}
                        </div>
                        {user.identity_verified && (
                          <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-full" title="Verified User">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-primary transition-colors truncate">
                        {user.full_name || user.username}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 truncate mb-4">@{user.username}</p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span className="truncate">{user.location || 'Unknown location'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span className="truncate font-medium">{user.role || 'No role listed'}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {lastPage > 1 && (
              <div className="mt-8 flex items-center justify-between p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!canGoBack || loading}
                  className="btn-ghost disabled:opacity-40"
                >
                  ← Previous
                </button>
                <span className="text-sm font-bold text-slate-500 bg-slate-50 px-4 py-1.5 rounded-xl">
                  Page {currentPage} of {lastPage}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!canGoForward || loading}
                  className="btn-ghost disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : null}
      </div>
      )}
    </div>
  )
}
