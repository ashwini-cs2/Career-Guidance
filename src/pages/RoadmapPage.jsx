import { useState } from 'react'
import { Map, Loader2, Sparkles, CheckCircle2, Circle, RefreshCw, Award, FolderKanban, ChevronDown, ChevronUp } from 'lucide-react'
import { api, ApiError } from '../utils/api'

const goalOptions = [
  'Become a Data Scientist', 'Learn Web Development', 'Break into Product Management',
  'Become a UX Designer', 'Learn Machine Learning', 'Start a Career in DevOps',
  'Transition to Cybersecurity', 'Become a Cloud Architect'
]

// Backend wants an integer 1–24 for duration_months.
const timeOptions = [
  { label: '4 weeks', months: 1 },
  { label: '8 weeks', months: 2 },
  { label: '12 weeks', months: 3 },
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
]
const levelOptions = ['Complete beginner', 'Some basics', 'Intermediate', 'Advanced']

export default function RoadmapPage() {
  const [goal, setGoal] = useState('')
  const [customGoal, setCustomGoal] = useState('')
  const [time, setTime] = useState(timeOptions[2])
  const [level, setLevel] = useState('Some basics')
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [completed, setCompleted] = useState({})

  const generate = async () => {
    const target = customGoal || goal
    if (!target) return
    setLoading(true)
    setRoadmap(null)
    setError('')
    setCompleted({})

    try {
      const data = await api.post('/roadmap/generate', {
        target_role: target,
        duration_months: time.months,
        additional_context: `Current level: ${level}`,
      })
      setRoadmap(data)
      setExpanded({ 0: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to generate roadmap. Please try again.')
      setRoadmap({ error: true })
    }
    setLoading(false)
  }

  const toggleExpand = (i) => setExpanded(e => ({ ...e, [i]: !e[i] }))
  const toggleComplete = (monthI, milestoneI) => {
    const key = `${monthI}-${milestoneI}`
    setCompleted(c => ({ ...c, [key]: !c[key] }))
  }

  // Progress calculation (based on milestones, since that's what the
  // backend gives us a stable count of per month).
  const totalMilestones = roadmap?.monthly_plan?.reduce((acc, m) => acc + (m.milestones?.length || 0), 0) || 0
  const doneMilestones = Object.values(completed).filter(Boolean).length
  const pct = totalMilestones ? Math.round((doneMilestones / totalMilestones) * 100) : 0

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center">
            <Map size={18} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Learning Roadmap</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Generate a personalized, month-by-month learning plan for any career goal.</p>
      </div>

      {/* Config form */}
      {!roadmap && !loading && (
        <div className="glass-card p-6 space-y-5">
          <div>
            <label className="label">Choose a learning goal</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {goalOptions.map(g => (
                <button key={g} onClick={() => { setGoal(g); setCustomGoal('') }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${goal === g && !customGoal ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400'}`}>
                  {g}
                </button>
              ))}
            </div>
            <input value={customGoal} onChange={e => { setCustomGoal(e.target.value); setGoal('') }}
              placeholder="Or type your own goal…"
              className="input" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Available time</label>
              <div className="flex flex-wrap gap-2">
                {timeOptions.map(t => (
                  <button key={t.label} onClick={() => setTime(t)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${time.label === t.label ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-400'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Current level</label>
              <div className="flex flex-wrap gap-2">
                {levelOptions.map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${level === l ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-400'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={generate} disabled={!goal && !customGoal}
            className="btn-primary w-full justify-center disabled:opacity-50">
            <Sparkles size={16} /> Generate My Roadmap
          </button>
        </div>
      )}

      {loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
            <Loader2 size={28} className="text-orange-500 animate-spin" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Building your roadmap…</p>
          <p className="text-sm text-slate-500 text-center max-w-sm">Curating resources, sequencing topics, and estimating time for your specific goal.</p>
        </div>
      )}

      {roadmap && !loading && (
        <div className="space-y-5">
          {roadmap.error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-500">{error || 'Failed to generate roadmap. Please try again.'}</p>
              <button onClick={() => setRoadmap(null)} className="btn-primary mt-4">Try again</button>
            </div>
          ) : (
            <>
              {/* Overview */}
              <div className="glass-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-1">{roadmap.target_role}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {roadmap.duration_months}-month plan
                      {roadmap.total_skills_to_learn ? ` · ${roadmap.total_skills_to_learn} skills to learn` : ''}
                    </p>
                  </div>
                  <button onClick={() => { setRoadmap(null); setGoal(''); setCustomGoal('') }} className="btn-ghost text-sm flex-shrink-0">
                    <RefreshCw size={14} /> New plan
                  </button>
                </div>

                {totalMilestones > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>{doneMilestones}/{totalMilestones} milestones completed</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Monthly plan */}
              <div className="space-y-3">
                {roadmap.monthly_plan?.map((m, monthI) => (
                  <div key={monthI} className="glass-card overflow-hidden">
                    <button onClick={() => toggleExpand(monthI)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 ${monthI % 4 === 0 ? 'bg-brand-600' : monthI % 4 === 1 ? 'bg-purple-600' : monthI % 4 === 2 ? 'bg-orange-500' : 'bg-accent-500'}`}>
                        {m.month}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-slate-900 dark:text-white">{m.title}</h3>
                        <p className="text-sm text-slate-500 mt-0.5 truncate">{m.skills?.join(', ')}</p>
                      </div>
                      {expanded[monthI] ? <ChevronUp size={18} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-slate-400 flex-shrink-0" />}
                    </button>

                    {expanded[monthI] && (
                      <div className="border-t border-slate-200 dark:border-slate-700 p-5 space-y-4">
                        {m.skills?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1.5">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {m.skills.map(s => (
                                <span key={s} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {m.projects?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1.5">Projects</p>
                            <ul className="space-y-1">
                              {m.projects.map((p, i) => <li key={i} className="text-sm text-slate-700 dark:text-slate-300">🛠️ {p}</li>)}
                            </ul>
                          </div>
                        )}
                        {m.resources?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1.5">Resources</p>
                            <ul className="space-y-1">
                              {m.resources.map((r, i) => <li key={i} className="text-sm text-brand-600 dark:text-brand-400">📚 {r}</li>)}
                            </ul>
                          </div>
                        )}
                        {m.milestones?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-slate-500 mb-1.5">Milestones</p>
                            <div className="space-y-1.5">
                              {m.milestones.map((ms, msI) => {
                                const key = `${monthI}-${msI}`
                                const done = completed[key]
                                return (
                                  <button key={msI} onClick={() => toggleComplete(monthI, msI)}
                                    className="w-full flex items-start gap-2 text-left">
                                    {done
                                      ? <CheckCircle2 size={18} className="text-accent-500 flex-shrink-0 mt-0.5" />
                                      : <Circle size={18} className="text-slate-300 dark:text-slate-600 flex-shrink-0 mt-0.5" />}
                                    <span className={`text-sm ${done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{ms}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Certifications */}
              {roadmap.certifications?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award size={16} className="text-brand-500" /> Recommended certifications
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {roadmap.certifications.map((c, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.provider}{c.estimated_time ? ` · ${c.estimated_time}` : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project ideas */}
              {roadmap.projects?.length > 0 && (
                <div className="glass-card p-5 border-l-4 border-accent-500">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FolderKanban size={16} className="text-accent-500" /> Project ideas
                  </h3>
                  <div className="space-y-3">
                    {roadmap.projects.map((p, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.name} <span className="text-xs text-slate-400 font-normal">({p.complexity})</span></p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{p.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
