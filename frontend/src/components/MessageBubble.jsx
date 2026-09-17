import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MessageBubble({ message }) {
  const fromUser = message.role === 'user'

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
          </div>
        )}
      </div>
    </div>
  )
}
