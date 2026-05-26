import React, { useEffect, useState } from 'react'
import api from '../services/api'
import Spinner from '../components/Spinner'
import EditProfileUI from '../ui/pages/EditProfileUI'

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

  return (
    <EditProfileUI
      form={form}
      loading={loading}
      saving={saving}
      error={error}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
    />
  )
}
