import { useState } from 'react'
import { Square, Volume2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { isSpeechSynthesisSupported, speak, stopSpeaking } from '../services/speechService'

export default function MessageBubble({ message }) {
  const fromUser = message.role === 'user'
  const [isPlaying, setIsPlaying] = useState(false)
  const isHindi = /[\u0900-\u097F]/.test(message.content)

  async function handleToggleSpeech() {
    if (isPlaying) {
      stopSpeaking()
      setIsPlaying(false)
      return
    }

    stopSpeaking()
    setIsPlaying(true)
    const lang = isHindi ? 'hi' : 'en'
    try {
      await speak(message.content, lang)
    } finally {
      setIsPlaying(false)
    }
  }

  return (
    <div className={`flex ${fromUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm ${
          fromUser ? 'bg-brand-blue text-white' : 'bg-brand-green-light text-brand-ink'
        }`}
      >
        {fromUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-sm max-w-none text-brand-ink">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-bold text-brand-ink">{children}</strong>,
                ul: ({ children }) => <ul className="my-2 list-disc pl-5 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="my-2 list-decimal pl-5 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg font-bold mt-3 mb-1.5 text-brand-ink">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mt-2.5 mb-1 text-brand-ink">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mt-2 mb-1 text-brand-ink">{children}</h3>,
                table: ({ children }) => (
                  <div className="my-2 overflow-x-auto rounded-lg border border-brand-ink/15">
                    <table className="min-w-full text-xs divide-y divide-brand-ink/10">{children}</table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="bg-brand-blue-light/60 px-2.5 py-1.5 text-left font-semibold text-brand-ink">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-2.5 py-1.5 border-t border-brand-ink/10 text-brand-ink/90">
                    {children}
                  </td>
                ),
                code: ({ children }) => (
                  <code className="rounded bg-brand-ink/10 px-1 py-0.5 font-mono text-xs text-brand-ink">
                    {children}
                  </code>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {isSpeechSynthesisSupported && (
              <div className="mt-2.5 flex items-center justify-between border-t border-brand-ink/10 pt-1.5 text-xs text-brand-ink/60">
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium hover:bg-black/5 transition-colors cursor-pointer text-brand-ink/75 hover:text-brand-ink"
                  title={isPlaying ? 'Stop reading' : 'Read aloud'}
                >
                  {isPlaying ? (
                    <>
                      <Square className="h-3 w-3 fill-red-500 text-red-500" />
                      <span className="text-red-600 font-semibold">{isHindi ? 'रोकें' : 'Stop'}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3 w-3 text-brand-blue" />
                      <span>{isHindi ? 'सुनें (Listen)' : 'Listen'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  )
}
