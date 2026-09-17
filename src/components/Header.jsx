import { HeartPulse, LogOut } from 'lucide-react'
import LanguageSelector from './LanguageSelector'

export default function Header({ language, onLanguageChange, onLogout }) {
  return (
    <header className="border-b-2 border-brand-blue-light bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue text-white">
            <HeartPulse className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-bold leading-tight text-brand-ink">Sahayak</p>
            <p className="text-sm text-brand-ink/70">AI Health Companion</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector language={language} onChange={onLanguageChange} />
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-lg border-2 border-brand-blue-dark/30 px-4 py-2 text-base font-medium text-brand-ink hover:border-brand-blue hover:text-brand-blue-dark"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
