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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
