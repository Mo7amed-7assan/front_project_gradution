import React, { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import EditProfileUI from '../ui/pages/EditProfileUI'
import { getMyProfile, updateMyProfile } from '../services/profile'

export default function EditProfile(){
  const [form, setForm] = useState({ full_name: '', bio: '', location: '', website_url: '', linkedin_url: '', github_url: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const res = await getMyProfile()
      const data = res?.data || res
      setForm({
        full_name: data?.full_name || '',
        bio: data?.bio || '',
        location: data?.location || '',
        website_url: data?.website_url || '',
        linkedin_url: data?.linkedin_url || '',
        github_url: data?.github_url || ''
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
      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          payload.append(key, value)
        }
      })
      await updateMyProfile(payload)
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
