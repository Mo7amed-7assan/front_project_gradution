import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  getMySkills,
  addMySkill,
  updateMySkill,
  deleteMySkill,
  getMyPortfolio,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem
} from '../services/profile'
import Spinner from '../components/Spinner'

const extractArray = (response) => {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  return []
}

export default function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('about')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  const [skills, setSkills] = useState([])
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [skillsError, setSkillsError] = useState(null)
  const [portfolio, setPortfolio] = useState([])
  const [portfolioLoading, setPortfolioLoading] = useState(true)
  const [portfolioError, setPortfolioError] = useState(null)

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    website_url: '',
    github_url: '',
    linkedin_url: ''
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(null)
  const [profileSavingError, setProfileSavingError] = useState(null)

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(null)
  const [passwordError, setPasswordError] = useState(null)

  const [skillModalOpen, setSkillModalOpen] = useState(false)
  const [skillForm, setSkillForm] = useState({
    skill_name: '',
    proficiency_level: 3,
    years_experience: ''
  })
  const [editingSkill, setEditingSkill] = useState(null)
  const [skillSaving, setSkillSaving] = useState(false)
  const [skillMessage, setSkillMessage] = useState(null)
  const [skillError, setSkillError] = useState(null)

  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    external_url: '',
    item_type: 'link',
    visibility: 'public',
    skills: ''
  })
  const [editingPortfolio, setEditingPortfolio] = useState(null)
  const [portfolioSaving, setPortfolioSaving] = useState(false)
  const [portfolioMessage, setPortfolioMessage] = useState(null)
  const [portfolioActionError, setPortfolioActionError] = useState(null)

  const fetchProfile = async () => {
    setProfileLoading(true)
    setProfileError(null)
    try {
      const res = await getMyProfile()
      const data = res?.data || res
      setProfile(data)
      setProfileForm({
        full_name: data?.full_name || '',
        bio: data?.bio || '',
        location: data?.location || '',
        website_url: data?.website_url || '',
        github_url: data?.github_url || '',
        linkedin_url: data?.linkedin_url || ''
      })
    } catch (err) {
      setProfileError(err?.response?.data?.message || err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const fetchSkills = async () => {
    setSkillsLoading(true)
    setSkillsError(null)
    try {
      const res = await getMySkills()
      setSkills(extractArray(res))
    } catch (err) {
      setSkillsError(err?.response?.data?.message || err.message)
    } finally {
      setSkillsLoading(false)
    }
  }

  const fetchPortfolio = async () => {
    setPortfolioLoading(true)
    setPortfolioError(null)
    try {
      const res = await getMyPortfolio()
      setPortfolio(extractArray(res))
    } catch (err) {
      setPortfolioError(err?.response?.data?.message || err.message)
    } finally {
      setPortfolioLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
    fetchSkills()
    fetchPortfolio()
  }, [])

  const handleProfileChange = (key) => (e) => {
    setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileSuccess(null)
    setProfileSavingError(null)
    try {
      await updateMyProfile(profileForm)
      setProfileSuccess('Profile updated successfully.')
      fetchProfile()
    } catch (err) {
      setProfileSavingError(err?.response?.data?.message || err.message)
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordLoading(true)
    setPasswordSuccess(null)
    setPasswordError(null)
    try {
      await changePassword(passwordForm.current_password, passwordForm.password, passwordForm.password_confirmation)
      setPasswordSuccess('Password changed successfully.')
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      setPasswordError(err?.response?.data?.message || err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleSkillModalOpen = (skill = null) => {
    setEditingSkill(skill)
    if (skill) {
      setSkillForm({
        skill_name: skill.skill_name,
        proficiency_level: skill.proficiency_level || 3,
        years_experience: skill.years_experience || ''
      })
    } else {
      setSkillForm({ skill_name: '', proficiency_level: 3, years_experience: '' })
    }
    setSkillError(null)
    setSkillMessage(null)
    setSkillModalOpen(true)
  }

  const handleSkillChange = (key) => (e) => {
    setSkillForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSaveSkill = async (e) => {
    e.preventDefault()
    setSkillSaving(true)
    setSkillError(null)
    try {
      const payload = {
        skill_name: skillForm.skill_name,
        proficiency_level: Number(skillForm.proficiency_level),
        years_experience: skillForm.years_experience ? Number(skillForm.years_experience) : undefined
      }
      if (editingSkill) {
        await updateMySkill(editingSkill.id, payload)
        setSkillMessage('Skill updated successfully.')
      } else {
        await addMySkill(payload)
        setSkillMessage('Skill added successfully.')
      }
      setSkillModalOpen(false)
      fetchSkills()
    } catch (err) {
      setSkillError(err?.response?.data?.message || err.message)
    } finally {
      setSkillSaving(false)
    }
  }

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Remove this skill?')) return
    setSkillSaving(true)
    try {
      await deleteMySkill(skillId)
      setSkillMessage('Skill removed successfully.')
      fetchSkills()
    } catch (err) {
      setSkillError(err?.response?.data?.message || err.message)
    } finally {
      setSkillSaving(false)
    }
  }

  const handlePortfolioModalOpen = (item = null) => {
    setEditingPortfolio(item)
    if (item) {
      setPortfolioForm({
        title: item.title || '',
        description: item.description || '',
        external_url: item.external_url || '',
        item_type: item.item_type || 'link',
        visibility: item.visibility || 'public',
        skills: Array.isArray(item.skills) ? item.skills.join(', ') : ''
      })
    } else {
      setPortfolioForm({ title: '', description: '', external_url: '', item_type: 'link', visibility: 'public', skills: '' })
    }
    setPortfolioActionError(null)
    setPortfolioMessage(null)
    setPortfolioModalOpen(true)
  }

  const handlePortfolioChange = (key) => (e) => {
    setPortfolioForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSavePortfolio = async (e) => {
    e.preventDefault()
    setPortfolioSaving(true)
    setPortfolioActionError(null)
    try {
      const payload = {
        title: portfolioForm.title,
        description: portfolioForm.description || null,
        external_url: portfolioForm.external_url || null,
        item_type: portfolioForm.item_type,
        visibility: portfolioForm.visibility,
        skills: portfolioForm.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean)
      }
      if (editingPortfolio) {
        await updatePortfolioItem(editingPortfolio.id, payload)
        setPortfolioMessage('Portfolio item updated successfully.')
      } else {
        await addPortfolioItem(payload)
        setPortfolioMessage('Portfolio item added successfully.')
      }
      setPortfolioModalOpen(false)
      fetchPortfolio()
    } catch (err) {
      setPortfolioActionError(err?.response?.data?.message || err.message)
    } finally {
      setPortfolioSaving(false)
    }
  }

  const handleDeletePortfolio = async (itemId) => {
    if (!window.confirm('Delete this portfolio item?')) return
    setPortfolioSaving(true)
    try {
      await deletePortfolioItem(itemId)
      setPortfolioMessage('Portfolio item deleted successfully.')
      fetchPortfolio()
    } catch (err) {
      setPortfolioActionError(err?.response?.data?.message || err.message)
    } finally {
      setPortfolioSaving(false)
    }
  }

  if (profileLoading) return <div className="p-8"><Spinner /></div>
  if (profileError) return <div className="p-8 text-red-600">{profileError}</div>
  if (!profile) return <div className="p-8">Profile not found.</div>

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold">My Profile</h1>
          <p className="text-gray-600">Manage your public profile, skills, portfolio, and account security.</p>
        </div>
        <div className="text-sm text-gray-500">Logged in as {user?.username || user?.email}</div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {['about', 'skills', 'portfolio', 'settings'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {tab === 'about' ? 'About' : tab === 'skills' ? 'Skills' : tab === 'portfolio' ? 'Portfolio' : 'Settings'}
          </button>
        ))}
      </div>

      {activeTab === 'about' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">About</h2>
                <p className="text-gray-700 mt-2">{profile.bio || 'No bio available.'}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Location</h3>
                <p className="mt-2 text-gray-700">{profile.location || 'Not provided'}</p>
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Website</h3>
                  {profile.website_url ? <a href={profile.website_url} className="text-blue-600 hover:underline">{profile.website_url}</a> : <p className="text-gray-700">Not provided</p>}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">GitHub</h3>
                  {profile.github_url ? <a href={profile.github_url} className="text-blue-600 hover:underline">{profile.github_url}</a> : <p className="text-gray-700">Not provided</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">LinkedIn</h3>
                  {profile.linkedin_url ? <a href={profile.linkedin_url} className="text-blue-600 hover:underline">{profile.linkedin_url}</a> : <p className="text-gray-700">Not provided</p>}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email</h3>
                  <p className="text-gray-700">{profile.email || 'Not available'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'skills' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Skills</h2>
              <p className="text-gray-600">Manage your skills and experience levels.</p>
            </div>
            <button onClick={() => handleSkillModalOpen()} className="bg-blue-600 text-white px-4 py-2 rounded">Add Skill</button>
          </div>
          {skillsLoading && <Spinner />}
          {skillsError && <div className="text-red-600 mb-4">{skillsError}</div>}
          {!skillsLoading && skills.length === 0 && <div className="text-gray-500">No skills added yet.</div>}
          {!skillsLoading && skills.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <div key={skill.id} className="bg-gray-50 border border-gray-200 rounded-full px-4 py-2 flex items-center gap-3">
                  <div>
                    <div className="font-medium">{skill.skill_name}</div>
                    <div className="text-xs text-gray-500">Level {skill.proficiency_level} · {skill.years_experience ?? 0} yrs · {skill.endorsements_count ?? 0} endorsements</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleSkillModalOpen(skill)} className="text-blue-600 text-sm hover:underline">Edit</button>
                    <button onClick={() => handleDeleteSkill(skill.id)} className="text-red-600 text-sm hover:underline">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {skillMessage && <div className="mt-4 text-green-600">{skillMessage}</div>}
          {skillError && <div className="mt-4 text-red-600">{skillError}</div>}
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Portfolio</h2>
              <p className="text-gray-600">Share your work and highlight public portfolio items.</p>
            </div>
            <button onClick={() => handlePortfolioModalOpen()} className="bg-blue-600 text-white px-4 py-2 rounded">Add Item</button>
          </div>
          {portfolioLoading && <Spinner />}
          {portfolioError && <div className="text-red-600 mb-4">{portfolioError}</div>}
          {!portfolioLoading && portfolio.length === 0 && <div className="text-gray-500">No portfolio items yet.</div>}
          {!portfolioLoading && portfolio.length > 0 && (
            <div className="space-y-4">
              {portfolio.map((item) => (
                <div key={item.id} className="border rounded p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.item_type || 'Item'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handlePortfolioModalOpen(item)} className="text-blue-600 hover:underline text-sm">Edit</button>
                      <button onClick={() => handleDeletePortfolio(item.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700">{item.description || 'No description provided.'}</p>
                  {item.external_url && (
                    <a href={item.external_url} className="text-blue-600 hover:underline text-sm" target="_blank" rel="noreferrer">Open link</a>
                  )}
                  {item.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
                      {item.skills.map((skill) => (
                        <span key={skill} className="bg-gray-100 rounded-full px-2 py-1">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {portfolioMessage && <div className="mt-4 text-green-600">{portfolioMessage}</div>}
          {portfolioActionError && <div className="mt-4 text-red-600">{portfolioActionError}</div>}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            {profileSuccess && <div className="text-green-600">{profileSuccess}</div>}
            {profileSavingError && <div className="text-red-600">{profileSavingError}</div>}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input value={profileForm.full_name} onChange={handleProfileChange('full_name')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea value={profileForm.bio} onChange={handleProfileChange('bio')} className="mt-1 block w-full border rounded px-3 py-2" rows={4} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input value={profileForm.location} onChange={handleProfileChange('location')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                <input value={profileForm.website_url} onChange={handleProfileChange('website_url')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GitHub URL</label>
                <input value={profileForm.github_url} onChange={handleProfileChange('github_url')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                <input value={profileForm.linkedin_url} onChange={handleProfileChange('linkedin_url')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <button type="submit" disabled={profileSaving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60">
                {profileSaving ? <Spinner /> : 'Save profile'}
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Security</h2>
            {passwordSuccess && <div className="text-green-600">{passwordSuccess}</div>}
            {passwordError && <div className="text-red-600">{passwordError}</div>}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                <input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm((prev) => ({ ...prev, current_password: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" value={passwordForm.password} onChange={(e) => setPasswordForm((prev) => ({ ...prev, password: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input type="password" value={passwordForm.password_confirmation} onChange={(e) => setPasswordForm((prev) => ({ ...prev, password_confirmation: e.target.value }))} className="mt-1 block w-full border rounded px-3 py-2" required />
              </div>
              <button type="submit" disabled={passwordLoading} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60">
                {passwordLoading ? <Spinner /> : 'Change password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {skillModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-white rounded shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editingSkill ? 'Edit Skill' : 'Add Skill'}</h2>
              <button onClick={() => setSkillModalOpen(false)} className="text-gray-500 hover:text-gray-800">Close</button>
            </div>
            {skillError && <div className="text-red-600 mb-3">{skillError}</div>}
            <form onSubmit={handleSaveSkill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Skill name</label>
                <input disabled={Boolean(editingSkill)} value={skillForm.skill_name} onChange={handleSkillChange('skill_name')} className="mt-1 block w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Proficiency level</label>
                <input type="number" min="1" max="5" value={skillForm.proficiency_level} onChange={handleSkillChange('proficiency_level')} className="mt-1 block w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Years experience</label>
                <input type="number" min="0" value={skillForm.years_experience} onChange={handleSkillChange('years_experience')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSkillModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={skillSaving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
                  {skillSaving ? <Spinner /> : editingSkill ? 'Update Skill' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {portfolioModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-white rounded shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editingPortfolio ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
              <button onClick={() => setPortfolioModalOpen(false)} className="text-gray-500 hover:text-gray-800">Close</button>
            </div>
            {portfolioActionError && <div className="text-red-600 mb-3">{portfolioActionError}</div>}
            <form onSubmit={handleSavePortfolio} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={portfolioForm.title} onChange={handlePortfolioChange('title')} className="mt-1 block w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={portfolioForm.description} onChange={handlePortfolioChange('description')} className="mt-1 block w-full border rounded px-3 py-2" rows={4} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">External URL</label>
                  <input value={portfolioForm.external_url} onChange={handlePortfolioChange('external_url')} className="mt-1 block w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Item Type</label>
                  <select value={portfolioForm.item_type} onChange={handlePortfolioChange('item_type')} className="mt-1 block w-full border rounded px-3 py-2">
                    <option value="link">Link</option>
                    <option value="image">Image</option>
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="code">Code</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visibility</label>
                  <select value={portfolioForm.visibility} onChange={handlePortfolioChange('visibility')} className="mt-1 block w-full border rounded px-3 py-2">
                    <option value="public">Public</option>
                    <option value="connections">Connections</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills</label>
                  <input value={portfolioForm.skills} onChange={handlePortfolioChange('skills')} className="mt-1 block w-full border rounded px-3 py-2" placeholder="Comma separated" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setPortfolioModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" disabled={portfolioSaving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
                  {portfolioSaving ? <Spinner /> : editingPortfolio ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
