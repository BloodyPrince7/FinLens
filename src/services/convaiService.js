/**
 * Convai conversation via the plain Character REST API
 * (POST /character/getResponse), proxied through the local Vite dev server
 * (see vite.config.js) so the API key never reaches client-side JS.
 *
 * This intentionally does NOT use Convai's Pixel Streaming / Experience
 * Embed product (@convai/experience-embed) - that requires the workspace's
 * domain to be on a paid-plan-only allowlist. The REST API has no such
 * requirement; it authenticates purely via the CONVAI-API-KEY header,
 * which is why it works unmodified on http://localhost:5173.
 *
 * The tradeoff: no avatar video/lip-sync and no Convai-generated audio -
 * see components/CharacterPanel.jsx (local SVG avatar) and
 * services/speechService.js (browser Web Speech API for voice) for how
 * those are covered instead.
 */

export const CONVAI_CHARACTER_ID = import.meta.env.VITE_CONVAI_CHARACTER_ID
export const CONVAI_API_KEY = import.meta.env.VITE_CONVAI_API_KEY

const PROXY_URL = '/convai-proxy/character/getResponse'

// There is no separate silent "update context" call in this REST API, and
// relying on Convai's own cross-turn session memory for the language
// instruction proved unreliable in practice (a short first message
// sometimes came back in the wrong language). So every single call
// rebuilds the full instruction + question, guaranteeing each turn is
// self-contained regardless of session persistence quirks.
export const LANGUAGE_INSTRUCTIONS = {
  en: 'Please respond only in simple English.',
  hi: 'कृपया केवल सरल हिंदी में देवनागरी लिपि का उपयोग करके उत्तर दें।',
}

export const SAFETY_INSTRUCTION =
  'You are Sahayak, an AI health companion for senior citizens. You are not a doctor. ' +
  'Explain prescriptions, reports, and general medical information in simple language. ' +
  'Never independently diagnose a disease, never prescribe medicine, and never recommend ' +
  'changing a dosage. Always encourage the user to consult a qualified doctor or pharmacist ' +
  'for medication decisions, and clearly advise seeking emergency care when symptoms sound urgent.'

export function buildDocumentContextMessage(extractedText) {
  return (
    'The user uploaded a medical document. Here is the extracted text:\n\n' +
    `${extractedText}\n\n` +
    'Explain this document in simple language. Do not prescribe medicines or change dosage.'
  )
}

function buildPrompt({ question, language, documentContext }) {
  const parts = [SAFETY_INSTRUCTION, LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en]
  if (documentContext) parts.push(documentContext)
  parts.push(`User question:\n${question}`)
  return parts.join('\n\n')
}

/**
 * Sends one conversational turn to Sahayak and returns the character's
 * reply, continuing the same Convai session across calls.
 *
 * @param {{ question: string, language: 'en' | 'hi', documentContext?: string, sessionId?: string }} params
 * @returns {Promise<{ text: string, sessionId: string }>}
 */
export async function sendMessage({ question, language, documentContext, sessionId }) {
  const prompt = buildPrompt({ question, language, documentContext })

  const formData = new FormData()
  formData.append('userText', prompt)
  formData.append('charID', CONVAI_CHARACTER_ID)
  formData.append('sessionID', sessionId || '-1')
  formData.append('voiceResponse', 'False')

  console.log('[Convai] Sending text message', { sessionId: sessionId || '-1' })
  const response = await fetch(PROXY_URL, { method: 'POST', body: formData })
  const data = await response.json()

  if (!response.ok) {
    console.error('[Convai] Error', data)
    throw new Error(data.error || data.ERROR || `Convai request failed (${response.status})`)
  }

  const text = (data.text || data.response || '').trim()
  console.log('[Convai] Character message received', { length: text.length })
  if (!text) {
    throw new Error('Sahayak did not return a response. Please try again.')
  }

  return { text, sessionId: data.sessionID }
}
