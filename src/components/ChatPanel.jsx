import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

export default function ChatPanel({ messages, onSendText, disabled }) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function handleSubmit(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || disabled) return
    onSendText(text)
    setDraft('')
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border-2 border-brand-blue-light bg-white">
      <div className="border-b border-brand-blue-light px-4 py-3">
        <h2 className="text-lg font-semibold text-brand-ink">Conversation</h2>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-center text-base text-brand-ink/50">
            {disabled
              ? 'Start a video call to begin talking with Sahayak.'
              : 'Say hello or type a question to start talking with Sahayak.'}
          </p>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-brand-blue-light p-3">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type your question..."
          disabled={disabled}
          className="flex-1 rounded-full border-2 border-brand-blue-dark/20 px-4 py-2.5 text-base focus:border-brand-blue focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue text-white disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </section>
  )
}
