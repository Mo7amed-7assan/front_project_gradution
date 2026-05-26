import React, { useState, useEffect } from 'react'
import { getMatches, saveMatch, markMatchAsViewed, submitMatchFeedback } from '../services/match'
import MatchesUI from '../ui/pages/MatchesUI'

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
      throw err
    }
  }

  return (
    <MatchesUI
      matches={matches}
      loading={loading}
      error={error}
      handleHover={handleHover}
      handleSave={handleSave}
      handleFeedback={handleFeedback}
    />
  )
}
