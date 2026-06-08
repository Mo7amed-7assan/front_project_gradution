import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../services/project'
import { useI18n } from '../context/I18nContext'

const PROJECT_REFRESH_EVENT = 'projects:refresh'
const PROJECT_STATUSES = ['planning', 'active']
const PROJECT_VISIBILITIES = ['public', 'private', 'unlisted']

const toNullableInteger = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

const toPositiveInteger = (value, fallback = 1) => {
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed
}

export default function CreateProject() {
  const navigate = useNavigate()
  const { t, isRTL } = useI18n()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    title: '',
    category: '',
    short_description: '',
    full_description: '',
    goals: '',
    status: 'planning',
    visibility: 'public',
    team_size_min: '',
    team_size_max: '',
    start_date: '',
    target_completion_date: '',
    application_deadline: '',
    is_accepting_applications: true,
    roles: [{ role_name: '', description: '', positions_needed: 1 }],
    skills: [{ skill_name: '', proficiency_required: 1, positions_needed: 1, is_required: true }]
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const stepLabels = [
    t('projectForm.steps.basicInfo'),
    t('projectForm.steps.rolesSkills'),
    t('projectForm.steps.timeline')
  ]

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const handleChange = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    updateField(key, value)
  }

  const handleRoleChange = (idx, key) => (e) => {
    const roles = [...form.roles]
    roles[idx][key] = e.target.value
    updateField('roles', roles)
  }

  const addRole = () => updateField('roles', [...form.roles, { role_name: '', description: '', positions_needed: 1 }])
  const removeRole = (idx) => updateField('roles', form.roles.filter((_, i) => i !== idx))

  const handleSkillChange = (idx, key) => (e) => {
    const skills = [...form.skills]
    skills[idx][key] = key === 'is_required' ? e.target.checked : e.target.value
    updateField('skills', skills)
  }

  const addSkill = () => updateField('skills', [...form.skills, { skill_name: '', proficiency_required: 1, positions_needed: 1, is_required: true }])
  const removeSkill = (idx) => updateField('skills', form.skills.filter((_, i) => i !== idx))

  const canContinue = () => {
    if (step === 0) {
      return form.title.trim()
        && form.category.trim()
        && form.short_description.trim()
        && form.full_description.trim()
        && form.short_description.trim().length <= 500
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        status: form.status,
        visibility: form.visibility,
        team_size_min: toNullableInteger(form.team_size_min),
        team_size_max: toNullableInteger(form.team_size_max),
        start_date: form.start_date || null,
        target_completion_date: form.target_completion_date || null,
        application_deadline: form.application_deadline || null,
        is_accepting_applications: form.is_accepting_applications,
        roles: form.roles.filter((r) => r.role_name.trim()).map((r) => ({
          role_name: r.role_name.trim(),
          description: r.description.trim() || null,
          positions_needed: toPositiveInteger(r.positions_needed)
        })),
        skills: form.skills.filter((s) => s.skill_name.trim()).map((s) => ({
          skill_name: s.skill_name.trim(),
          proficiency_required: Math.min(5, toPositiveInteger(s.proficiency_required)),
          positions_needed: toPositiveInteger(s.positions_needed),
          is_required: Boolean(s.is_required)
        }))
      }

      const project = await createProject(payload)
      window.dispatchEvent(new CustomEvent(PROJECT_REFRESH_EVENT, { detail: { project } }))
      const id = project?.id || project?.project?.id || project?.data?.id
      if (id) navigate(`/projects/${id}`)
      else navigate('/my-projects')
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`max-w-5xl mx-auto card p-6 md:p-8 rounded-2xl ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-header mb-6">
        <h2 className="page-title text-2xl md:text-3xl font-extrabold">{t('projectForm.createTitle')}</h2>
        <p className="page-subtitle text-sm text-[var(--text-secondary)] mt-1">{t('projectForm.createSubtitle')}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border-color)] pb-4">
        {stepLabels.map((label, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setStep(index)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              step === index
                ? 'bg-[#6C63FF] text-white shadow-[0_0_15px_rgba(108,99,255,0.4)]'
                : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">{t('projectForm.labels.projectTitle')}</label>
                <input
                  value={form.title}
                  onChange={handleChange('title')}
                  required
                  placeholder={t('projectForm.labels.projectTitle')}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('projectForm.labels.category')}</label>
                <input
                  value={form.category}
                  onChange={handleChange('category')}
                  required
                  placeholder={t('projectForm.labels.category')}
                  className="form-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">{t('projectForm.labels.status')}</label>
                <select
                  value={form.status}
                  onChange={handleChange('status')}
                  className="form-select"
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status === 'planning' ? t('projectForm.statuses.planning') : t('projectForm.statuses.active')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">{t('projectForm.labels.visibility')}</label>
                <select
                  value={form.visibility}
                  onChange={handleChange('visibility')}
                  className="form-select"
                >
                  {PROJECT_VISIBILITIES.map((visibility) => (
                    <option key={visibility} value={visibility}>
                      {visibility === 'public' ? t('projectForm.visibilities.public') :
                       visibility === 'private' ? t('projectForm.visibilities.private') :
                       t('projectForm.visibilities.unlisted')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">{t('projectForm.labels.shortDescription')}</label>
              <input
                value={form.short_description}
                onChange={handleChange('short_description')}
                required
                maxLength={500}
                placeholder={t('projectForm.labels.shortDescription')}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">{t('projectForm.labels.fullDescription')}</label>
              <textarea
                value={form.full_description}
                onChange={handleChange('full_description')}
                required
                placeholder={t('projectForm.labels.fullDescription')}
                className="form-input"
                rows={5}
              />
            </div>
            <div>
              <label className="form-label">{t('projectForm.labels.goals')}</label>
              <textarea
                value={form.goals}
                onChange={handleChange('goals')}
                placeholder={t('projectForm.labels.goalsPlaceholder')}
                className="form-input"
                rows={4}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">
                {t('projectForm.labels.roles')}
              </h3>
              {form.roles.map((role, idx) => (
                <div key={idx} className="border border-[var(--border-color)] rounded-2xl p-5 bg-[var(--bg-hover)]/20 mb-4 transition-all hover:bg-[var(--bg-hover)]/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="form-label">{t('projectForm.labels.roleTitle')}</label>
                      <input
                        value={role.role_name}
                        onChange={handleRoleChange(idx, 'role_name')}
                        placeholder={t('projectForm.labels.roleTitle')}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">{t('projectForm.labels.positionsNeeded')}</label>
                      <input
                        type="number"
                        min="1"
                        value={role.positions_needed}
                        onChange={handleRoleChange(idx, 'positions_needed')}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="form-label">{t('projectForm.labels.description')}</label>
                      <textarea
                        value={role.description}
                        onChange={handleRoleChange(idx, 'description')}
                        placeholder={t('projectForm.labels.description')}
                        className="form-input"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeRole(idx)}
                        className="btn-danger !py-2 !px-4 text-xs font-semibold"
                      >
                        {t('projectForm.buttons.remove')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addRole}
                className="btn-success text-sm py-2 px-4 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                {t('projectForm.buttons.addRole')}
              </button>
            </div>

            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2 mb-4">
                {t('projectForm.labels.skillRequirements')}
              </h3>
              {form.skills.map((skill, idx) => (
                <div key={idx} className="border border-[var(--border-color)] rounded-2xl p-5 bg-[var(--bg-hover)]/20 mb-4 transition-all hover:bg-[var(--bg-hover)]/30">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="form-label">{t('projectForm.labels.skillName')}</label>
                      <input
                        value={skill.skill_name}
                        onChange={handleSkillChange(idx, 'skill_name')}
                        placeholder={t('projectForm.labels.skillName')}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">{t('projectForm.labels.proficiency')}</label>
                      <select
                        value={skill.proficiency_required}
                        onChange={handleSkillChange(idx, 'proficiency_required')}
                        className="form-select"
                      >
                        <option value="1">1 - {t('projectForm.proficiencyNames.beginner')}</option>
                        <option value="2">2</option>
                        <option value="3">3 - {t('projectForm.proficiencyNames.intermediate')}</option>
                        <option value="4">4</option>
                        <option value="5">5 - {t('projectForm.proficiencyNames.expert')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">{t('projectForm.labels.positionsNeeded')}</label>
                      <input
                        type="number"
                        min="1"
                        value={skill.positions_needed}
                        onChange={handleSkillChange(idx, 'positions_needed')}
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 border-t border-[var(--border-color)]/50 pt-3">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={skill.is_required}
                        onChange={handleSkillChange(idx, 'is_required')}
                        className="w-4 h-4 rounded border-[var(--border-color)] text-[#6C63FF] focus:ring-[#6C63FF] bg-[var(--bg-input)]"
                      />
                      {t('projectForm.labels.required')}
                    </label>
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="btn-danger !py-2 !px-4 text-xs font-semibold"
                    >
                      {t('projectForm.buttons.remove')}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addSkill}
                className="btn-success text-sm py-2 px-4 shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
              >
                {t('projectForm.buttons.addSkill')}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">{t('projectForm.labels.minTeamSize')}</label>
                <input
                  type="number"
                  min="1"
                  value={form.team_size_min}
                  onChange={handleChange('team_size_min')}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('projectForm.labels.maxTeamSize')}</label>
                <input
                  type="number"
                  min="1"
                  value={form.team_size_max}
                  onChange={handleChange('team_size_max')}
                  className="form-input"
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] cursor-pointer mt-4 md:mt-8">
                  <input
                    type="checkbox"
                    checked={form.is_accepting_applications}
                    onChange={handleChange('is_accepting_applications')}
                    className="w-4 h-4 rounded border-[var(--border-color)] text-[#6C63FF] focus:ring-[#6C63FF] bg-[var(--bg-input)]"
                  />
                  <span>{t('projectForm.labels.acceptingApplications')}</span>
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">{t('projectForm.labels.startDate')}</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={handleChange('start_date')}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('projectForm.labels.targetCompletionDate')}</label>
                <input
                  type="date"
                  value={form.target_completion_date}
                  onChange={handleChange('target_completion_date')}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">{t('projectForm.labels.applicationDeadline')}</label>
                <input
                  type="date"
                  value={form.application_deadline}
                  onChange={handleChange('application_deadline')}
                  className="form-input"
                />
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-hover)]/30 p-5">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                {t('projectForm.labels.reviewTitle')}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                {t('projectForm.labels.reviewText')}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 border-t border-[var(--border-color)] pt-6 mt-8">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((prev) => Math.max(0, prev - 1))}
            className="btn-secondary px-6 py-2.5"
          >
            {t('projectForm.buttons.back')}
          </button>
          {step < stepLabels.length - 1 ? (
            <button
              type="button"
              disabled={!canContinue()}
              onClick={() => setStep((prev) => Math.min(stepLabels.length - 1, prev + 1))}
              className="btn-primary px-6 py-2.5"
            >
              {t('projectForm.buttons.continue')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-6 py-2.5 shadow-[0_0_15px_rgba(108,99,255,0.4)]"
            >
              {saving ? t('projectForm.buttons.creating') : t('projectForm.buttons.createProject')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
