import { AlertTriangle, Mic, MicOff, RotateCcw, Volume2 } from 'lucide-react'

const STATUS_LABEL = {
  idle: 'Ready',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking',
  error: 'Error',
}

const STATUS_COLOR = {
  idle: 'bg-brand-green',
  listening: 'bg-brand-blue',
  thinking: 'bg-amber-500',
  speaking: 'bg-brand-blue',
  error: 'bg-red-500',
}

/**
 * A local, original SVG illustration of a financial advisor - not a
 * rendering of Convai's proprietary Avatar Studio character (that requires
 * the Pixel Streaming product this app doesn't use, since it needs a
 * paid-plan domain allowlist - see ConvaiAvatarEmbed.jsx for the real
 * character's public preview link). Animation state is driven by real app
 * state (mic listening, waiting on Convai, speechSynthesis playing), not
 * decorative filler.
 */
function AdvisorIllustration({ status }) {
  const animationClass =
    status === 'speaking'
      ? 'animate-[speaking_0.5s_ease-in-out_infinite]'
      : status === 'listening'
        ? 'animate-[pulse_1.5s_ease-in-out_infinite]'
        : 'animate-[float_4s_ease-in-out_infinite]'

  return (
    <svg viewBox="0 0 240 320" className={`h-full max-h-[320px] w-auto ${animationClass}`} aria-hidden="true">
      <style>
        {`
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
          @keyframes speaking { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.015); } }
        `}
      </style>
      {/* office-toned background */}
      <rect width="240" height="320" fill="#e7edf7" />
      <rect y="230" width="240" height="90" fill="#cdd8ec" />
      <rect x="18" y="26" width="50" height="76" rx="4" fill="#f4f8ff" opacity="0.8" />
      <rect x="172" y="26" width="50" height="76" rx="4" fill="#f4f8ff" opacity="0.8" />
      {/* simple bar-chart motif on the wall */}
      <rect x="28" y="60" width="8" height="30" fill="#00baf2" opacity="0.5" />
      <rect x="40" y="45" width="8" height="45" fill="#007bff" opacity="0.5" />
      <rect x="52" y="70" width="8" height="20" fill="#00baf2" opacity="0.5" />

      {/* short hair */}
      <path
        d="M78 118 Q76 96 96 90 Q108 100 120 100 Q132 100 144 90 Q164 96 162 118 Q162 106 150 100 Q135 112 120 108 Q105 112 90 100 Q78 106 78 118 Z"
        fill="#2b2320"
      />

      {/* body / navy blazer */}
      <path d="M68 320 Q68 226 120 216 Q172 226 172 320 Z" fill="#002970" />
      {/* white shirt + collar */}
      <path d="M108 222 L120 242 L132 222 L124 222 L120 232 L116 222 Z" fill="#ffffff" />
      {/* tie */}
      <path d="M115 224 L125 224 L122 258 L120 264 L118 258 Z" fill="#00baf2" />
      {/* blazer lapels */}
      <path d="M104 222 L120 246 L112 232 Z" fill="#001d52" />
      <path d="M136 222 L120 246 L128 232 Z" fill="#001d52" />
      {/* name badge */}
      <rect x="142" y="248" width="14" height="10" rx="1.5" fill="#ffffff" />
      <rect x="145" y="251" width="8" height="4" fill="#00baf2" />

      {/* neck */}
      <rect x="108" y="150" width="24" height="30" fill="#e8b894" />
      {/* head */}
      <circle cx="120" cy="128" r="42" fill="#f2c9a3" />
      {/* simple face */}
      <path d="M98 122 Q104 118 110 122" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M130 122 Q136 118 142 122" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="104" cy="130" r="4" fill="#1f2937" />
      <circle cx="136" cy="130" r="4" fill="#1f2937" />
      <path d="M108 148 Q120 156 132 148" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* hair top */}
      <path d="M78 118 Q80 82 120 78 Q160 82 162 118 Q150 96 120 96 Q90 96 78 118 Z" fill="#2b2320" />
    </svg>
  )
}

export default function CharacterPanel({
  status,
  errorMessage,
  isMicSupported,
  isMicActive,
  onToggleMic,
  isSpeechOutputSupported,
  onResetConversation,
}) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-brand-blue-light bg-brand-beige">
      <div className="relative flex flex-1 items-center justify-center p-4">
        <AdvisorIllustration status={status} />

        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLOR[status] ?? 'bg-brand-green'}`} />
          <span className="text-sm font-medium text-white">{STATUS_LABEL[status] ?? 'Ready'}</span>
        </div>

        {!isSpeechOutputSupported && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-amber-900">
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium">Voice output not supported in this browser</span>
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div className="absolute inset-x-4 bottom-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800 shadow">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 border-t-2 border-brand-blue-light bg-white p-4">
        <button
          type="button"
          onClick={onToggleMic}
          disabled={!isMicSupported}
          aria-label={isMicActive ? 'Stop listening' : 'Speak to FinLens AI'}
          className={`flex h-12 w-12 items-center justify-center rounded-full disabled:opacity-40 ${
            isMicActive ? 'bg-brand-blue text-white' : 'bg-brand-green text-white'
          }`}
          title={isMicSupported ? undefined : 'Speech recognition is not supported in this browser'}
        >
          {isMicActive ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>
        <button
          type="button"
          onClick={onResetConversation}
          aria-label="Start a new conversation"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-light text-brand-ink hover:bg-brand-blue hover:text-white"
        >
          <RotateCcw className="h-6 w-6" />
        </button>
      </div>
    </section>
  )
}
