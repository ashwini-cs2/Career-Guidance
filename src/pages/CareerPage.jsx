import { useState } from 'react'
import { Compass, Loader2, ChevronRight, DollarSign, TrendingUp, Sparkles, RefreshCw } from 'lucide-react'
import { api, ApiError } from '../utils/api'

const skillsList = [
  'Python', 'JavaScript', 'SQL', 'Java', 'Machine Learning', 'React', 'Node.js',
  'Data Analysis', 'Communication', 'Leadership', 'Project Management', 'Design',
  'Cloud (AWS/GCP)', 'Docker', 'Statistics', 'Excel', 'Marketing', 'Sales'
]

const interestsList = [
  'Technology', 'Data & Analytics', 'Healthcare', 'Finance', 'Education',
  'Creative Arts', 'Business Strategy', 'Research', 'Product Development', 'Social Impact'
]

const expLevels = ['Student', 'Entry Level (0–2 yrs)', 'Mid Level (3–5 yrs)', 'Senior (6+ yrs)', 'Executive']

// Look up a salary entry for a role name from whatever shape the backend
// returned (list of {role,...} objects, or a plain dict keyed by role).
function findSalary(salaryInsights, role) {
  if (!salaryInsights) return null
  if (Array.isArray(salaryInsights)) {
    return salaryInsights.find(s => s.role?.toLowerCase() === role.toLowerCase()) || null
  }
  const entry = salaryInsights[role]
  return entry ? { ...entry, role } : null
}

export default function CareerPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ skills: [], interests: [], experience: '', goal: '' })

  const toggle = (field, val) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val]
    }))
  }

  const analyze = async () => {
    setLoading(true)
    setResults(null)
    setError('')
    try {
      // The backend builds recommendations from the saved profile, so we
      // save the wizard's picks first, then ask for recommendations.
      await api.put('/profile', {
        skills: form.skills,
        interests: form.interests,
        career_goals: form.goal || undefined,
      })

      const context = [
        form.experience && `Experience level: ${form.experience}`,
        form.goal && `Career goal: ${form.goal}`,
      ].filter(Boolean).join('. ')

      const data = await api.post('/career/recommend', {
        additional_context: context || undefined,
      })

      setResults(data)
      setStep(3)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setResults({ error: true })
      setStep(3)
    }
    setLoading(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
            <Compass size={18} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Career Path Finder</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Tell us about yourself and our AI will recommend the best career paths for you.</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Your Skills', 'Your Goals', 'Results'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${step > i ? 'bg-accent-500 text-white' : step === i + 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
              <span className="font-mono">{i + 1}</span>
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < 2 && <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />}
          </div>
        ))}
      </div>

      {/* Step 1: Skills */}
      {step === 1 && (
        <div className="glass-card p-6 space-y-6">
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-1">What skills do you have?</h2>
            <p className="text-sm text-slate-500">Select all that apply. Pick at least 3.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillsList.map(skill => (
              <button key={skill} onClick={() => toggle('skills', skill)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.skills.includes(skill) ? 'bg-brand-600 border-brand-600 text-white shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400'}`}>
                {skill}
              </button>
            ))}
          </div>
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-1 mt-2">What are your interests?</h2>
            <p className="text-sm text-slate-500 mb-3">Pick up to 3 areas you're drawn to.</p>
            <div className="flex flex-wrap gap-2">
              {interestsList.map(i => (
                <button key={i} onClick={() => toggle('interests', i)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${form.interests.includes(i) ? 'bg-purple-600 border-purple-600 text-white shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400'}`}>
                  {i}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(2)} disabled={form.skills.length < 1}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            Next: Your Goals <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Step 2: Goals */}
      {step === 2 && (
        <div className="glass-card p-6 space-y-6">
          <div>
            <h2 className="font-display font-semibold text-slate-900 dark:text-white mb-1">Where are you now?</h2>
            <p className="text-sm text-slate-500">Select your current experience level.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {expLevels.map(level => (
              <button key={level} onClick={() => setForm(f => ({ ...f, experience: level }))}
                className={`p-3 rounded-xl border text-left text-sm font-medium transition-all ${form.experience === level ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-400 text-brand-700 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-300'}`}>
                {level}
              </button>
            ))}
          </div>
          <div>
            <label className="label">What's your career goal? (optional)</label>
            <textarea value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
              className="input resize-none h-24" placeholder="e.g. I want to transition into data science and work at a tech company within 2 years..." />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button onClick={analyze} disabled={!form.experience}
              className="btn-primary flex-1 justify-center disabled:opacity-50">
              <Sparkles size={16} />
              Analyze with AI
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
            <Loader2 size={28} className="text-brand-500 animate-spin" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Analyzing your profile…</p>
          <p className="text-sm text-slate-500 text-center max-w-sm">Our AI is matching your skills and interests against thousands of career paths and market trends.</p>
        </div>
      )}

      {/* Results */}
      {step === 3 && results && !loading && (
        <div className="space-y-5">
          {results.error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-500">{error || 'Something went wrong. Please try again.'}</p>
              <button onClick={() => setStep(1)} className="btn-primary mt-4">Start over</button>
            </div>
          ) : (
            <>
              {/* Recommended roles */}
              <div className="grid gap-4">
                {results.recommended_roles?.map((role, i) => {
                  const salary = findSalary(results.salary_insights, role)
                  return (
                    <div key={role} className="glass-card p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">{role}</h3>
                          {i === 0 && <span className="text-xs px-2 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-400 rounded-full font-semibold">Top pick</span>}
                        </div>
                        {salary && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                            <DollarSign size={14} className="text-accent-500" />
                            {salary.min_salary} – {salary.max_salary}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Required skills */}
              {results.required_skills?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3">Skills to build</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {results.required_skills.map(s => (
                      <span key={s} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Roadmap: short / mid / long term */}
              {results.career_roadmap && (
                <div className="grid sm:grid-cols-3 gap-4">
                  {['short_term', 'mid_term', 'long_term'].map(key => {
                    const items = results.career_roadmap[key]
                    if (!items?.length) return null
                    const title = { short_term: 'Short term', mid_term: 'Mid term', long_term: 'Long term' }[key]
                    return (
                      <div key={key} className="glass-card p-4">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-2">{title}</h4>
                        <ul className="space-y-1.5">
                          {items.map((it, i) => (
                            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex gap-1.5">
                              <span className="text-brand-500">•</span>{it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Market trends */}
              {results.market_trends?.length > 0 && (
                <div className="glass-card p-5 border-l-4 border-brand-500">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={15} className="text-brand-500" />
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Market trends</span>
                  </div>
                  <ul className="space-y-1">
                    {results.market_trends.map((t, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300">{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={() => { setStep(1); setResults(null); setForm({ skills: [], interests: [], experience: '', goal: '' }) }}
                className="btn-secondary w-full justify-center">
                <RefreshCw size={15} /> Start over
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
