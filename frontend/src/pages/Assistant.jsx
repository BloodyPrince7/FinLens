import { AlertTriangle } from 'lucide-react'
import { usePageContext } from '../App'
import CharacterPanel from '../components/CharacterPanel'
import ChatPanel from '../components/ChatPanel'
import ConvaiAvatarEmbed from '../components/ConvaiAvatarEmbed'
import { useFinancialTwin } from '../context/FinancialTwinContext'
import { buildDynamicContext } from '../services/convaiService'
import { useFinLensConversation } from '../hooks/useFinLensConversation'

export default function Assistant() {
  const { language } = usePageContext()
  const { twin } = useFinancialTwin()
  const conversation = useFinLensConversation(language)

  function handleSendText(text) {
    conversation.askFinLens(text, { dynamicContext: buildDynamicContext({ twin }) })
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">AI Financial Assistant</h1>
        <p className="text-brand-ink/60">Professional, empathetic, and always grounded in your own financial data.</p>
      </div>

      {conversation.error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-base">{conversation.error}</p>
        </div>
      )}

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex min-h-[420px] flex-col gap-4 lg:col-span-3">
          <CharacterPanel
            status={conversation.status}
            errorMessage={conversation.error}
            isMicSupported={conversation.isMicSupported}
            isMicActive={conversation.isMicActive}
            onToggleMic={conversation.toggleMic}
            isSpeechOutputSupported={conversation.isSpeechOutputSupported}
            onResetConversation={conversation.resetConversation}
          />
          <ConvaiAvatarEmbed />
        </div>
        <div className="min-h-[420px] lg:col-span-2">
          <ChatPanel
            messages={conversation.messages}
            onSendText={handleSendText}
            disabled={conversation.status === 'thinking'}
          />
        </div>
      </div>
    </main>
  )
}
