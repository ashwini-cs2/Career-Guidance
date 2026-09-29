import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Compass, FileText, MessageSquare, Map, ArrowRight,
  TrendingUp, BookOpen, CheckCircle2, Clock, Target
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const progressData = [
  { week: 'Wk 1', score: 42 }, { week: 'Wk 2', score: 55 },
  { week: 'Wk 3', score: 51 }, { week: 'Wk 4', score: 68 },
  { week: 'Wk 5', score: 74 }, { week: 'Wk 6', score: 82 },
]

const quickActions = [
  { to: '/career', icon: Compass, label: 'Find Career Paths', color: 'from-brand-500 to-purple-600', desc: 'Explore roles that match your profile' },
  { to: '/resume', icon: FileText, label: 'Analyze Resume',   color: 'from-purple-500 to-pink-500',  desc: 'Get your ATS score and improvements' },
  { to: '/chat',   icon: MessageSquare, label: 'Chat with AI', color: 'from-accent-500 to-cyan-500', desc: 'Ask your career advisor anything' },
  { to: '/roadmap',icon: Map,           label: 'My Roadmap',   color: 'from-orange-400 to-rose-500', desc: 'Continue your learning plan' },
]

const recentActivity = [
  { icon: CheckCircle2, color: 'text-accent-500', text: 'Completed: Python for Data Science — Module 3', time: '2h ago' },
  { icon: FileText,     color: 'text-brand-500',  text: 'Resume analyzed — Score: 78/100',              time: '1d ago' },
  { icon: Target,       color: 'text-purple-500', text: 'Career path set: Machine Learning Engineer',   time: '3d ago' },
  { icon: BookOpen,     color: 'text-orange-500', text: 'Started: Statistics for ML roadmap',           time: '4d ago' },
]

const skills = [
  { name: 'Python', level: 72 },
  { name: 'Machine Learning', level: 45 },
  { name: 'Data Analysis', level: 61 },
  { name: 'SQL', level: 80 },
  { name: 'Communication', level: 88 },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
            {greeting}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Here's where you stand today.</p>
        </div>
        <Link to="/chat" className="btn-primary text-sm self-start sm:self-auto">
          <MessageSquare size={16} />
          Ask AI Advisor
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Career Match Score', value: '82%', change: '+12%', icon: Target, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Resume Score', value: '78/100', change: '+8 pts', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'Skills Logged', value: '14', change: '+3 new', icon: TrendingUp, color: 'text-accent-500', bg: 'bg-accent-50 dark:bg-accent-900/20' },
          { label: 'Hours Learned', value: '42h', change: 'This month', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(({ label, value, change, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <div className="font-display font-bold text-2xl text-slate-900 dark:text-white">{value}</div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-500">{label}</p>
              <p className={`text-xs font-medium ${color}`}>{change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ to, icon: Icon, label, color, desc }) => (
            <Link key={to} to={to}
              className="glass-card p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{desc}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Charts + Skills row */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Progress chart */}
        <div className="lg:col-span-3 glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-semibold text-slate-900 dark:text-white">Career Readiness</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 6 weeks progress</p>
            </div>
            <span className="text-sm font-bold text-accent-500">+40pts</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad)" dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skills */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-5">Skill Levels</h3>
          <div className="space-y-4">
            {skills.map(({ name, level }) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                  <span className="text-slate-500 dark:text-slate-500 font-mono text-xs">{level}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-700"
                    style={{ width: `${level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-1">
          {recentActivity.map(({ icon: Icon, color, text, time }, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Icon size={16} className={`flex-shrink-0 ${color}`} />
              <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">{text}</span>
              <span className="text-xs text-slate-400 flex-shrink-0">{time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
