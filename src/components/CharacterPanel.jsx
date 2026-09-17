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
 * A local, original SVG illustration of a nurse - not a rendering of
 * Convai's proprietary Avatar Studio character (that requires the Pixel
 * Streaming product this app no longer depends on, since it needs a
 * paid-plan domain allowlist). Animation state is driven by real app
 * state (mic listening, waiting on Convai, speechSynthesis playing), not
 * decorative filler.
 */
function NurseIllustration({ status }) {
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
      {/* hospital-toned background */}
      <rect width="240" height="320" fill="#dce8f2" />
      <rect y="230" width="240" height="90" fill="#c3d6e6" />
      <rect x="20" y="30" width="46" height="70" rx="4" fill="#eef5fb" opacity="0.7" />
      <rect x="174" y="30" width="46" height="70" rx="4" fill="#eef5fb" opacity="0.7" />

      {/* hair falling behind shoulders */}
      <path
        d="M74 116 Q70 200 82 236 L100 232 Q90 180 92 120 Z"
        fill="#3a2a20"
      />
      <path
        d="M166 116 Q170 200 158 236 L140 232 Q150 180 148 120 Z"
        fill="#3a2a20"
      />

      {/* body / navy scrub top */}
      <path d="M68 320 Q68 228 120 218 Q172 228 172 320 Z" fill="#1f2f4d" />
      {/* v-neck collar with small red/pink trim */}
      <path d="M104 224 L120 246 L136 224 L130 220 L120 234 L110 220 Z" fill="#c23b4b" />
      {/* stethoscope */}
      <path
        d="M100 226 Q100 250 120 254 Q140 250 140 226"
        stroke="#8a97a8"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="120" cy="256" r="5" fill="#8a97a8" />
      {/* name badge */}
      <rect x="140" y="248" width="14" height="10" rx="1.5" fill="#ffffff" />
      <rect x="143" y="251" width="8" height="4" fill="#c23b4b" />

      {/* neck */}
      <rect x="108" y="150" width="24" height="30" fill="#e8b894" />
      {/* head */}
      <circle cx="120" cy="128" r="42" fill="#f2c9a3" />
      {/* hair frame around face */}
      <path
        d="M76 122 Q72 82 120 76 Q168 82 164 122 Q166 100 144 92 Q132 104 120 100 Q108 104 96 92 Q74 100 76 122 Z"
        fill="#3a2a20"
      />
      {/* simple feminine face */}
      <path d="M98 122 Q104 118 110 122" stroke="#2c3440" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M130 122 Q136 118 142 122" stroke="#2c3440" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="104" cy="130" r="4" fill="#2c3440" />
      <circle cx="136" cy="130" r="4" fill="#2c3440" />
      <circle cx="96" cy="140" r="5" fill="#e8a3a3" opacity="0.5" />
      <circle cx="144" cy="140" r="5" fill="#e8a3a3" opacity="0.5" />
      <path d="M108 148 Q120 156 132 148" stroke="#2c3440" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* nurse cap */}
      <rect x="100" y="80" width="40" height="13" rx="3" fill="#ffffff" />
      <rect x="116" y="84" width="8" height="6" fill="#c23b4b" />
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
        <NurseIllustration status={status} />

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
          aria-label={isMicActive ? 'Stop listening' : 'Speak to Sahayak'}
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
