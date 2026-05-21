import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getVerificationById, claimVerification, escalateVerification, reviewVerification } from '../services/adminVerification'
import { useAuth } from '../context/AuthContext'

export default function AdminVerificationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [decision, setDecision] = useState('approve')
  const [notes, setNotes] = useState('')

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await getVerificationById(id)
      setData(res)
    } catch (err) {
      console.error(err)
      alert('Failed to load verification')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [id, user?.id])

  const handleClaim = async () => {
    setProcessing(true)
    try {
      await claimVerification(id)
      alert('Verification claimed')
      await fetch()
    } catch (err) {
      console.error(err)
      alert('Failed to claim')
    } finally {
      setProcessing(false)
    }
  }

  const handleEscalate = async () => {
    if (!confirm('Escalate this verification to admin review?')) return
    setProcessing(true)
    try {
      await escalateVerification(id)
      alert('Verification escalated')
      await fetch()
    } catch (err) {
      console.error(err)
      alert('Failed to escalate')
    } finally {
      setProcessing(false)
    }
  }

  const handleReview = async () => {
    if (!decision) return alert('Select a decision')
    setProcessing(true)
    try {
      const payload = { decision, notes }
      await reviewVerification(id, payload)
      alert('Review submitted')
      navigate('/admin/verifications')
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to submit review')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>
  if (!data) return <div className="p-6">Verification not found.</div>

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Verification — {data.id}</h1>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <div className="font-medium">User</div>
          <div className="text-sm text-gray-700">{data.user?.full_name || data.user?.name || data.user_id}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium">Status</div>
          <div className="text-sm text-gray-700">{data.status || data.verification_status}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium">Submitted At</div>
          <div className="text-sm text-gray-700">{data.created_at || data.submitted_at}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium mb-2">Documents / Data</div>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{JSON.stringify(data.documents || data.liveness_check_data || data.payload || data, null, 2)}</pre>
        </div>

        <div className="flex gap-2">
          <button onClick={handleClaim} disabled={processing} className="px-3 py-2 bg-blue-600 text-white rounded">Claim</button>
          <button onClick={handleEscalate} disabled={processing} className="px-3 py-2 bg-yellow-600 text-white rounded">Escalate</button>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium mb-2">Submit Review</div>
          <div className="space-y-2">
            <select value={decision} onChange={(e) => setDecision(e.target.value)} className="block w-full border rounded px-3 py-2">
              <option value="approve">Approve</option>
              <option value="reject">Reject</option>
              <option value="request_more_info">Request more info</option>
            </select>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="block w-full border rounded px-3 py-2" rows={4} placeholder="Optional notes for the review" />
            <div className="flex gap-2">
              <button onClick={handleReview} disabled={processing} className="px-3 py-2 bg-green-600 text-white rounded">Submit Review</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
