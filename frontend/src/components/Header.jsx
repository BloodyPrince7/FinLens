import { Bell, LogOut, ScanLine, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import LanguageSelector from './LanguageSelector'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/documents', label: 'Documents' },
  { to: '/financial-twin', label: 'Financial Twin' },
  { to: '/insights', label: 'Insights' },
]

export default function Header({ language, onLanguageChange, onLogout }) {
  return (
    <header className="border-b-2 border-brand-blue-light bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue-dark text-white">
            <ScanLine className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-bold leading-tight text-brand-ink">FinLens AI</p>
            <p className="text-sm text-brand-ink/60">Personal Financial Companion</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-full bg-brand-beige p-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-brand-blue-dark text-white' : 'text-brand-ink/70 hover:text-brand-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelector language={language} onChange={onLanguageChange} />
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-brand-ink/70 hover:bg-brand-beige"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue-dark">
            <User className="h-5 w-5" aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Logout"
            className="flex items-center gap-2 rounded-lg border-2 border-brand-blue-dark/20 px-3 py-2 text-sm font-medium text-brand-ink hover:border-brand-blue hover:text-brand-blue-dark"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
