import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getReportById, updateReport } from '../services/adminReports'
import { useAuth } from '../context/AuthContext'

export default function AdminReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [status, setStatus] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await getReportById(id)
      setData(res)
      setStatus(res.status || '')
      setAssignedTo(res.assigned_to_id || res.assigned_to?.id || '')
      setInternalNotes(res.internal_notes || '')
    } catch (err) {
      console.error(err)
      alert('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch()
  }, [id, user?.id])

  const handleUpdate = async () => {
    setProcessing(true)
    try {
      const payload = {
        status: status || undefined,
        assigned_to_id: assignedTo || undefined,
        internal_notes: internalNotes || undefined,
      }
      await updateReport(id, payload)
      alert('Report updated')
      await fetch()
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to update report')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>
  if (!data) return <div className="p-6">Report not found.</div>

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{data.title || data.subject || 'Report'}</h1>
        <button onClick={() => navigate('/admin/reports')} className="px-3 py-2 bg-gray-600 text-white rounded">Back</button>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <div className="font-medium">Status</div>
          <div className="text-sm text-gray-700">{data.status || 'unknown'}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium">Reported By</div>
          <div className="text-sm text-gray-700">{data.reporter?.full_name || data.reporter?.name || data.reporter_id}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium">Reported User</div>
          <div className="text-sm text-gray-700">{data.reported_user?.full_name || data.reported_user?.name || data.target_id}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium">Report Type</div>
          <div className="text-sm text-gray-700">{data.report_type || data.reason || 'unknown'}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium mb-2">Description</div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{data.description || data.content || 'No description'}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="font-medium mb-2">Submitted At</div>
          <div className="text-sm text-gray-700">{data.created_at || data.submitted_at}</div>
        </div>

        <div className="p-4 border rounded space-y-3">
          <div className="font-medium">Update Report</div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2">
              <option value="">-- Select status --</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned To (User ID)</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              placeholder="Leave empty if not assigned"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Internal Notes</label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Internal notes visible only to admins"
            />
          </div>

          <button onClick={handleUpdate} disabled={processing} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">
            {processing ? 'Updating...' : 'Update Report'}
          </button>
        </div>
      </div>
    </div>
  )
}
