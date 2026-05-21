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
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold font-mono text-sm">{key}</h1>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
        >
          {editMode ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <div className="mt-1 p-3 bg-gray-50 rounded">
            {item.description || 'No description'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.type || 'unknown'}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Public</label>
            <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
              {item.is_public ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Current Value</label>
          {editMode ? (
            <textarea
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2 font-mono text-sm"
              rows={6}
            />
          ) : (
            <pre className="mt-1 p-3 bg-gray-50 rounded text-xs overflow-auto break-words">
              {item.value}
            </pre>
          )}
        </div>

        {editMode && (
          <div className="flex gap-2 pt-4 border-t">
            <button
              onClick={handleUpdate}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditMode(false)
                setFormValue(String(item.value || ''))
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded"
            >
              Discard
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Change History</h2>
          <div className="space-y-2 max-h-96 overflow-auto">
            {history.map((entry, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded text-sm">
                <div className="font-medium">
                  {entry.changed_by?.full_name || entry.changed_by?.name || entry.changed_by_id || 'Unknown'}
                </div>
                <div className="text-gray-600 text-xs">
                  {entry.changed_at ? new Date(entry.changed_at).toLocaleString() : 'Unknown time'}
                </div>
                {entry.old_value !== undefined && (
                  <div className="mt-2 font-mono text-xs">
                    <span className="text-red-600">- {entry.old_value}</span>
                    <br />
                    <span className="text-green-600">+ {entry.new_value}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <details className="pt-4 border-t">
        <summary className="cursor-pointer font-medium text-gray-700">Raw Data</summary>
        <pre className="mt-3 p-3 bg-gray-50 rounded text-xs overflow-auto">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </div>
  )
}
