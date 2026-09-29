import { useEffect, useState } from 'react'
import {
  User,
  Mail,
  GraduationCap,
  Building2,
  Award,
  Briefcase,
  Heart,
  Target,
  Linkedin,
  Github,
  Pencil,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react'

import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const emptyProfile = {
  full_name: '',
  email: '',
  degree: '',
  department: '',
  cgpa: '',
  skills: [],
  interests: [],
  career_goals: '',
  years_of_experience: 0,
  linkedin_url: '',
  github_url: '',
}

export default function ProfilePage() {
  const { user } = useAuth()

  const [profile, setProfile] = useState(emptyProfile)
  const [form, setForm] = useState(emptyProfile)

  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [skillInput, setSkillInput] = useState('')
  const [interestInput, setInterestInput] = useState('')

  // ---------------------------------------------------------
  // Load profile
  // ---------------------------------------------------------
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await api.get('/profile')

      const formattedProfile = {
        ...emptyProfile,
        ...data,
        cgpa: data.cgpa ?? '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        years_of_experience: data.years_of_experience ?? 0,
      }

      setProfile(formattedProfile)
      setForm(formattedProfile)
    } catch (err) {
      /*
       * The current login screen in this project is a frontend demo
       * and does not yet save a real JWT token.
       *
       * If the backend cannot be reached/authenticated, we still show
       * the basic user information stored by AuthContext.
       */
      setProfile({
        ...emptyProfile,
        full_name: user?.name || '',
        email: user?.email || '',
      })

      setForm({
        ...emptyProfile,
        full_name: user?.name || '',
        email: user?.email || '',
      })

      if (err.status !== 401 && err.status !== 404) {
        setError(err.message || 'Unable to load profile.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ---------------------------------------------------------
  // Handle input changes
  // ---------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // ---------------------------------------------------------
  // Add skill
  // ---------------------------------------------------------
  const addSkill = () => {
    const value = skillInput.trim()

    if (!value) return

    if (!form.skills.includes(value)) {
      setForm((prev) => ({
        ...prev,
        skills: [...prev.skills, value],
      }))
    }

    setSkillInput('')
  }

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item !== skill),
    }))
  }

  // ---------------------------------------------------------
  // Add interest
  // ---------------------------------------------------------
  const addInterest = () => {
    const value = interestInput.trim()

    if (!value) return

    if (!form.interests.includes(value)) {
      setForm((prev) => ({
        ...prev,
        interests: [...prev.interests, value],
      }))
    }

    setInterestInput('')
  }

  const removeInterest = (interest) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((item) => item !== interest),
    }))
  }

  // ---------------------------------------------------------
  // Save profile
  // ---------------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault()

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        full_name: form.full_name || null,
        degree: form.degree || null,
        department: form.department || null,
        cgpa: form.cgpa === '' ? null : Number(form.cgpa),
        skills: form.skills,
        interests: form.interests,
        career_goals: form.career_goals || null,
        years_of_experience:
          form.years_of_experience === ''
            ? 0
            : Number(form.years_of_experience),
        linkedin_url: form.linkedin_url || null,
        github_url: form.github_url || null,
      }

      const data = await api.put('/profile', payload)

      const updatedProfile = {
        ...emptyProfile,
        ...data,
        cgpa: data.cgpa ?? '',
        skills: Array.isArray(data.skills) ? data.skills : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        years_of_experience: data.years_of_experience ?? 0,
      }

      setProfile(updatedProfile)
      setForm(updatedProfile)

      setEditing(false)
      setSuccess('Profile updated successfully.')

      setTimeout(() => {
        setSuccess('')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  // ---------------------------------------------------------
  // Cancel editing
  // ---------------------------------------------------------
  const handleCancel = () => {
    setForm(profile)
    setEditing(false)
    setError('')
    setSkillInput('')
    setInterestInput('')
  }

  // ---------------------------------------------------------
  // Initial
  // ---------------------------------------------------------
  const getInitial = () => {
    const name = profile.full_name || user?.name || 'U'
    return name.charAt(0).toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* ------------------------------------------------ */}
        {/* Header */}
        {/* ------------------------------------------------ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

          <div>
            <p className="section-tag mb-3">
              <User size={13} />
              My Profile
            </p>

            <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white">
              Profile
            </h1>

            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage your personal, academic and career information.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setEditing(true)
                setError('')
                setSuccess('')
              }}
              className="btn-primary"
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------ */}
        {/* Success message */}
        {/* ------------------------------------------------ */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* Error message */}
        {/* ------------------------------------------------ */}
        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* Profile Header Card */}
        {/* ------------------------------------------------ */}
        <div className="glass-card p-6 md:p-8 mb-6">

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">

            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 via-purple-500 to-accent-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg flex-shrink-0">
              {getInitial()}
            </div>

            <div className="flex-1 min-w-0">

              <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white truncate">
                {profile.full_name || 'Your Name'}
              </h2>

              <div className="flex items-center gap-2 mt-2 text-slate-500 dark:text-slate-400">
                <Mail size={16} />
                <span className="truncate">
                  {profile.email || user?.email || 'No email available'}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">

                {profile.degree && (
                  <span className="px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-xs font-medium">
                    {profile.degree}
                  </span>
                )}

                {profile.department && (
                  <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-xs font-medium">
                    {profile.department}
                  </span>
                )}

              </div>
            </div>

          </div>
        </div>

        {/* ------------------------------------------------ */}
        {/* Profile Form */}
        {/* ------------------------------------------------ */}
        <form onSubmit={handleSave}>

          {/* Personal Information */}
          <section className="glass-card p-6 md:p-8 mb-6">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                <User size={19} className="text-brand-600 dark:text-brand-400" />
              </div>

              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Personal Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your basic profile details
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="label">Full Name</label>

                {editing ? (
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="input"
                  />
                ) : (
                  <ProfileValue value={profile.full_name} />
                )}
              </div>

              <div>
                <label className="label">Email Address</label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <div className="input pl-10 bg-slate-50 dark:bg-slate-800/60">
                    {profile.email || user?.email || 'Not available'}
                  </div>
                </div>

                {editing && (
                  <p className="text-xs text-slate-400 mt-1">
                    Email is linked to your account and cannot be changed here.
                  </p>
                )}
              </div>

            </div>
          </section>

          {/* Education */}
          <section className="glass-card p-6 md:p-8 mb-6">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <GraduationCap size={19} className="text-purple-600 dark:text-purple-400" />
              </div>

              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Education
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your academic information
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">

              <div>
                <label className="label">Degree</label>

                {editing ? (
                  <input
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    placeholder="B.E / B.Tech"
                    className="input"
                  />
                ) : (
                  <ProfileValue value={profile.degree} />
                )}
              </div>

              <div>
                <label className="label">Department</label>

                {editing ? (
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="Computer Science and Engineering"
                    className="input"
                  />
                ) : (
                  <ProfileValue value={profile.department} />
                )}
              </div>

              <div>
                <label className="label">CGPA</label>

                {editing ? (
                  <input
                    name="cgpa"
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    value={form.cgpa}
                    onChange={handleChange}
                    placeholder="9.00"
                    className="input"
                  />
                ) : (
                  <ProfileValue
                    value={
                      profile.cgpa !== '' && profile.cgpa !== null
                        ? Number(profile.cgpa).toFixed(2)
                        : ''
                    }
                  />
                )}
              </div>

            </div>
          </section>

          {/* Skills and Interests */}
          <section className="glass-card p-6 md:p-8 mb-6">

            <div className="grid lg:grid-cols-2 gap-8">

              {/* Skills */}
              <div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Award size={19} className="text-blue-600 dark:text-blue-400" />
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                      Skills
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Technical and professional skills
                    </p>
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                      placeholder="Add a skill"
                      className="input"
                    />

                    <button
                      type="button"
                      onClick={addSkill}
                      className="btn-secondary px-3"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 min-h-[44px]">

                  {form.skills.length > 0 ? (
                    form.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 text-sm font-medium"
                      >
                        {skill}

                        {editing && (
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      No skills added yet.
                    </p>
                  )}

                </div>

              </div>

              {/* Interests */}
              <div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center">
                    <Heart size={19} className="text-pink-600 dark:text-pink-400" />
                  </div>

                  <div>
                    <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                      Interests
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Areas you are interested in
                    </p>
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addInterest()
                        }
                      }}
                      placeholder="Add an interest"
                      className="input"
                    />

                    <button
                      type="button"
                      onClick={addInterest}
                      className="btn-secondary px-3"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 min-h-[44px]">

                  {form.interests.length > 0 ? (
                    form.interests.map((interest) => (
                      <span
                        key={interest}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 text-sm font-medium"
                      >
                        {interest}

                        {editing && (
                          <button
                            type="button"
                            onClick={() => removeInterest(interest)}
                            className="hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">
                      No interests added yet.
                    </p>
                  )}

                </div>

              </div>

            </div>
          </section>

          {/* Career Information */}
          <section className="glass-card p-6 md:p-8 mb-6">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Target size={19} className="text-green-600 dark:text-green-400" />
              </div>

              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Career Information
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your professional goals and experience
                </p>
              </div>
            </div>

            <div className="space-y-5">

              <div>
                <label className="label">Career Goals</label>

                {editing ? (
                  <textarea
                    name="career_goals"
                    value={form.career_goals}
                    onChange={handleChange}
                    placeholder="Describe your career goals..."
                    rows={4}
                    className="input resize-none"
                  />
                ) : (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm text-slate-600 dark:text-slate-300 min-h-[90px]">
                    {profile.career_goals || 'No career goals added yet.'}
                  </div>
                )}
              </div>

              <div className="max-w-sm">

                <label className="label">
                  Years of Experience
                </label>

                {editing ? (
                  <input
                    name="years_of_experience"
                    type="number"
                    min="0"
                    value={form.years_of_experience}
                    onChange={handleChange}
                    className="input"
                  />
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3">
                    <Briefcase
                      size={18}
                      className="text-slate-400"
                    />

                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {profile.years_of_experience || 0}{' '}
                      {Number(profile.years_of_experience) === 1
                        ? 'year'
                        : 'years'}
                    </span>
                  </div>
                )}

              </div>

            </div>
          </section>

          {/* Social Links */}
          <section className="glass-card p-6 md:p-8 mb-6">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Github size={19} className="text-slate-700 dark:text-slate-300" />
              </div>

              <div>
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Professional Links
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add your professional profiles
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="label">
                  LinkedIn Profile
                </label>

                {editing ? (
                  <div className="relative">
                    <Linkedin
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                    />

                    <input
                      name="linkedin_url"
                      value={form.linkedin_url}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/yourname"
                      className="input pl-10"
                    />
                  </div>
                ) : profile.linkedin_url ? (
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-brand-600 dark:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Linkedin size={18} />
                    <span className="truncate">
                      {profile.linkedin_url}
                    </span>
                  </a>
                ) : (
                  <ProfileValue value="" />
                )}
              </div>

              <div>
                <label className="label">
                  GitHub Profile
                </label>

                {editing ? (
                  <div className="relative">
                    <Github
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      name="github_url"
                      value={form.github_url}
                      onChange={handleChange}
                      placeholder="https://github.com/yourname"
                      className="input pl-10"
                    />
                  </div>
                ) : profile.github_url ? (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm text-brand-600 dark:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Github size={18} />
                    <span className="truncate">
                      {profile.github_url}
                    </span>
                  </a>
                ) : (
                  <ProfileValue value="" />
                )}
              </div>

            </div>
          </section>

          {/* Bottom save buttons */}
          {editing && (
            <div className="flex justify-end gap-3 pb-8">

              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Profile
                  </>
                )}
              </button>

            </div>
          )}

        </form>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// Reusable read-only value component
// -------------------------------------------------------------
function ProfileValue({ value }) {
  return (
    <div className="input bg-slate-50 dark:bg-slate-800/60">
      {value || (
        <span className="text-slate-400">
          Not provided
        </span>
      )}
    </div>
  )
}