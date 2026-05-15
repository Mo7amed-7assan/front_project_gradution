import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMatches, saveMatch, markMatchAsViewed, submitMatchFeedback } from '../services/match'
import Spinner from '../components/Spinner'

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

  return (
    <div
      onMouseEnter={() => onHover(match)}
      className={`relative bg-white rounded-xl border p-5 transition-all shadow-sm hover:shadow-md ${match.is_viewed || match.viewed ? 'border-gray-200' : 'border-indigo-300 ring-1 ring-indigo-100'}`}
    >
      {/* Score & Bookmark */}
      <div className="flex justify-between items-start mb-4">
        <div className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
          <span>⚡</span> {score}% Match
        </div>
        <button
          onClick={() => onSave(match)}
          className="text-gray-400 hover:text-indigo-600 transition-colors"
          title={isSaved ? "Unsave" : "Save"}
        >
          <svg className={`w-6 h-6 ${isSaved ? 'fill-indigo-600 text-indigo-600' : 'fill-none'}`} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {targetUser ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            <Link to={`/users/${targetUser.id}`} className="hover:text-indigo-600">{targetUser.full_name || targetUser.username}</Link>
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{targetUser.bio || 'No bio available'}</p>
        </div>
      ) : targetProject ? (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            <Link to={`/projects/${targetProject.id}`} className="hover:text-indigo-600">{targetProject.title || targetProject.name}</Link>
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">{targetProject.description || targetProject.summary || 'No description available'}</p>
        </div>
      ) : (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Unknown Match</h3>
        </div>
      )}

      {/* Shared Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <p className="text-xs text-gray-500 font-medium mb-2">Shared Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 4).map(skill => (
              <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-xs rounded">+{skills.length - 4}</span>
            )}
          </div>
        </div>
      )}

      {/* Feedback */}
      <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400 w-full mb-1">Rate this match:</span>
        <button
          onClick={() => handleFeedbackClick('relevant')}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors border ${activeFeedback === 'relevant' ? 'bg-green-500 text-white border-green-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          title="Relevant"
        >
          👍 Relevant
        </button>
        <button
          onClick={() => handleFeedbackClick('not_relevant')}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors border ${activeFeedback === 'not_relevant' ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          title="Not Relevant"
        >
          👎 Not Relevant
        </button>
        <button
          onClick={() => handleFeedbackClick('already_connected')}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors border ${activeFeedback === 'already_connected' ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          title="Already Connected"
        >
          🤝 Connected
        </button>
        <button
          onClick={() => handleFeedbackClick('not_interested')}
          className={`px-2 py-1 text-xs font-medium rounded transition-colors border ${activeFeedback === 'not_interested' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
          title="Not Interested"
        >
          🚫 Not Interested
        </button>
      </div>
    </div>
  )
}

export default function Matches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    setLoading(true)
    try {
      const data = await getMatches()
      const list = Array.isArray(data) ? data : (data?.data || [])
      setMatches(list)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  const handleHover = async (match) => {
    if (match.is_viewed || match.viewed) return
    try {
      await markMatchAsViewed(match.id)
      setMatches(prev => prev.map(m => m.id === match.id ? { ...m, is_viewed: true, viewed: true } : m))
    } catch (err) {
      console.error('Failed to mark as viewed', err)
    }
  }

  const handleSave = async (match) => {
    const isSaved = match.is_saved || match.saved
    try {
      await saveMatch(match.id, !isSaved)
      setMatches(prev => prev.map(m => m.id === match.id ? { ...m, is_saved: !isSaved, saved: !isSaved } : m))
    } catch (err) {
      console.error('Failed to save match', err)
    }
  }

  const handleFeedback = async (matchId, type) => {
    try {
      await submitMatchFeedback(matchId, type)
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, feedback: type } : m))
    } catch (err) {
      console.error('Failed to submit feedback', err)
      alert('Failed to submit feedback')
      throw err;
    }
  }

  if (loading) return <div className="p-8"><Spinner /></div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Smart Matches</h1>
        <p className="text-gray-500 mt-2">Discover projects and people tailored to your profile</p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-lg font-medium">No matches yet</p>
          <p className="text-sm mt-1">Complete your profile to get better matches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
