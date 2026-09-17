import { AlertTriangle, Info, Loader2, ScanLine, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { login, register } from '../services/apiService'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    if (!email.trim() || !password.trim() || (mode === 'register' && !name.trim())) {
      setError('Please complete all required fields.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const data = mode === 'register'
        ? await register(name, email, password)
        : await login(email, password)
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f8ff] px-4 py-10">
      <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="absolute -right-24 bottom-12 h-72 w-72 rounded-full bg-cyan/15 blur-3xl" />
      <div className="relative w-full max-w-md rounded-3xl border border-white bg-white/95 p-8 shadow-xl shadow-brand-blue-dark/10">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue-dark text-white">
            <ScanLine className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-brand-ink">FinLens AI</h1>
          <p className="mt-1 text-base text-brand-ink/70">Your AI-powered financial command centre</p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-brand-beige p-1">
          {['login', 'register'].map((item) => (
            <button key={item} type="button" onClick={() => { setMode(item); setError('') }}
              className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${mode === item ? 'bg-white text-brand-blue-dark shadow-sm' : 'text-brand-ink/55'}`}>
              {item === 'login' ? 'Sign in' : 'Create account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="mb-1 block text-base font-medium text-brand-ink">Full name</label>
              <input id="name" value={name} onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border-2 border-brand-blue-dark/15 p-3 focus:border-brand-blue focus:outline-none"
                placeholder="Your name" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-lg font-medium text-brand-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border-2 border-brand-blue-dark/30 p-3 text-lg focus:border-brand-blue focus:outline-none"
              placeholder="demo@finlens.ai"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-lg font-medium text-brand-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border-2 border-brand-blue-dark/30 p-3 text-lg focus:border-brand-blue focus:outline-none"
              placeholder={mode === 'register' ? 'Minimum 8 characters' : '••••••'}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-red-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-blue py-3 text-lg font-semibold text-white transition-colors hover:bg-brand-blue-dark disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Please wait...' : mode === 'register' ? 'Create secure account' : 'Sign in securely'}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-lg bg-brand-green-light p-3 text-brand-ink/80">
          {mode === 'login' ? <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green" aria-hidden="true" /> : <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green" />}
          <p className="text-sm">
            {mode === 'login' ? <>Demo — <strong>demo@finlens.ai</strong> / <strong>123456</strong></> : 'Passwords are securely hashed and your profile is isolated from other users.'}
          </p>
        </div>
      </div>
    </div>
  )
}
