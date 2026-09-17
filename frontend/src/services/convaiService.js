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
 * See components/ConvaiAvatarEmbed.jsx for the real Pixel Streaming
 * character's public preview link, kept as a secondary "open in new tab"
 * option using the same Experience ID.
 */

export const CONVAI_CHARACTER_ID = import.meta.env.VITE_CONVAI_CHARACTER_ID
export const CONVAI_API_KEY = import.meta.env.VITE_CONVAI_API_KEY

const PROXY_URL = '/convai-proxy/character/getResponse'

// There is no separate silent "update context" call in this REST API, and
// relying on Convai's own cross-turn session memory for instructions proved
// unreliable in practice. So every single call rebuilds the full
// instruction + live financial context + question, guaranteeing each turn
// is self-contained regardless of session persistence quirks.
export const LANGUAGE_INSTRUCTIONS = {
  en: 'Please respond only in simple English.',
  hi: 'कृपया केवल सरल हिंदी में देवनागरी लिपि का उपयोग करके उत्तर दें।',
}

export const SAFETY_INSTRUCTION =
  'You are FinLens AI, a professional, empathetic, and transparent AI financial companion. ' +
  'Explain financial documents, loans, and money concepts in simple language, and immediately ' +
  'explain any jargon you must use. Use the user\'s Financial Twin profile and any uploaded ' +
  'document insights provided below to personalize your answers. Never guarantee loan approval, ' +
  'never give regulated investment/tax advice, and never present the Financial Health Score as an ' +
  'official credit score - it is an educational wellness indicator only. Always note that this is ' +
  'educational guidance, not professional financial, tax, or legal advice.'

/** Matches the spec's example dynamic-context format exactly. */
export function buildDynamicContext({ twin, product, documentInsights }) {
  const parts = []

  if (twin) {
    const surplus = twin.monthlyIncome - twin.monthlyExpenses - twin.existingEmis
    parts.push(
      `User Profile:\nMonthly Income: ₹${twin.monthlyIncome.toLocaleString('en-IN')}\n` +
        `Monthly Expenses: ₹${twin.monthlyExpenses.toLocaleString('en-IN')}\n` +
        `Existing EMI: ₹${twin.existingEmis.toLocaleString('en-IN')}\n` +
        `Monthly Surplus: ₹${surplus.toLocaleString('en-IN')}`,
    )
  }

  if (product) {
    parts.push(
      `Selected Product:\n${product.name} ₹${Number(product.amount).toLocaleString('en-IN')}\n` +
        `Interest Rate: ${product.rate}%\nTenure: ${product.tenureMonths} Months\n` +
        `Estimated EMI: ₹${Number(product.emi).toLocaleString('en-IN')}`,
    )
  }

  if (documentInsights) {
    parts.push(`Document Insights:\n${documentInsights}`)
  }

  return parts.join('\n\n')
}

export function buildDocumentContextMessage(documentSummary, fields, risks) {
  const fieldLines = Object.entries(fields || {})
    .filter(([, value]) => value)
    .map(([key, value]) => `- ${key.replace(/_/g, ' ')}: ${value}`)
    .join('\n')
  const riskLines = (risks || []).map((r) => `- ${r}`).join('\n')

  return (
    'The user uploaded a financial document. Here is what was extracted:\n\n' +
    `Summary: ${documentSummary}\n\n` +
    (fieldLines ? `Key details:\n${fieldLines}\n\n` : '') +
    (riskLines ? `Flagged items:\n${riskLines}\n\n` : '') +
    'Explain this document in simple language and highlight anything important the user should know. ' +
    'Do not guarantee loan approval or give definitive tax/investment advice.'
  )
}

function buildPrompt({ question, language, dynamicContext }) {
  const parts = [SAFETY_INSTRUCTION, LANGUAGE_INSTRUCTIONS[language] ?? LANGUAGE_INSTRUCTIONS.en]
  if (dynamicContext) parts.push(dynamicContext)
  parts.push(`User question:\n${question}`)
  return parts.join('\n\n')
}

/**
 * Sends one conversational turn to FinLens AI and returns its reply,
 * continuing the same Convai session across calls.
 *
 * @param {{ question: string, language: 'en' | 'hi', dynamicContext?: string, sessionId?: string }} params
 * @returns {Promise<{ text: string, sessionId: string }>}
 */
export async function sendMessage({ question, language, dynamicContext, sessionId }) {
  const prompt = buildPrompt({ question, language, dynamicContext })

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
    throw new Error('FinLens AI did not return a response. Please try again.')
  }

  return { text, sessionId: data.sessionID }
}
