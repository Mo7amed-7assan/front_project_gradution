import React, { useEffect, useState } from 'react'
import api from '../services/api'
import Spinner from '../components/Spinner'

export default function EditProfile(){
  const [form, setForm] = useState({ bio: '', location: '', website_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await api.get('/profile')
      const data = res?.data?.data || res?.data
      setForm({
        bio: data?.bio || '',
        location: data?.location || '',
        website_url: data?.website_url || ''
      })
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ fetchProfile() }, [])

  const handleChange = (k) => (e) => setForm(f=>({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.put('/profile', form)
      window.location.href = '/profile'
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Edit Profile</h2>
      {error && <div className="text-red-600 mb-3">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea value={form.bio} onChange={handleChange('bio')} className="mt-1 block w-full border rounded px-3 py-2" rows={4} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input value={form.location} onChange={handleChange('location')} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Website URL</label>
          <input value={form.website_url} onChange={handleChange('website_url')} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
            {saving ? <Spinner/> : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
