import { Bot, FileText, Gauge, LayoutDashboard, LogOut, MessagesSquare, ScanLine, Sparkles, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import LanguageSelector from './LanguageSelector'
import GeminiModelSelector from './GeminiModelSelector'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/documents', label: 'Documents', icon: FileText },
  { to: '/financial-twin', label: 'My Money', icon: Gauge },
  { to: '/insights', label: 'Insights', icon: Sparkles },
  { to: '/assistant', label: 'AI Guide', icon: Bot },
  { to: '/advisor', label: 'Convai Advisor', icon: MessagesSquare },
]

export default function Header({ user, language, onLanguageChange, geminiModel, onGeminiModelChange, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-blue-light/80 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue-dark to-brand-blue text-white shadow-md shadow-brand-blue/20">
            <ScanLine className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-extrabold leading-tight tracking-tight text-brand-blue-dark">FinLens<span className="text-brand-blue">AI</span></p>
            <p className="text-xs font-medium text-brand-ink/50">Money, made intelligent</p>
          </div>
        </div>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-2xl bg-brand-beige p-1 md:order-none md:w-auto">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                  isActive ? 'bg-brand-blue-dark text-white shadow-sm' : 'text-brand-ink/60 hover:bg-white hover:text-brand-ink'
                }`
              }
            >
              <link.icon className="h-4 w-4" aria-hidden="true" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <GeminiModelSelector value={geminiModel} onChange={onGeminiModelChange} compact />
          <LanguageSelector language={language} onChange={onLanguageChange} />
          <div className="hidden items-center gap-2 rounded-xl bg-brand-blue-light px-3 py-2 sm:flex">
            <UserRound className="h-4 w-4 text-brand-blue-dark" aria-hidden="true" />
            <span className="max-w-28 truncate text-sm font-semibold text-brand-blue-dark">{user?.name}</span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Logout"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-blue-dark/15 text-brand-ink/60 hover:border-brand-blue hover:text-brand-blue-dark"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
