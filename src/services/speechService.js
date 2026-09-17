/**
 * Local, browser-only voice layer using the Web Speech API.
 *
 * Speech-to-text uses SpeechRecognition (mic input). Text-to-speech uses
 * speechSynthesis to read the AI's real text response aloud - this is the
 * browser's own synthesized voice, not Convai's generated audio (that
 * required the streaming/LiveKit integrations this app no longer uses).
 * Both are feature-detected; callers should check `isSpeechRecognitionSupported`
 * / `isSpeechSynthesisSupported` before offering mic/voice-output controls.
 */

const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition

export const isSpeechRecognitionSupported = Boolean(SpeechRecognitionImpl)
export const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

const RECOGNITION_LOCALES = { en: 'en-IN', hi: 'hi-IN' }
const SYNTHESIS_LOCALES = { en: 'en-IN', hi: 'hi-IN' }

let recognizer = null

/**
 * Starts listening once and resolves with the final transcript.
 * @param {'en' | 'hi'} language
 * @param {{ onStart?: () => void, onEnd?: () => void }} [callbacks]
 * @returns {Promise<string>}
 */
export function listenOnce(language, callbacks = {}) {
  return new Promise((resolve, reject) => {
    if (!isSpeechRecognitionSupported) {
      reject(new Error('Speech recognition is not supported in this browser.'))
      return
    }
    stopListening()

    recognizer = new SpeechRecognitionImpl()
    recognizer.lang = RECOGNITION_LOCALES[language] ?? RECOGNITION_LOCALES.en
    recognizer.interimResults = false
    recognizer.maxAlternatives = 1

    recognizer.onstart = () => callbacks.onStart?.()
    recognizer.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? ''
      resolve(transcript)
    }
    recognizer.onerror = (event) => {
      reject(new Error(mapRecognitionError(event.error)))
    }
    recognizer.onend = () => {
      callbacks.onEnd?.()
      recognizer = null
    }

    recognizer.start()
  })
}

export function stopListening() {
  recognizer?.abort()
  recognizer = null
}

function mapRecognitionError(code) {
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'Microphone permission was denied. Please allow microphone access and try again.'
  }
  if (code === 'no-speech') {
    return "Didn't catch that - please try speaking again."
  }
  return `Speech recognition error: ${code}`
}

/**
 * Reads text aloud in the given language. Resolves when speech finishes.
 * @param {string} text
 * @param {'en' | 'hi'} language
 * @returns {Promise<void>}
 */
export function speak(text, language) {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported || !text?.trim()) {
      resolve()
      return
    }
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const targetLocale = SYNTHESIS_LOCALES[language] ?? SYNTHESIS_LOCALES.en
    utterance.lang = targetLocale
    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find((v) => v.lang === targetLocale) ?? voices.find((v) => v.lang.startsWith(language))
    if (matchingVoice) utterance.voice = matchingVoice

    utterance.onend = () => resolve()
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`))

    window.speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported) window.speechSynthesis.cancel()
}
