/**
 * Local, browser-only voice layer using the Web Speech API.
 *
 * Speech-to-text uses SpeechRecognition (mic input). Text-to-speech uses
 * speechSynthesis to read the AI's real text response aloud - this is the
 * browser's own synthesized voice, not Gemini-generated audio (that
 * required the streaming/LiveKit integrations this app no longer uses).
 * Both are feature-detected; callers should check `isSpeechRecognitionSupported`
 * / `isSpeechSynthesisSupported` before offering mic/voice-output controls.
 */
const SpeechRecognitionImpl = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null

export const isSpeechRecognitionSupported = Boolean(SpeechRecognitionImpl)
export const isSpeechSynthesisSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

const RECOGNITION_LOCALES = { en: 'en-IN', hi: 'hi-IN' }
const SYNTHESIS_LOCALES = { en: 'en-IN', hi: 'hi-IN' }

let recognizer = null
let currentSpeechResolver = null

/**
 * Strips raw markdown syntax, asterisks, bullet markers, and formatting symbols
 * so SpeechSynthesis reads text cleanly and naturally without saying "asterisk" or "star".
 *
 * @param {string} text
 * @param {'en' | 'hi'} [language='en']
 * @returns {string}
 */
export function formatTextForSpeech(text, language = 'en') {
  if (!text) return ''

  let clean = text
    // Remove markdown code blocks and inline code
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links but keep anchor text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold and italic markers (asterisks and underscores)
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/_{1,3}([^_]+)_{1,3}/g, '$1')
    // Remove strikethrough
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove blockquotes and list markers
    .replace(/^>\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Replace Rupee symbols with natural spoken words
    .replace(/₹\s*([0-9,]+(?:\.[0-9]+)?)/g, language === 'hi' ? '$1 रुपये' : '$1 rupees')
    .replace(/₹/g, language === 'hi' ? 'रुपये ' : 'rupees ')
    // Replace percent symbol
    .replace(/%/g, language === 'hi' ? ' प्रतिशत' : ' percent')
    // Strip any remaining asterisks, hashes, backticks, tildes, pipes, brackets
    .replace(/[*#`~|>\[\]{}]/g, ' ')
    // Normalize spaces and line breaks
    .replace(/\s+/g, ' ')
    .trim()

  return clean
}

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
 * Reads text aloud in the given language. Resolves when speech finishes or is cancelled.
 * @param {string} text
 * @param {'en' | 'hi'} language
 * @returns {Promise<void>}
 */
export function speak(text, language) {
  return new Promise((resolve) => {
    stopSpeaking()

    const cleanText = formatTextForSpeech(text, language)
    if (!isSpeechSynthesisSupported || !cleanText) {
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)
    const targetLocale = SYNTHESIS_LOCALES[language] ?? SYNTHESIS_LOCALES.en
    utterance.lang = targetLocale
    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find((v) => v.lang === targetLocale) ?? voices.find((v) => v.lang.startsWith(language))
    if (matchingVoice) utterance.voice = matchingVoice

    currentSpeechResolver = resolve

    utterance.onend = () => {
      if (currentSpeechResolver === resolve) {
        currentSpeechResolver = null
      }
      resolve()
    }
    utterance.onerror = (event) => {
      // Ignored canceled or interrupted errors gracefully when stopped by user
      if (currentSpeechResolver === resolve) {
        currentSpeechResolver = null
      }
      resolve()
    }

    window.speechSynthesis.speak(utterance)
  })
}

export function stopSpeaking() {
  if (currentSpeechResolver) {
    const r = currentSpeechResolver
    currentSpeechResolver = null
    r()
  }
  if (isSpeechSynthesisSupported) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Ignore
    }
  }
}
