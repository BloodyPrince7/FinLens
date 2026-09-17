import { ExternalLink, MessageCircleMore, ShieldCheck } from 'lucide-react'
import ConvaiAvatarEmbed from '../components/ConvaiAvatarEmbed'

const EXPERIENCE_ID = import.meta.env.VITE_CONVAI_EXPERIENCE_ID

export default function ConvaiAdvisor() {
  const shareUrl = EXPERIENCE_ID ? `https://x.convai.com/experience/${EXPERIENCE_ID}` : ''
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue-dark to-brand-blue p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <MessageCircleMore className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-extrabold">Ask a Financial Advisor</h1>
            <p className="mt-2 max-w-2xl text-white/70">Have a live, voice-first conversation with the official FinLens advisor powered by Convai.</p>
          </div>
          {shareUrl && <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-blue-dark">
            Launch advisor <ExternalLink className="h-4 w-4" />
          </a>}
        </div>
      </section>
      <div className="flex items-start gap-3 rounded-xl border border-brand-green/20 bg-green-50 p-3 text-sm text-green-900">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0" />
        Convai is kept separate from Gemini chat and document analysis. Opening it uses Convai's own experience and privacy controls.
      </div>
      <ConvaiAvatarEmbed />
    </main>
  )
}
