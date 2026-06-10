import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getSettingByKey, updateSetting, getSettingHistory } from '../services/adminSettings'
import { useAuth } from '../context/AuthContext'

export default function AdminSettingDetail() {
  const { key } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const [formValue, setFormValue] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getSettingByKey(key)
        setItem(data)
        setFormValue(String(data?.value || ''))

        const historyData = await getSettingHistory(key, { per_page: 20 })
        if (Array.isArray(historyData)) setHistory(historyData)
        else if (Array.isArray(historyData?.data)) setHistory(historyData.data)
      } catch (err) {
        console.error('Failed to load setting', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [key, user?.id])

  const handleUpdate = async () => {
    if (!confirm('Are you sure you want to update this setting?')) return
    setProcessing(true)
    try {
      const payload = { value: formValue }
      await updateSetting(key, payload)
      alert('Setting updated successfully')
      setEditMode(false)
      // Reload
      const data = await getSettingByKey(key)
      setItem(data)
      setFormValue(String(data?.value || ''))
    } catch (err) {
      console.error(err)
      alert(err?.response?.data?.message || 'Failed to update setting')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="min-h-[12rem] flex items-center justify-center"><Spinner /></div>

  if (!item) return <div className="p-6 text-red-600">Setting not found</div>

  return (
    <div className="max-w-4xl mx-auto card p-6 md:p-8 rounded-2xl">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
        <h1 className="text-2xl font-bold font-mono text-[var(--text-primary)]">{key}</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          className="btn-primary"
        >
          {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="form-label">Description</label>
          <div className="mt-1 p-3 bg-[var(--bg-hover)]/30 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)]">
            {item.description || 'No description'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Type</label>
            <div className="mt-1 p-3 bg-[var(--bg-hover)]/30 rounded-xl text-sm text-[var(--text-primary)] border border-[var(--border-color)]">
              {item.type || 'unknown'}
            </div>
          </div>
          <div>
            <label className="form-label">Public</label>
            <div className="mt-1 p-3 bg-[var(--bg-hover)]/30 rounded-xl text-sm text-[var(--text-primary)] border border-[var(--border-color)]">
              {item.is_public ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div>
          <label className="form-label">Current Value</label>
          {editMode ? (
            <textarea
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              className="form-input mt-1 block w-full font-mono text-sm"
              rows={6}
            />
          ) : (
            <pre className="mt-1 p-3 bg-[var(--bg-hover)]/30 rounded-xl text-xs overflow-auto break-words text-[var(--text-primary)] border border-[var(--border-color)]">
              {item.value}
            </pre>
          )}
        </div>

        {editMode && (
          <div className="flex gap-2 pt-4 border-t border-[var(--border-color)]">
            <button
              onClick={handleUpdate}
              disabled={processing}
              className="btn-success disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false)
                setFormValue(String(item.value || ''))
              }}
              className="btn-secondary"
            >
              Discard
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="border-t border-[var(--border-color)] pt-6">
          <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Change History</h2>
          <div className="space-y-2 max-h-96 overflow-auto">
            {history.map((entry, idx) => (
              <div key={idx} className="p-3 bg-[var(--bg-hover)]/30 border border-[var(--border-color)] rounded-xl text-sm">
                <div className="font-semibold text-[var(--text-primary)]">
                  {entry.changed_by?.full_name || entry.changed_by?.name || entry.changed_by_id || 'Unknown'}
                </div>
                <div className="text-[var(--text-secondary)] text-xs mt-0.5">
                  {entry.changed_at ? new Date(entry.changed_at).toLocaleString() : 'Unknown time'}
                </div>
                {entry.old_value !== undefined && (
                  <div className="mt-2 font-mono text-xs">
                    <span className="text-red-500">- {entry.old_value}</span>
                    <br />
                    <span className="text-green-500">+ {entry.new_value}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <details className="pt-4 border-t border-[var(--border-color)]">
        <summary className="cursor-pointer font-bold text-[var(--text-secondary)]">Raw Data</summary>
        <pre className="mt-3 p-3 bg-[var(--bg-hover)]/30 border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-primary)] overflow-auto">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </div>
  )
}
