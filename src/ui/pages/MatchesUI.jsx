import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Spinner from '../../components/Spinner'

function MatchCard({ match, onHover, onSave, onFeedback }) {
  const [activeFeedback, setActiveFeedback] = useState(match.feedback || null)
  const targetUser = match.user || match.matched_user
  const targetProject = match.project || match.matched_project
  const score = match.match_score ? Math.round(match.match_score * (match.match_score <= 1 ? 100 : 1)) : 0
  const skills = match.shared_skills || []
  const isSaved = match.is_saved || match.saved

  const handleFeedbackClick = async (type) => {
    try {
      await onFeedback(match.id, type)
      setActiveFeedback(type)
    } catch (err) {
      // Error handled by parent
    }
  }

  const initial = targetUser 
    ? (targetUser.full_name || targetUser.username || 'U').charAt(0).toUpperCase()
    : targetProject 
      ? (targetProject.title || targetProject.name || 'P').charAt(0).toUpperCase()
      : '?'

  return (
    <div
      onMouseEnter={() => onHover(match)}
      className={`card p-0 flex flex-col group transition-all duration-300 overflow-hidden ${
        match.is_viewed || match.viewed 
          ? 'border-[var(--border-color)] hover:border-slate-300' 
          : 'border-brand-primary/40 shadow-md shadow-brand-primary/10 hover:border-brand-primary hover:shadow-brand-primary/20 ring-1 ring-brand-primary/10'
      }`}
    >
      <div className="p-6 flex-1 flex flex-col">
        {/* Header: Score & Bookmark */}
        <div className="flex justify-between items-start mb-5">
          <div className="bg-gradient-to-r from-brand-primary to-brand-primaryDark text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <svg className="w-3.5 h-3.5 text-brand-secondary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            {score}% Match
          </div>
          <button
            onClick={() => onSave(match)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isSaved 
                ? 'bg-brand-primaryLight/30 text-brand-primary hover:bg-brand-primaryLight/50' 
                : 'bg-[var(--bg-hover)] text-[var(--text-hint)] hover:bg-slate-100 hover:text-brand-primary'
            }`}
            title={isSaved ? "Unsave" : "Save"}
          >
            <svg className={`w-4 h-4 ${isSaved ? 'fill-current' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex gap-4 mb-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-sm ${targetUser ? 'bg-gradient-to-br from-indigo-400 to-indigo-600' : 'bg-gradient-to-br from-brand-primary to-brand-primaryDark'}`}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            {targetUser ? (
              <>
                <h3 className="text-lg font-bold text-[var(--text-primary)] truncate leading-tight group-hover:text-brand-primary transition-colors">
                  <Link to={`/users/${targetUser.id}`} className="hover:underline">{targetUser.full_name || targetUser.username}</Link>
                </h3>
                <p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">User Profile</p>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{targetUser.bio || 'No bio available'}</p>
              </>
            ) : targetProject ? (
              <>
                <h3 className="text-lg font-bold text-[var(--text-primary)] truncate leading-tight group-hover:text-brand-primary transition-colors">
                  <Link to={`/projects/${targetProject.id}`} className="hover:underline">{targetProject.title || targetProject.name}</Link>
                </h3>
                <p className="text-xs font-medium text-brand-secondary uppercase tracking-wider mb-1">Project</p>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{targetProject.description || targetProject.summary || 'No description available'}</p>
              </>
            ) : (
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Unknown Match</h3>
            )}
          </div>
        </div>

        {/* Shared Skills */}
        {skills.length > 0 && (
          <div className="mt-auto">
            <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-2">Shared Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 3).map(skill => (
                <span key={skill} className="px-2 py-1 bg-brand-primaryLight/20 text-brand-primaryDark text-[10px] font-bold uppercase tracking-wider rounded-md border border-brand-primaryLight/50">
                  {skill}
                </span>
              ))}
              {skills.length > 3 && (
                <span className="px-2 py-1 bg-[var(--bg-hover)] text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-wider rounded-md border border-[var(--border-color)]">
                  +{skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Feedback Footer */}
      <div className="bg-[var(--bg-hover)] px-6 py-4 border-t border-[var(--border-color)]">
        <p className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-2 text-center">Rate this match</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleFeedbackClick('relevant')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold rounded-xl transition-colors border ${activeFeedback === 'relevant' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50'}`}
          >
            👍 <span className="truncate">Relevant</span>
          </button>
          <button
            onClick={() => handleFeedbackClick('not_relevant')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold rounded-xl transition-colors border ${activeFeedback === 'not_relevant' ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/20' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50'}`}
          >
            👎 <span className="truncate">Irrelevant</span>
          </button>
          <button
            onClick={() => handleFeedbackClick('already_connected')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold rounded-xl transition-colors border ${activeFeedback === 'already_connected' ? 'bg-blue-500 text-white border-blue-500 shadow-sm shadow-blue-500/20' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'}`}
          >
            🤝 <span className="truncate">Connected</span>
          </button>
          <button
            onClick={() => handleFeedbackClick('not_interested')}
            className={`flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold rounded-xl transition-colors border ${activeFeedback === 'not_interested' ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50'}`}
          >
            🚫 <span className="truncate">Ignore</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MatchesUI({
  matches,
  loading,
  error,
  handleHover,
  handleSave,
  handleFeedback
}) {
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner />
    </div>
  )

  if (error) return (
    <div className="max-w-6xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
       <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
       {error}
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 bg-gradient-to-r from-brand-primaryDark to-brand-primary p-8 rounded-3xl text-white shadow-xl shadow-brand-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-[var(--bg-surface)] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-brand-accent opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            <span className="text-4xl">⚡</span> Smart Matches
          </h1>
          <p className="text-brand-primaryLight font-medium text-lg">
            Discover projects and people tailored specifically to your skills and profile.
          </p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="card text-center py-20 px-4 border-2 border-dashed border-[var(--border-color)] mt-6">
          <div className="w-24 h-24 bg-[var(--bg-surface)] shadow-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--border-color)]">
             <span className="text-5xl">🎯</span>
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No matches yet</h3>
          <p className="text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">Complete your profile with more skills and details to get better matches.</p>
          <Link to="/profile" className="btn-primary shadow-brand-primary/30 px-8 py-3">
            Update Profile
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {matches.map(match => (
            <MatchCard
              key={match.id}
              match={match}
              onHover={handleHover}
              onSave={handleSave}
              onFeedback={handleFeedback}
            />
          ))}
        </div>
      )}
    </div>
  )
}
