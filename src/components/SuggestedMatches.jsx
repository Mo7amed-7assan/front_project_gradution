import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMatches, markMatchAsViewed, saveMatch, submitMatchFeedback } from '../services/match'
import Spinner from './Spinner'

const FEEDBACK_TYPES = [
  { value: 'relevant', label: 'Relevant' },
  { value: 'not_relevant', label: 'Not relevant' },
  { value: 'already_connected', label: 'Already connected' },
  { value: 'not_interested', label: 'Not interested' },
]

const extractMatchList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data?.data?.data)) return value.data.data.data
  if (Array.isArray(value?.data?.data)) return value.data.data
  if (Array.isArray(value?.data?.matches)) return value.data.matches
  if (Array.isArray(value?.data)) return value.data
  if (Array.isArray(value?.matches)) return value.matches
  if (Array.isArray(value?.items)) return value.items
  return []
}

const getMatchScore = (match) => {
  const raw = match.match_score ?? match.score ?? 0
  return Math.round(Number(raw) * (Number(raw) <= 1 ? 100 : 1))
}

const hasFeedback = (match) =>
  !!(match.feedback || match.feedback_type || match.user_feedback || match.action_taken)

function SuggestedMatchCard({ match, kind, onViewed, onSave, onFeedback }) {
  const target = kind === 'project'
    ? match.project || match.matched_project || match.target_project
    : match.user || match.matched_user || match.target_user
  const [feedbackType, setFeedbackType] = useState(match.feedback_type || match.feedback || 'relevant')
  const [feedbackNote, setFeedbackNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const feedbackSent = hasFeedback(match)
  const score = getMatchScore(match)
  const skills = match.shared_skills || match.skills || []
  const isSaved = match.is_saved || match.saved

  const submitFeedback = async () => {
    if (feedbackSent) {
      alert('You already sent feedback for this match.')
      return
    }

    setSubmitting(true)
    try {
      await onFeedback(match.id, feedbackType, feedbackNote)
    } finally {
      setSubmitting(false)
    }
  }

  if (!target) return null

  if (kind === 'project') {
    return (
      <div
        onMouseEnter={() => onViewed(match)}
        className={`card bg-white p-0 overflow-hidden border ${match.is_viewed || match.viewed ? 'border-slate-200' : 'border-indigo-300 ring-1 ring-indigo-100'}`}
      >
        <div className="p-5">
          {/* Post Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                {target?.owner?.profile_picture_url || target?.owner?.avatar ? (
                  <img src={target.owner.profile_picture_url || target.owner.avatar} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-indigo-600 text-lg">{(target?.owner?.full_name || target?.owner?.username || 'U')[0]}</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {target?.owner?.full_name || target?.owner?.username || 'Unknown User'}
                </h3>
                <p className="text-xs text-slate-500">
                  {target?.created_at ? new Date(target.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'} • Suggested Project
                </p>
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

          {/* Post Content */}
          <div className="space-y-3">
            <h4 className="text-xl font-bold text-slate-900 leading-tight">
              <Link to={`/projects/${target?.id}`} className="hover:text-indigo-600 transition-colors">
                {target?.title || target?.name}
              </Link>
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {target?.description || target?.short_description || 'No description provided.'}
            </p>
          </div>

          {/* Tags */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.map((skill, idx) => (
                <span key={idx} className="badge-slate text-[11px] font-medium px-2.5 py-1 rounded-md">
                  {skill.skill_name || skill.name || String(skill)}
                </span>
              ))}
            </div>
          )}

          {/* Feedback */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {feedbackSent ? (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-lg p-2.5">
                Feedback sent: {match.feedback_type || match.feedback || 'submitted'}
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
                    {FEEDBACK_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={submitFeedback}
                    disabled={submitting}
                    className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap"
                  >
                    {submitting ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
          <div className="flex gap-3">
            <Link to={`/projects/${target?.id}?apply=true`} className="btn-primary text-xs px-4 py-2 shadow-sm font-bold flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              Apply
            </Link>
          </div>
          <Link to={`/projects/${target?.id}`} className="btn-secondary text-xs px-4 py-2 shadow-sm">
            View Details
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => onViewed(match)}
      className={`bg-white rounded-lg border p-4 shadow-sm ${match.is_viewed || match.viewed ? 'border-gray-200' : 'border-indigo-300 ring-1 ring-indigo-100'}`}
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
        <Link
          to={kind === 'project' ? `/projects/${target.id}` : `/users/${target.id}`}
          className="hover:text-indigo-600"
        >
          {target.title || target.name || target.full_name || target.username || 'Suggestion'}
        </Link>
      </h3>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
        {target.short_description || target.description || target.summary || target.bio || 'No description available.'}
      </p>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.slice(0, 5).map((skill, index) => (
            <span key={`${skill}-${index}`} className="text-xs bg-gray-100 px-2 py-1 rounded">
              {skill.skill_name || skill.name || String(skill)}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        {feedbackSent ? (
          <div className="text-sm text-green-700 bg-green-50 border border-green-100 rounded p-2">
            Feedback sent: {match.feedback_type || match.feedback || 'submitted'}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-500">Feedback</label>
            <select
              value={feedbackType}
              onChange={(e) => setFeedbackType(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              {FEEDBACK_TYPES.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <textarea
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              rows={2}
              placeholder="Write a note for yourself about this suggestion..."
            />
            <button
              type="button"
              onClick={submitFeedback}
              disabled={submitting}
              className="w-full px-3 py-2 bg-indigo-600 text-white rounded text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SuggestedMatches({ kind }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadMatches = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMatches()
      const list = extractMatchList(data)
      const filtered = list.filter((match) => {
        const project = match.project || match.matched_project || match.target_project
        const user = match.user || match.matched_user || match.target_user
        return kind === 'project' ? !!project : !!user
      })
      setMatches(filtered)
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load suggestions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMatches()
  }, [kind])

  const handleViewed = async (match) => {
    if (match.is_viewed || match.viewed) return
    try {
      await markMatchAsViewed(match.id)
      setMatches((prev) => prev.map((item) => item.id === match.id ? { ...item, is_viewed: true, viewed: true } : item))
    } catch (err) {
      console.error('Failed to mark match as viewed', err)
    }
  }

  const handleSave = async (match) => {
    const nextSaved = !(match.is_saved || match.saved)
    try {
      await saveMatch(match.id, nextSaved)
      setMatches((prev) => prev.map((item) => item.id === match.id ? { ...item, is_saved: nextSaved, saved: nextSaved } : item))
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save match')
    }
  }

  const handleFeedback = async (matchId, feedbackType, feedbackNote) => {
    try {
      await submitMatchFeedback(matchId, feedbackType)
      setMatches((prev) => prev.map((item) => item.id === matchId ? {
        ...item,
        feedback_type: feedbackType,
        feedback: feedbackType,
        feedback_note: feedbackNote,
        action_taken: true,
      } : item))
    } catch (err) {
      const message = err?.response?.status === 409
        ? 'You already sent feedback for this match.'
        : err?.response?.data?.message || 'Failed to submit feedback'
      alert(message)
    }
  }

  if (loading) return <div className="p-8"><Spinner /></div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div>
      {matches.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-100">
          <p className="text-lg font-medium">No suggestions yet</p>
          <p className="text-sm mt-1">Complete your profile to get better suggestions.</p>
        </div>
      ) : (
        <div className={kind === 'project' ? "max-w-2xl mx-auto space-y-8" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"}>
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
