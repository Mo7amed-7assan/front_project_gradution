import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject } from '../services/project'

const steps = ['Basic info', 'Roles & Skills', 'Timeline']
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
    <div className="max-w-5xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Create Project</h2>
      <div className="flex flex-wrap gap-2 mb-6">
        {steps.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(index)}
            className={`px-4 py-2 rounded ${step === index ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={form.title} onChange={handleChange('title')} required className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <input value={form.category} onChange={handleChange('category')} required className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Status</label>
                <select value={form.status} onChange={handleChange('status')} className="mt-1 block w-full border rounded px-3 py-2">
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status} value={status}>{status.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Visibility</label>
                <select value={form.visibility} onChange={handleChange('visibility')} className="mt-1 block w-full border rounded px-3 py-2">
                  {PROJECT_VISIBILITIES.map((visibility) => (
                    <option key={visibility} value={visibility}>{visibility}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Short Description</label>
              <input value={form.short_description} onChange={handleChange('short_description')} required maxLength={500} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Description</label>
              <textarea value={form.full_description} onChange={handleChange('full_description')} required className="mt-1 block w-full border rounded px-3 py-2" rows={5} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Goals</label>
              <textarea value={form.goals} onChange={handleChange('goals')} placeholder="Describe the project goals and expected impact" className="mt-1 block w-full border rounded px-3 py-2" rows={4} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Roles</h3>
              {form.roles.map((role, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role Title</label>
                      <input value={role.role_name} onChange={handleRoleChange(idx, 'role_name')} className="mt-1 block w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Positions Needed</label>
                      <input type="number" min="1" value={role.positions_needed} onChange={handleRoleChange(idx, 'positions_needed')} className="mt-1 block w-full border rounded px-3 py-2" />
                    </div>
                    <div className="flex items-end">
                      <button type="button" onClick={() => removeRole(idx)} className="bg-red-600 text-white px-3 py-2 rounded">Remove</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={role.description} onChange={handleRoleChange(idx, 'description')} className="mt-1 block w-full border rounded px-3 py-2" rows={3} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addRole} className="bg-green-600 text-white px-4 py-2 rounded">Add Role</button>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Skill Requirements</h3>
              {form.skills.map((skill, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Skill Name</label>
                      <input value={skill.skill_name} onChange={handleSkillChange(idx, 'skill_name')} className="mt-1 block w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Proficiency</label>
                      <select value={skill.proficiency_required} onChange={handleSkillChange(idx, 'proficiency_required')} className="mt-1 block w-full border rounded px-3 py-2">
                        <option value="1">1 - Beginner</option>
                        <option value="2">2</option>
                        <option value="3">3 - Intermediate</option>
                        <option value="4">4</option>
                        <option value="5">5 - Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Positions Needed</label>
                      <input type="number" min="1" value={skill.positions_needed} onChange={handleSkillChange(idx, 'positions_needed')} className="mt-1 block w-full border rounded px-3 py-2" />
                    </div>
                    <div className="flex items-end gap-3">
                      <label className="flex items-center text-sm text-gray-700">
                        <input type="checkbox" checked={skill.is_required} onChange={handleSkillChange(idx, 'is_required')} className="mr-2" />
                        Required
                      </label>
                      <button type="button" onClick={() => removeSkill(idx)} className="bg-red-600 text-white px-3 py-2 rounded">Remove</button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addSkill} className="bg-green-600 text-white px-4 py-2 rounded">Add Skill</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Team Size</label>
                <input type="number" min="1" value={form.team_size_min} onChange={handleChange('team_size_min')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Team Size</label>
                <input type="number" min="1" value={form.team_size_max} onChange={handleChange('team_size_max')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <label className="flex items-end gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.is_accepting_applications} onChange={handleChange('is_accepting_applications')} className="mb-3" />
                <span className="mb-2">Accepting applications</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" value={form.start_date} onChange={handleChange('start_date')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Completion Date</label>
                <input type="date" value={form.target_completion_date} onChange={handleChange('target_completion_date')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
                <input type="date" value={form.application_deadline} onChange={handleChange('application_deadline')} className="mt-1 block w-full border rounded px-3 py-2" />
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-semibold">Review</h3>
              <p className="text-sm text-gray-600 mt-2">Verify project category, goals, team expectations, and deadlines before publishing.</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <button type="button" disabled={step === 0} onClick={() => setStep((prev) => Math.max(0, prev - 1))} className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50">Back</button>
          {step < steps.length - 1 ? (
            <button type="button" disabled={!canContinue()} onClick={() => setStep((prev) => Math.min(steps.length - 1, prev + 1))} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Continue</button>
          ) : (
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{saving ? 'Creating…' : 'Create Project'}</button>
          )}
        </div>
      </form>
    </div>
  )
}
