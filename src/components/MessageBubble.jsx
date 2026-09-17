export default function MessageBubble({ message }) {
  const fromUser = message.role === 'user'

  return (
    <div className={`flex ${fromUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-sm ${
          fromUser ? 'bg-brand-blue text-white' : 'bg-brand-green-light text-brand-ink'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}
