import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'

const SUGGESTED_QUESTIONS = [
  'Can I afford this loan?',
  'What are my biggest monthly expenses?',
  'What hidden charges should I know about?',
  'How can I improve my financial health?',
]

export default function ChatPanel({ messages, onSendText, disabled }) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  function submitText(text) {
    if (!text || disabled) return
    onSendText(text)
    setDraft('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitText(draft.trim())
  }

  return (
    <section className="flex h-full flex-col rounded-2xl border-2 border-brand-blue-light bg-white">
      <div className="border-b border-brand-blue-light px-4 py-3">
        <h2 className="text-lg font-semibold text-brand-ink">Conversation</h2>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-center text-base text-brand-ink/50">
              Say hello or ask a question to start talking with FinLens AI.
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
