import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getMatches, markMatchAsViewed, saveMatch, submitMatchFeedback } from '../services/match'
import Spinner from './Spinner'

const FEEDBACK_TYPES = [
  { value: 'relevant',          label: 'Relevant' },
  { value: 'not_relevant',      label: 'Not relevant' },
  { value: 'already_connected', label: 'Already connected' },
  { value: 'not_interested',    label: 'Not interested' },
]

const hasFeedback = (match) =>
  !!(match.feedback || match.feedback_type || match.action_taken)

const getScore = (match) =>
  match.compatibility_score != null ? Math.round(match.compatibility_score * 100) : 0

function SuggestedMatchCard({ match, kind, onViewed, onSave, onFeedback }) {
  const target = kind === 'project'
    ? match.matched_project
    : match.matched_user

  const [feedbackType, setFeedbackType] = useState(
    match.feedback_type || match.feedback || 'relevant'
  )
  const [submitting, setSubmitting] = useState(false)
  const feedbackSent = hasFeedback(match)
  const score        = getScore(match)
  const skills       = match.match_reasons?.shared_skills || []
  const isSaved      = Boolean(match.saved)

  const submitFeedback = async () => {
    if (feedbackSent) return
    setSubmitting(true)
    try {
      await onFeedback(match.id, feedbackType)
    } finally {
      setSubmitting(false)
    }
  }

  if (!target) return null

  if (kind === 'project') {
    return (
      <div
        onMouseEnter={() => onViewed(match)}
        className={`card bg-white p-0 overflow-hidden border ${match.viewed ? 'border-slate-200' : 'border-indigo-300 ring-1 ring-indigo-100'}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                <span className="font-bold text-indigo-600 text-lg">
                  {(target.title || 'P')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {target.title || 'Untitled Project'}
                </h3>
                <p className="text-xs text-slate-500">Suggested Project</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {score}% Match
              </span>
              <button
                type="button"
                onClick={() => onSave(match)}
                className={`text-xs font-bold ${isSaved ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-bold text-slate-900 leading-tight">
              <Link to={`/projects/${target.id}`} className="hover:text-indigo-600 transition-colors">
                {target.title}
              </Link>
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {target.short_description || 'No description provided.'}
            </p>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.map((skill, idx) => (
                <span key={idx} className="badge-slate text-[11px] font-medium px-2.5 py-1 rounded-md">
                  {typeof skill === 'object' ? skill.skill_name || skill.name : skill}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100">
            {feedbackSent ? (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg p-2.5">
                Feedback sent: {match.feedback_type || match.feedback}
              </div>
            ) : (
              <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Improve Suggestions</label>
                <div className="flex gap-2">
                  <select
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                    className="form-select text-xs py-1.5 flex-1"
                  >
                    {FEEDBACK_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={submitFeedback}
                    disabled={submitting}
                    className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap"
                  >
                    {submitting ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
          <Link to={`/projects/${target.id}?apply=true`} className="btn-primary text-xs px-4 py-2 shadow-sm font-bold">
            Apply
          </Link>
          <Link to={`/projects/${target.id}`} className="btn-secondary text-xs px-4 py-2 shadow-sm">
            View Details
          </Link>
        </div>
      </div>
    )
  }

  // collaborator card
  return (
    <div
      onMouseEnter={() => onViewed(match)}
      className={`bg-white rounded-lg border p-4 shadow-sm ${match.viewed ? 'border-gray-200' : 'border-indigo-300 ring-1 ring-indigo-100'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
          {score}% Match
        </span>
        <button
          type="button"
          onClick={() => onSave(match)}
          className={`text-sm font-semibold ${isSaved ? 'text-indigo-700' : 'text-gray-500 hover:text-indigo-700'}`}
        >
          {isSaved ? 'Saved' : 'Save'}
        </button>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        <Link to={`/users/${target.id}`} className="hover:text-indigo-600">
          {target.full_name || target.username || 'Unknown User'}
        </Link>
      </h3>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        {target.bio || 'No bio available.'}
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100">
        {feedbackSent ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded p-2">
            Feedback sent: {match.feedback_type || match.feedback}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500">Feedback</label>
            <div className="flex gap-2">
              <select
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                {FEEDBACK_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={submitFeedback}
                disabled={submitting}
                className="px-3 py-2 bg-indigo-600 text-white rounded text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
              >
                {submitting ? '…' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SuggestedMatches({ kind }) {
  const [matches,  setMatches]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const loadMatches = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { items } = await getMatches({ match_type: kind })
      setMatches(items)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load suggestions.')
    } finally {
      setLoading(false)
    }
  }, [kind])

  useEffect(() => { loadMatches() }, [loadMatches])

  const handleViewed = useCallback(async (match) => {
    if (match.viewed) return
    try {
      await markMatchAsViewed(match.id)
      setMatches((prev) => prev.map((m) =>
        m.id === match.id ? { ...m, viewed: true } : m
      ))
    } catch { /* non-critical */ }
  }, [])

  const handleSave = useCallback(async (match) => {
    const nextSaved = !match.saved
    // Optimistic update
    setMatches((prev) => prev.map((m) =>
      m.id === match.id ? { ...m, saved: nextSaved } : m
    ))
    try {
      await saveMatch(match.id, nextSaved)
    } catch (err) {
      // Revert
      setMatches((prev) => prev.map((m) =>
        m.id === match.id ? { ...m, saved: match.saved } : m
      ))
      console.error('Failed to save match', err)
    }
  }, [])

  const handleFeedback = useCallback(async (matchId, feedbackType) => {
    try {
      await submitMatchFeedback(matchId, feedbackType)
      setMatches((prev) => prev.map((m) =>
        m.id === matchId ? { ...m, feedback_type: feedbackType, feedback: feedbackType, action_taken: true } : m
      ))
    } catch (err) {
      const msg = err?.response?.status === 409
        ? 'You already sent feedback for this match.'
        : err?.response?.data?.message || 'Failed to submit feedback.'
      alert(msg)
    }
  }, [])

  if (loading) return <div className="p-8"><Spinner /></div>
  if (error)   return <div className="p-4 text-red-600">{error}</div>

  return (
    <div>
      {matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <p className="text-lg font-medium">No suggestions yet</p>
          <p className="text-sm mt-1">Complete your profile to get better suggestions.</p>
        </div>
      ) : (
        <div className={kind === 'project' ? 'max-w-2xl mx-auto space-y-8' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'}>
          {matches.map((match) => (
            <SuggestedMatchCard
              key={match.id}
              match={match}
              kind={kind}
              onViewed={handleViewed}
              onSave={handleSave}
              onFeedback={handleFeedback}
            />
          ))}
        </div>
      )}
    </div>
  )
}
