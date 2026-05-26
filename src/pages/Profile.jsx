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
import ProfileUI from '../ui/pages/ProfileUI'

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

  return (
    <ProfileUI
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      profile={profile}
      profileLoading={profileLoading}
      profileError={profileError}
      skills={skills}
      skillsLoading={skillsLoading}
      skillsError={skillsError}
      portfolio={portfolio}
      portfolioLoading={portfolioLoading}
      portfolioError={portfolioError}
      profileForm={profileForm}
      profileSaving={profileSaving}
      profileSuccess={profileSuccess}
      profileSavingError={profileSavingError}
      passwordForm={passwordForm}
      passwordLoading={passwordLoading}
      passwordSuccess={passwordSuccess}
      passwordError={passwordError}
      skillModalOpen={skillModalOpen}
      skillForm={skillForm}
      editingSkill={editingSkill}
      skillSaving={skillSaving}
      skillMessage={skillMessage}
      skillError={skillError}
      portfolioModalOpen={portfolioModalOpen}
      portfolioForm={portfolioForm}
      editingPortfolio={editingPortfolio}
      portfolioSaving={portfolioSaving}
      portfolioMessage={portfolioMessage}
      portfolioActionError={portfolioActionError}
      handleProfileChange={handleProfileChange}
      handleSaveProfile={handleSaveProfile}
      setPasswordForm={setPasswordForm}
      handlePasswordChange={handlePasswordChange}
      handleSkillModalOpen={handleSkillModalOpen}
      setSkillModalOpen={setSkillModalOpen}
      handleSkillChange={handleSkillChange}
      handleSaveSkill={handleSaveSkill}
      handleDeleteSkill={handleDeleteSkill}
      handlePortfolioModalOpen={handlePortfolioModalOpen}
      setPortfolioModalOpen={setPortfolioModalOpen}
      handlePortfolioChange={handlePortfolioChange}
      handleSavePortfolio={handleSavePortfolio}
      handleDeletePortfolio={handleDeletePortfolio}
    />
  )
}
