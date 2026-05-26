import React from 'react'
import Spinner from '../../components/Spinner'

export default function EditProfileUI({
  form,
  loading,
  saving,
  error,
  handleChange,
  handleSubmit
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title text-brand-secondary">Edit Profile</h1>
          <p className="page-subtitle">Update your basic profile information.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-semibold flex items-center gap-2">
           <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           {error}
        </div>
      )}

      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">Bio</label>
            <textarea
              value={form.bio}
              onChange={handleChange('bio')}
              className="form-input"
              rows={4}
              placeholder="Tell us a little about yourself..."
            />
            <p className="text-xs text-slate-400 mt-1.5 font-medium">Brief description for your profile.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">Location</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <input
                  value={form.location}
                  onChange={handleChange('location')}
                  className="form-input pl-10"
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Website URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </div>
                <input
                  value={form.website_url}
                  onChange={handleChange('website_url')}
                  className="form-input pl-10"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary shadow-brand-primary/30 px-8"
            >
              {saving ? <Spinner /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
