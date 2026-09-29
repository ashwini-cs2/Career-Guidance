import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Sparkles, Eye, EyeOff, Sun, Moon, ArrowLeft, Loader2 } from 'lucide-react'

export default function AuthPage({ mode = 'login' }) {
  const [isLogin, setIsLogin] = useState(mode === 'login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const { login } = useAuth()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (!isLogin && !form.name) { setError('Please enter your name.'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    login({ name: form.name || form.email.split('@')[0], email: form.email })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0b0f1a]">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col bg-gradient-to-br from-brand-600 via-purple-700 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full bg-white/5"
              style={{
                width: `${120 + i * 60}px`, height: `${120 + i * 60}px`,
                top: `${10 + i * 12}%`, left: `${-20 + i * 5}%`,
              }} />
          ))}
        </div>
        <div className="relative flex flex-col justify-between h-full p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">PathAI</span>
          </Link>
          <div>
            <h2 className="font-display font-extrabold text-4xl text-white leading-tight mb-4">
              Your AI-powered career compass
            </h2>
            <p className="text-brand-200 text-lg leading-relaxed mb-8">
              Get personalized career recommendations, resume analysis, and a custom learning roadmap — all in one place.
            </p>
            <div className="space-y-3">
              {['Personalized career path matching', 'Real-time AI advisor chat', 'ATS resume scoring & rewrites', 'Week-by-week learning roadmaps'].map(item => (
                <div key={item} className="flex items-center gap-3 text-brand-100">
                  <div className="w-5 h-5 rounded-full bg-accent-400/30 border border-accent-400/50 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-accent-400" />
                  </div>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-brand-300 text-sm">© PathAI. Free to get started.</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-5 lg:p-8">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white">PathAI</span>
          </Link>
          <Link to="/" className="hidden lg:flex btn-ghost gap-1.5 text-sm">
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <button onClick={toggle} className="ml-auto p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white mb-2">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {isLogin
                  ? "Sign in to continue your career journey."
                  : "Join 45,000+ professionals charting smarter career paths."}
              </p>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['Google', 'GitHub'].map(provider => (
                <button key={provider} className="btn-secondary justify-center text-sm py-3 gap-2">
                  <span>{provider}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs text-slate-400">or continue with email</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            <form onSubmit={submit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="label">Full name</label>
                  <input name="name" value={form.name} onChange={handle}
                    placeholder="Alex Johnson" className="input" />
                </div>
              )}
              <div>
                <label className="label">Email address</label>
                <input name="email" type="email" value={form.email} onChange={handle}
                  placeholder="alex@example.com" className="input" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">Password</label>
                  {isLogin && (
                    <a href="#" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">Forgot password?</a>
                  )}
                </div>
                <div className="relative">
                  <input name="password" type={showPass ? 'text' : 'password'}
                    value={form.password} onChange={handle}
                    placeholder="••••••••" className="input pr-11" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{error}</p>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center py-3 text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : isLogin ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(v => !v)}
                className="text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                {isLogin ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
