import { AlertTriangle, FileCheck2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePageContext } from '../App'
import ChatPanel from '../components/ChatPanel'
import { useFinancialTwin } from '../context/FinancialTwinContext'
import { buildDocumentContextMessage, buildDynamicContext } from '../services/geminiService'
import { useFinLensConversation } from '../hooks/useFinLensConversation'
import GeminiModelSelector from '../components/GeminiModelSelector'
import { geminiModelLabel } from '../services/geminiModels'

export default function Assistant() {
  const { language, geminiModel, setGeminiModel } = usePageContext()
  const { twin } = useFinancialTwin()
  const conversation = useFinLensConversation(language, geminiModel)
  const { askFinLens } = conversation
  const location = useLocation()
  const navigate = useNavigate()
  const startedDocumentChat = useRef(false)
  const [document] = useState(() => location.state?.document)

  useEffect(() => {
    if (!document || startedDocumentChat.current) return
    startedDocumentChat.current = true
    navigate(location.pathname, { replace: true, state: null })
    const documentContext = buildDocumentContextMessage(document.summary, document.fields, document.risks)
    askFinLens(documentContext, {
      displayText: `Tell me what I should know about ${document.filename}.`,
      dynamicContext: buildDynamicContext({ twin, documentInsights: documentContext }),
    })
  }, [askFinLens, document, location.pathname, navigate, twin])

  function handleSendText(text) {
    conversation.askFinLens(text, { dynamicContext: buildDynamicContext({ twin }) })
  }

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex flex-col justify-between gap-3 rounded-2xl bg-brand-blue-dark p-5 text-white sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Gemini Financial Guide</h1>
          <p className="text-sm text-white/65">Private, context-aware answers grounded in your Financial Twin.</p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">
          <Sparkles className="h-4 w-4 text-cyan-300" /> Powered by Gemini {geminiModelLabel(geminiModel)}
        </span>
      </div>

      <GeminiModelSelector value={geminiModel} onChange={setGeminiModel} />

      {document && (
        <div className="flex items-start gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue-light p-3 text-brand-blue-dark">
          <FileCheck2 className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold">Document context added</p>
            <p className="text-sm opacity-75">{document.filename} is being reviewed with your complete Financial Twin.</p>
          </div>
        </div>
      )}

      {conversation.error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-base">{conversation.error}</p>
        </div>
      )}

      <div className="min-h-[600px] flex-1">
        <ChatPanel
          messages={conversation.messages}
          onSendText={handleSendText}
          disabled={conversation.status === 'thinking'}
          isSpeaking={conversation.isSpeaking}
          onStopSpeaking={conversation.stopSpeaking}
          isVoiceOutputEnabled={conversation.isVoiceOutputEnabled}
          onToggleVoiceOutput={conversation.setVoiceOutputEnabled}
        />
      </div>
    </main>
  )
}
