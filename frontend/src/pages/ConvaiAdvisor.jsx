import { Check, Edit3, ExternalLink, Key, MessageCircleMore, MessagesSquare, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
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
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-6"
    >
      {/* Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#002970] via-[#0041a8] to-[#00baf2] p-6 text-white shadow-xl shadow-[#002970]/15 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[32px] border-white/10" />

        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-bold tracking-wide text-white backdrop-blur-sm">
              <span>pay<span className="text-[#00baf2]">tm</span></span>
              <span className="animate-heart-pulse text-sm text-[#e01a59]">❤️</span>
              <span className="font-extrabold text-white">Ai</span>
              <span className="text-[#00baf2]">✨</span>
              <span className="text-white/60">•</span>
              <span className="text-white/90">3D Interactive Voice Advisor</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Live 3D Conversational Advisor</h1>
            <p className="mt-1.5 max-w-2xl text-xs font-medium text-white/80 sm:text-sm">
              Engage in hands-free, voice-first financial guidance with real-time lip-sync powered by Convai.
            </p>
          </div>
          {shareUrl && (
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-[#002970] shadow-md transition hover:bg-[#f0f7fd]"
            >
              <span>Launch External Window</span>
              <ExternalLink className="h-3.5 w-3.5 text-[#00baf2]" />
            </motion.a>
          )}
        </div>
      </section>

      {/* Convai ID Management Card */}
      <div className="rounded-3xl border border-[#e3edf7] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#002970]/10 to-[#00baf2]/10 text-[#002970]">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Convai Experience ID</span>
                {savedSuccess && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00b368]">
                    <Check className="h-3 w-3" /> Connected &amp; Saved!
                  </span>
                )}
              </div>
              <p className="font-mono text-sm font-bold text-[#002970]">
                {experienceId ? experienceId : <span className="italic text-[#94a3b8]">Not configured yet</span>}
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e3edf7] bg-[#f8fbfe] px-3.5 py-2 text-xs font-bold text-[#002970] transition-all hover:border-[#00baf2] hover:bg-white"
          >
            <Edit3 className="h-3.5 w-3.5 text-[#00baf2]" />
            <span>{isEditing ? 'Cancel' : experienceId ? 'Change Character ID' : 'Configure Character ID'}</span>
          </motion.button>
        </div>

        {isEditing && (
          <form onSubmit={handleSave} className="mt-4 border-t border-[#e3edf7] pt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#002970]">
              Paste Convai Experience ID or Share URL:
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. 7c9a2... or https://x.convai.com/experience/..."
                className="flex-1 rounded-xl border border-[#e3edf7] bg-[#f8fbfe] px-3.5 py-2.5 font-mono text-xs font-medium text-[#0f172a] transition-all focus:border-[#00baf2] focus:bg-white focus:outline-none focus:ring-3 focus:ring-[#00baf2]/20"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="rounded-xl bg-gradient-to-r from-[#002970] to-[#0041a8] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:shadow-md"
              >
                Save &amp; Connect
              </motion.button>
            </div>
            <p className="mt-2 text-[11px] font-medium text-[#64748b]">
              Tip: In your Convai character dashboard, click <strong>Share</strong> and copy the Experience ID. You can also define <code>VITE_CONVAI_EXPERIENCE_ID</code> in your Vercel project settings.
            </p>
          </form>
        )}
      </div>

      <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-[#e8f9f1] p-3 text-xs font-semibold text-emerald-950">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <span>
          Convai voice sessions execute directly within a sandbox and are kept isolated from your sensitive profile documents.
        </span>
      </div>

      {experienceId ? (
        <ConvaiAvatarEmbed experienceId={experienceId} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#00baf2]/40 bg-white p-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#002970]/10 to-[#00baf2]/10 text-[#002970]">
            <Sparkles className="h-7 w-7 text-[#00baf2]" />
          </div>
          <h2 className="text-lg font-black text-[#002970]">Connect Your 3D Avatar Character</h2>
          <p className="mt-1 max-w-md text-xs font-medium text-[#64748b]">
            To speak with your interactive 3D advisor, enter your Convai Experience ID above.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-4 rounded-xl bg-gradient-to-r from-[#002970] to-[#0041a8] px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-[#002970]/20"
          >
            Enter Experience ID
          </motion.button>
        </div>
      )}
    </motion.main>
  )
}
