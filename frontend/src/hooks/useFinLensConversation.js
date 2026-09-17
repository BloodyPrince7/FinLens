import { useState } from 'react'
import { sendMessage } from '../services/convaiService'
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  listenOnce,
  speak,
  stopListening,
} from '../services/speechService'

let nextMessageId = 1
function makeMessage(role, content) {
  return { id: nextMessageId++, role, content }
}

/**
 * Shared conversation state for both Dashboard's avatar/chat panel and the
 * dedicated Assistant page - same session, same message list, so asking a
 * question on one page and continuing on the other feels like one
 * conversation, not two.
 */
export function useFinLensConversation(language) {
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
  const [isMicActive, setIsMicActive] = useState(false)
  const [error, setError] = useState('')

  async function askFinLens(question, { dynamicContext, displayText } = {}) {
    setMessages((prev) => [...prev, makeMessage('user', displayText ?? question)])
    setStatus('thinking')
    setError('')
    try {
      const result = await sendMessage({ question, language, dynamicContext, sessionId })
      setSessionId(result.sessionId)
      setMessages((prev) => [...prev, makeMessage('assistant', result.text)])

      if (isSpeechSynthesisSupported) {
        setStatus('speaking')
        await speak(result.text, language).catch(() => {})
      }
      setStatus('idle')
    } catch (err) {
      console.error('[Convai] Error', err)
      setError(err.message || 'FinLens AI is unavailable right now. Please try again.')
      setStatus('error')
    }
  }

  async function toggleMic() {
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
      const transcript = await listenOnce(language, { onEnd: () => setIsMicActive(false) })
      if (transcript.trim()) {
        await askFinLens(transcript.trim())
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

  function resetConversation() {
    setMessages([])
    setSessionId('')
    setError('')
    setStatus('idle')
  }

  return {
    messages,
    status,
    isMicActive,
    error,
    askFinLens,
    toggleMic,
    resetConversation,
    isMicSupported: isSpeechRecognitionSupported,
    isSpeechOutputSupported: isSpeechSynthesisSupported,
  }
}
