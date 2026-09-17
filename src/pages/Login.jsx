import { AlertTriangle, HeartPulse, Info, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { login } from '../services/apiService'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.')
      return
    }

    setIsSubmitting(true)
    setError('')
    try {
      const data = await login(email.trim(), password)
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-beige px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border-2 border-brand-blue-light bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue text-white">
            <HeartPulse className="h-8 w-8" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-brand-ink">Sahayak – AI Health Companion</h1>
          <p className="mt-1 text-base text-brand-ink/70">
            Understand your health information with simple AI assistance.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="senior@demo.com"
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
              placeholder="••••••"
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
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 flex items-start gap-2 rounded-lg bg-brand-green-light p-3 text-brand-ink/80">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-green" aria-hidden="true" />
          <p className="text-sm">
            Demo credentials — Email: <strong>senior@demo.com</strong>, Password: <strong>123456</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
