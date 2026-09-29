import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Sparkles, ArrowRight, Sun, Moon, Compass, FileText,
  MessageSquare, Map, Star, CheckCircle2, Zap, Brain, Target, TrendingUp
} from 'lucide-react'

const features = [
  {
    icon: Compass,
    color: 'from-brand-500 to-purple-600',
    title: 'Career Path Finder',
    desc: 'AI maps your skills, interests, and market trends to surface the most fitting career paths with salary data.'
  },
  {
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
    title: 'Resume Analyzer',
    desc: 'Paste or upload your resume. Get an instant ATS score, gap analysis, and rewrite suggestions by role.'
  },
  {
    icon: MessageSquare,
    color: 'from-accent-500 to-cyan-500',
    title: 'AI Career Advisor',
    desc: 'Chat in real time with an advisor trained on hiring patterns, salary benchmarks, and career progression data.'
  },
  {
    icon: Map,
    color: 'from-orange-400 to-rose-500',
    title: 'Learning Roadmap',
    desc: 'Auto-generate a week-by-week learning plan linking free and paid resources from the web for any goal.'
  },
]

const stats = [
  { label: 'Career paths mapped', value: '2,400+' },
  { label: 'Resumes analyzed', value: '180K+' },
  { label: 'Learners guided', value: '45K+' },
  { label: 'Avg salary uplift', value: '38%' },
]

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer → ML Engineer',
    avatar: 'PS',
    color: 'from-brand-400 to-purple-500',
    text: 'PathAI showed me exactly which skills to learn for the transition. Landed my ML role in 8 months.'
  },
  {
    name: 'James Okafor',
    role: 'Business Analyst → Product Manager',
    avatar: 'JO',
    color: 'from-accent-400 to-cyan-500',
    text: 'The resume analyzer flagged gaps I would never have noticed. My interview callback rate doubled.'
  },
  {
    name: 'Sofia Mendes',
    role: 'Graphic Designer → UX Designer',
    avatar: 'SM',
    color: 'from-orange-400 to-rose-500',
    text: 'The roadmap feature gave me a clear week-by-week plan. No more wasted time on random tutorials.'
  },
]

const checks = [
  'Personalized career recommendations',
  'ATS-optimized resume feedback',
  'Real-time AI chat advisor',
  'Auto-generated learning roadmaps',
  'Salary & market insights',
  'Free to get started',
]

export default function LandingPage() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f1a] overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mt-4 glass rounded-2xl px-5 py-3 flex items-center justify-between border border-slate-200/50 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles size={15} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white">PathAI</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {['Features', 'How it works', 'Testimonials'].map(item => (
                <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all">
                  {item}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggle} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm">Get started free</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-4 sm:px-6 relative">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-accent-500/8 dark:bg-accent-500/4 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 text-sm font-medium mb-8">
            <Zap size={14} className="text-brand-500" />
            <span>AI-powered career advisor</span>
          </div>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-slate-900 dark:text-white mb-6 text-balance">
            Your career,{' '}
            <span className="gradient-text">guided by AI</span>
            <br />not guesswork.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            PathAI combines career intelligence, resume analysis, and personalized learning plans into one advisor that actually knows your market.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-brand-500/30 shadow-xl">
              Start for free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5">
              Sign in to continue
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map(({ label, value }) => (
              <div key={label} className="glass-card p-4 text-center">
                <div className="font-display font-extrabold text-2xl text-brand-600 dark:text-brand-400">{value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-tag mb-4">Features</span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white mt-3 text-balance">
              Everything you need to <br className="hidden sm:block" />navigate your career
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="glass-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} className="text-white" />
                </div>
                <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-tag mb-4">How it works</span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white mt-3 text-balance">
              From confused to confident <br className="hidden sm:block" />in three steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, step: '01', title: 'Share your profile', desc: 'Tell PathAI your current skills, experience, and what you want from your career. Takes 3 minutes.' },
              { icon: Target, step: '02', title: 'Get your analysis', desc: 'AI surfaces matching career paths, analyzes your resume gaps, and builds a tailored learning roadmap.' },
              { icon: TrendingUp, step: '03', title: 'Take action daily', desc: 'Follow your roadmap, chat with your AI advisor, and track your progress week by week.' },
            ].map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-brand-500/30">
                  <Icon size={28} className="text-white" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs font-mono font-bold text-brand-300 dark:text-brand-700">{step}</div>
                <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-950/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="section-tag mb-4">Testimonials</span>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-slate-900 dark:text-white mt-3">
              Real transitions. Real results.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, avatar, color, text }) => (
              <div key={name} className="glass-card p-6">
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5 italic">"{text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-bold`}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</p>
                    <p className="text-xs text-slate-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-purple-600 to-brand-700 p-px shadow-2xl shadow-brand-500/30">
            <div className="rounded-3xl bg-gradient-to-br from-brand-600 via-purple-600 to-brand-700 p-12 text-center">
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-4 text-balance">
                Start your career transformation today
              </h2>
              <p className="text-brand-200 text-lg mb-8 max-w-xl mx-auto">
                Join 45,000+ professionals who use PathAI to navigate their careers with confidence.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
                {checks.slice(0, 6).map(c => (
                  <div key={c} className="flex items-center gap-2 text-brand-100 text-sm">
                    <CheckCircle2 size={14} className="text-accent-400 flex-shrink-0" />
                    {c}
                  </div>
                ))}
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-all duration-200 shadow-xl text-base">
                Get started for free
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-900 dark:text-white">PathAI</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 PathAI -ALL RIGHTS RESERVED</p>
          <div className="flex gap-5 text-sm text-slate-500">
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
