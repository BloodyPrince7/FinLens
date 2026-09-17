import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import CharacterPanel from '../components/CharacterPanel'
import ChatPanel from '../components/ChatPanel'
import Header from '../components/Header'
import ImageUploader from '../components/ImageUploader'
import { buildDocumentContextMessage, sendMessage } from '../services/convaiService'
import { extractTextFromImage } from '../services/imageService'
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  listenOnce,
  speak,
  stopListening,
} from '../services/speechService'

const DISCLAIMER =
  'Sahayak provides general health information and is not a replacement for a qualified doctor. Please consult a doctor or pharmacist before taking medication.'

let nextMessageId = 1
function makeMessage(role, content) {
  return { id: nextMessageId++, role, content }
}

export default function Dashboard({ user, onLogout }) {
  const [messages, setMessages] = useState([])
  const [language, setLanguage] = useState('en')
  const [sessionId, setSessionId] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [isMicActive, setIsMicActive] = useState(false)
  const [image, setImage] = useState(null)
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const [error, setError] = useState('')

  // The one shared conversation: typed text, voice transcripts, and OCR
  // context all flow through this same function, into the same Convai
  // session (continued via sessionId), so nothing is a separate thread.
  async function askSahayak(question, { showInChat = true } = {}) {
    if (showInChat) setMessages((prev) => [...prev, makeMessage('user', question)])
    setStatus('thinking')
    setError('')
    try {
      const result = await sendMessage({
        question,
        language,
        documentContext: extractedText || undefined,
        sessionId,
      })
      setSessionId(result.sessionId)
      setMessages((prev) => [...prev, makeMessage('assistant', result.text)])

      if (isSpeechSynthesisSupported) {
        setStatus('speaking')
        await speak(result.text, language).catch(() => {})
      }
      setStatus('idle')
    } catch (err) {
      console.error('[Convai] Error', err)
      setError(err.message || 'Sahayak is unavailable right now. Please try again.')
      setStatus('error')
    }
  }

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage)
  }

  async function handleToggleMic() {
    if (isMicActive) {
      stopListening()
      setIsMicActive(false)
      setStatus('idle')
      return
    }

    setIsMicActive(true)
    setStatus('listening')
    setError('')
    try {
      const transcript = await listenOnce(language, {
        onEnd: () => setIsMicActive(false),
      })
      if (transcript.trim()) {
        await askSahayak(transcript.trim())
      } else {
        setStatus('idle')
      }
    } catch (err) {
      console.error('[Speech] Error', err)
      setError(err.message)
      setStatus('error')
      setIsMicActive(false)
    }
  }

  function handleResetConversation() {
    setMessages([])
    setSessionId('')
    setError('')
    setStatus('idle')
  }

  async function handleSelectImage(file) {
    setError('')
    setExtractedText('')
    setImage((previous) => {
      if (previous?.previewUrl) URL.revokeObjectURL(previous.previewUrl)
      return { file, previewUrl: URL.createObjectURL(file) }
    })

    setIsProcessingImage(true)
    setOcrProgress(0)
    // Current: mock OCR. Future: swap this one call for a backend endpoint
    // backed by Amazon Textract - nothing else here needs to change.
    const result = await extractTextFromImage(file, setOcrProgress)
    setIsProcessingImage(false)

    if (result.status === 'error') {
      setError(result.error)
      return
    }

    setExtractedText(result.text)
    const documentMessage = buildDocumentContextMessage(result.text)
    await askSahayak(documentMessage)
  }

  function handleRemoveImage() {
    setImage((previous) => {
      if (previous?.previewUrl) URL.revokeObjectURL(previous.previewUrl)
      return null
    })
    setExtractedText('')
    setOcrProgress(0)
  }

  function handleSendText(text) {
    askSahayak(text)
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-beige">
      <Header language={language} onLanguageChange={handleLanguageChange} onLogout={onLogout} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6">
        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <p className="text-base">{error}</p>
          </div>
        )}

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="min-h-[420px] lg:col-span-3">
            <CharacterPanel
              status={status}
              errorMessage={error}
              isMicSupported={isSpeechRecognitionSupported}
              isMicActive={isMicActive}
              onToggleMic={handleToggleMic}
              isSpeechOutputSupported={isSpeechSynthesisSupported}
              onResetConversation={handleResetConversation}
            />
          </div>
          <div className="min-h-[420px] lg:col-span-2">
            <ChatPanel messages={messages} onSendText={handleSendText} disabled={status === 'thinking'} />
          </div>
        </div>

        <ImageUploader
          image={image}
          onSelect={handleSelectImage}
          onRemove={handleRemoveImage}
          onError={setError}
          isProcessing={isProcessingImage}
          ocrProgress={ocrProgress}
          extractedText={extractedText}
        />

        <footer className="flex items-start gap-2 rounded-xl bg-brand-blue-light p-4 text-brand-ink/80">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue-dark" aria-hidden="true" />
          <p className="text-sm">{DISCLAIMER}</p>
        </footer>
      </main>
    </div>
  )
}
