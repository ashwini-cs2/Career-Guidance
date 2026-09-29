import { useState, useRef } from 'react'
import { FileText, Loader2, CheckCircle2, XCircle, AlertCircle, Sparkles, RefreshCw, Upload } from 'lucide-react'
import { api, ApiError } from '../utils/api'

export default function ResumePage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef()

  // The backend only accepts a PDF file upload (POST /resume/analyze,
  // multipart/form-data) — it does not accept pasted resume text.
  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const data = await api.upload('/resume/analyze', formData)
      setResult(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Analysis failed. Please check your resume and try again.')
      setResult({ error: true })
    }
    setLoading(false)
  }

  const reset = () => {
    setResult(null)
    setFile(null)
    setError('')
  }

  const scoreColor = (s) => s >= 80 ? 'text-accent-500' : s >= 60 ? 'text-amber-500' : 'text-red-500'
  const scoreBg = (s) => s >= 80 ? 'from-accent-500 to-cyan-400' : s >= 60 ? 'from-amber-400 to-orange-400' : 'from-red-400 to-rose-500'

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <FileText size={18} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">Resume Analyzer</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Upload your resume (PDF) for an instant ATS score, skill gap analysis, and improvement tips.</p>
      </div>

      {!result && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Upload */}
          <div className="glass-card p-5 space-y-4">
            <div>
              <label className="label">Resume (PDF only)</label>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center gap-2 text-center hover:border-brand-400 transition-colors"
              >
                <Upload size={24} className="text-brand-500" />
                {file ? (
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</span>
                ) : (
                  <>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to choose a PDF</span>
                    <span className="text-xs text-slate-400">Text-based resumes only (not scanned images)</span>
                  </>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={onFileChange}
                className="hidden"
              />
            </div>
            <button onClick={analyze} disabled={!file || loading}
              className="btn-primary w-full justify-center disabled:opacity-50">
              <Sparkles size={16} />
              Analyze Resume
            </button>
          </div>

          {/* Tips */}
          <div className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Upload size={16} className="text-brand-500" /> What we check
              </h3>
              {['ATS compatibility score', 'Skill extraction & gaps', 'Strengths & weaknesses', 'Actionable improvement tips'].map(item => (
                <div key={item} className="flex items-center gap-2 py-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 size={14} className="text-accent-500 flex-shrink-0" /> {item}
                </div>
              ))}
            </div>
            <div className="glass-card p-5 bg-brand-50/50 dark:bg-brand-900/10 border-brand-200 dark:border-brand-800">
              <p className="text-sm text-brand-700 dark:text-brand-400 font-medium mb-1">Privacy note</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">Your resume is uploaded to your own backend for analysis and saved to your account so you can revisit past analyses.</p>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="glass-card p-12 flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
            <Loader2 size={28} className="text-purple-500 animate-spin" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300">Analyzing your resume…</p>
          <p className="text-sm text-slate-500 text-center max-w-sm">Extracting text, checking ATS compatibility, and generating improvement suggestions.</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5">
          {result.error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-slate-500">{error || 'Analysis failed. Please check your resume and try again.'}</p>
              <button onClick={reset} className="btn-primary mt-4">Try again</button>
            </div>
          ) : (
            <>
              {/* Score hero */}
              <div className="glass-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${scoreBg(result.ats_score ?? 0)} flex items-center justify-center shadow-xl`}>
                      <span className="font-display font-extrabold text-3xl text-white">{Math.round(result.ats_score ?? 0)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-medium">ATS Score / 100</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-1">{result.filename}</h3>
                    {result.overall_feedback && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{result.overall_feedback}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-5">
                {/* Strengths */}
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-accent-500" /> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {result.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <XCircle size={16} className="text-red-400" /> Weaknesses
                  </h3>
                  <ul className="space-y-2">
                    {result.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Skills */}
              <div className="glass-card p-5">
                <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3">Skill Analysis</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-accent-600 dark:text-accent-400 mb-1.5">Found in your resume ✓</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.extracted_skills?.map(k => (
                        <span key={k} className="text-xs px-2 py-1 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-400 rounded-md">{k}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-500 mb-1.5">Missing — Consider adding</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missing_skills?.map(k => (
                        <span key={k} className="text-xs px-2 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md">{k}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Improvements */}
              {result.improvement_suggestions?.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-500" /> Improvement suggestions
                  </h3>
                  <ul className="space-y-2">
                    {result.improvement_suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-slate-700 dark:text-slate-300 p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={reset} className="btn-secondary w-full justify-center">
                <RefreshCw size={15} /> Analyze a different resume
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
