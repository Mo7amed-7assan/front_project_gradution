import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById, updateProject } from '../services/project'
import { useI18n } from '../context/I18nContext'

export default function EditProject() {
  const { id } = useParams()
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
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const stepLabels = [
    t('projectForm.steps.basicInfo'),
    t('projectForm.steps.rolesSkills'),
    t('projectForm.steps.timeline')
  ]

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const project = await getProjectById(id)
        setForm({
          title: project.title || '',
          category: project.category || '',
          short_description: project.short_description || '',
          full_description: project.full_description || '',
          goals: project.goals || '',
          status: project.status || 'planning',
          visibility: project.visibility || 'public',
          team_size_min: project.team_size_min || '',
          team_size_max: project.team_size_max || '',
          start_date: project.start_date ? project.start_date.split('T')[0] : '',
          target_completion_date: project.target_completion_date ? project.target_completion_date.split('T')[0] : '',
          application_deadline: project.application_deadline ? project.application_deadline.split('T')[0] : '',
          is_accepting_applications: project.is_accepting_applications !== false,
          roles: Array.isArray(project.roles) && project.roles.length ? project.roles.map((r) => ({
            role_name: r.role_name || '',
            description: r.description || '',
            positions_needed: r.positions_needed || 1
          })) : [{ role_name: '', description: '', positions_needed: 1 }],
          skills: Array.isArray(project.skills) && project.skills.length ? project.skills.map((s) => ({
            skill_name: s.skill_name || '',
            proficiency_required: s.proficiency_required || 1,
            positions_needed: s.positions_needed || 1,
            is_required: s.is_required !== false
          })) : [{ skill_name: '', proficiency_required: 1, positions_needed: 1, is_required: true }]
        })
      } catch (err) {
        setError(err?.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [id])

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  const handleChange = (key) => (e) => updateField(key, e.target.value)

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
    if (step === 0) return form.title.trim() && form.category.trim() && form.short_description.trim()
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        category: form.category,
        short_description: form.short_description,
        full_description: form.full_description,
        status: form.status,
        visibility: form.visibility,
        team_size_min: form.team_size_min || null,
        team_size_max: form.team_size_max || null,
        start_date: form.start_date || null,
        target_completion_date: form.target_completion_date || null,
        application_deadline: form.application_deadline || null,
        is_accepting_applications: form.is_accepting_applications
      }

      await updateProject(id, payload)
      navigate(`/projects/${id}`)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 md:p-8 card max-w-5xl mx-auto rounded-2xl">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-sm text-[var(--text-secondary)]">{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  if (error && !form.title) {
    return (
      <div className="max-w-5xl mx-auto card p-6 md:p-8 rounded-2xl border-red-500/20 bg-red-500/10 text-red-400">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-5xl mx-auto card p-6 md:p-8 rounded-2xl ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="page-header mb-6">
        <h2 className="page-title text-2xl md:text-3xl font-extrabold">{t('projectForm.editTitle')}</h2>
        <p className="page-subtitle text-sm text-[var(--text-secondary)] mt-1">{t('projectForm.editSubtitle')}</p>
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
            <div>
              <label className="form-label">{t('projectForm.labels.shortDescription')}</label>
              <input
                value={form.short_description}
                onChange={handleChange('short_description')}
                required
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
                        required
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
                        required
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
                  <div className="flex items-center justify-between flex-wrap gap-2 mt-4 border-t border-[var(--border-color)]/50 pt-3">
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
                {t('projectForm.labels.reviewTextEdit')}
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
              {saving ? t('projectForm.buttons.saving') : t('projectForm.buttons.saveChanges')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
