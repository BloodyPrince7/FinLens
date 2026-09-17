import { Send, Square, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

const SUGGESTED_QUESTIONS = [
  'Can I afford this loan?',
  'What are my biggest monthly expenses?',
  'What hidden charges should I know about?',
  'How can I improve my financial health?',
]

export default function ChatPanel({
  messages,
  onSendText,
  disabled,
  isSpeaking,
  onStopSpeaking,
  isVoiceOutputEnabled,
  onToggleVoiceOutput,
}) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function submitText(text) {
    if (!text || disabled) return
    onStopSpeaking?.()
    onSendText(text)
    setDraft('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitText(draft.trim())
  }

  function handleInputChange(event) {
    setDraft(event.target.value)
    if (isSpeaking) {
      onStopSpeaking?.()
    }
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border-2 border-brand-blue-light bg-white">
      <div className="flex items-center justify-between border-b border-brand-blue-light px-4 py-3">
        <h2 className="text-lg font-semibold text-brand-ink">Conversation</h2>

        <div className="flex items-center gap-2">
          {isSpeaking && (
            <button
              type="button"
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-red-600 transition-colors animate-pulse"
              title="Stop speaking"
            >
              <Square className="h-3 w-3 fill-current" />
              <span>Stop Speaking</span>
            </button>
          )}

          {onToggleVoiceOutput && (
            <button
              type="button"
              onClick={() => onToggleVoiceOutput(!isVoiceOutputEnabled)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                isVoiceOutputEnabled
                  ? 'bg-brand-blue-light text-brand-blue-dark hover:bg-brand-blue/20'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title={isVoiceOutputEnabled ? 'Voice readout is ON (click to mute)' : 'Voice readout is MUTED (click to enable)'}
            >
              {isVoiceOutputEnabled ? <Volume2 className="h-3.5 w-3.5 text-brand-blue" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isVoiceOutputEnabled ? 'Voice on' : 'Voice off'}</span>
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-center text-base text-brand-ink/50">
              Ask Gemini a question about your money, profile, or uploaded documents.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => submitText(question)}
                  disabled={disabled}
                  className="rounded-full border border-brand-blue-light bg-brand-beige px-3 py-1.5 text-xs font-medium text-brand-ink/80 hover:border-brand-blue disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {isSpeaking && (
        <div className="flex items-center justify-between border-t border-red-100 bg-red-50/90 px-4 py-2 text-xs text-red-700">
          <span className="flex items-center gap-2 font-medium">
            <Volume2 className="h-4 w-4 animate-bounce" /> FinLens AI is speaking...
          </span>
          <button
            type="button"
            onClick={onStopSpeaking}
            className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
          >
            <Square className="h-3 w-3 fill-current" /> Stop Speaking
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-brand-blue-light p-3">
        <input
          type="text"
          value={draft}
          onChange={handleInputChange}
          placeholder="Type your question..."
          disabled={disabled}
          className="flex-1 rounded-full border-2 border-brand-blue-dark/20 px-4 py-2.5 text-base focus:border-brand-blue focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-white disabled:opacity-50 hover:bg-brand-blue-dark transition-colors"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </section>
  )
}
