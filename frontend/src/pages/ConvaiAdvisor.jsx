import { Check, Edit3, ExternalLink, Key, MessageCircleMore, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import ConvaiAvatarEmbed from '../components/ConvaiAvatarEmbed'

function getInitialExperienceId() {
  try {
    return (
      localStorage.getItem('finlens_convai_experience_id') ||
      import.meta.env.VITE_CONVAI_EXPERIENCE_ID ||
      ''
    ).trim()
  } catch {
    return (import.meta.env.VITE_CONVAI_EXPERIENCE_ID || '').trim()
  }
}

function parseExperienceId(input) {
  if (!input) return ''
  const trimmed = input.trim()
  const match = trimmed.match(/experience\/([a-zA-Z0-9_-]+)/)
  if (match) return match[1]
  return trimmed.replace(/^https?:\/\/[^/]+\//, '')
}

export default function ConvaiAdvisor() {
  const [experienceId, setExperienceId] = useState(getInitialExperienceId)
  const [inputVal, setInputVal] = useState(experienceId)
  const [isEditing, setIsEditing] = useState(!experienceId)
  const [savedSuccess, setSavedSuccess] = useState(false)

  function handleSave(e) {
    e?.preventDefault()
    const cleaned = parseExperienceId(inputVal)
    setExperienceId(cleaned)
    try {
      if (cleaned) localStorage.setItem('finlens_convai_experience_id', cleaned)
      else localStorage.removeItem('finlens_convai_experience_id')
    } catch {}
    setIsEditing(false)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const shareUrl = experienceId ? `https://x.convai.com/experience/${experienceId}` : ''

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue-dark to-brand-blue p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <MessageCircleMore className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold">Ask a Financial Advisor</h1>
            <p className="mt-2 max-w-2xl text-white/70">
              Have a live, voice-first conversation with the official FinLens advisor powered by Convai.
            </p>
          </div>
          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-blue-dark hover:bg-white/90 transition shadow-sm"
            >
              Launch advisor <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </section>

      {/* Convai ID Management Card */}
      <div className="rounded-2xl border border-brand-blue-light bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-ink/50">Convai Experience ID</span>
                {savedSuccess && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                    <Check className="h-3 w-3" /> Saved!
                  </span>
                )}
              </div>
              <p className="font-mono text-sm font-medium text-brand-ink">
                {experienceId ? experienceId : <span className="italic text-brand-ink/40">Not configured yet</span>}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-brand-blue/20 bg-brand-beige/50 px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-beige transition"
          >
            <Edit3 className="h-3.5 w-3.5" />
            {isEditing ? 'Cancel' : experienceId ? 'Change ID' : 'Configure ID'}
          </button>
        </div>

        {isEditing && (
          <form onSubmit={handleSave} className="mt-4 border-t border-brand-blue-light/60 pt-4">
            <label className="block text-xs font-semibold text-brand-ink/70">
              Enter Convai Experience ID or Share Link:
            </label>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. 7c9a2... or https://x.convai.com/experience/..."
                className="flex-1 rounded-xl border border-brand-blue-light px-3 py-2 font-mono text-sm focus:border-brand-blue focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark transition"
              >
                Save & Connect
              </button>
            </div>
            <p className="mt-2 text-xs text-brand-ink/50">
              Tip: In your Convai dashboard, open your character, click <strong>Share</strong>, and copy the Experience ID. You can also set <code>VITE_CONVAI_EXPERIENCE_ID</code> in Vercel.
            </p>
          </form>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-green-50 p-3 text-sm text-green-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
        Convai is kept separate from Gemini chat and document analysis. Opening it uses Convai's own experience and privacy controls.
      </div>

      {experienceId ? (
        <ConvaiAvatarEmbed experienceId={experienceId} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-blue-light bg-white p-10 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-brand-ink">Connect Your Convai Character</h2>
          <p className="mt-1 max-w-md text-sm text-brand-ink/70">
            To talk with your 3D avatar advisor, configure your Convai Experience ID using the box above, or add <code>VITE_CONVAI_EXPERIENCE_ID</code> in Vercel environment variables.
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-4 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-blue-dark transition"
          >
            Configure Experience ID
          </button>
        </div>
      )}
    </main>
  )
}
