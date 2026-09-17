import { AlertTriangle, FileWarning } from 'lucide-react'
import { useState } from 'react'
import { usePageContext } from '../App'
import ImageUploader from '../components/ImageUploader'
import { buildDocumentContextMessage } from '../services/convaiService'
import { analyzeDocument, uploadDocument } from '../services/financeService'
import { extractTextFromDocument, validateImageFile } from '../services/imageService'
import { useFinLensConversation } from '../hooks/useFinLensConversation'

const DOCUMENT_TYPES = [
  { value: 'itr', label: 'Income Tax Return (ITR)' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'salary_slip', label: 'Salary Slip' },
  { value: 'loan_agreement', label: 'Loan Agreement' },
  { value: 'insurance_policy', label: 'Insurance Policy' },
  { value: 'investment_statement', label: 'Investment Statement' },
  { value: 'credit_report', label: 'Credit Report' },
]

const STAGE_LABELS = {
  uploading: 'Uploading...',
  reading: 'Reading document...',
  extracting: 'Extracting financial information...',
  analyzing: 'Analyzing financial profile...',
  generating: 'Generating insights...',
}

export default function Documents() {
  const { language } = usePageContext()
  const conversation = useFinLensConversation(language)

  const [documentType, setDocumentType] = useState('bank_statement')
  const [image, setImage] = useState(null)
  const [stage, setStage] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleSelect(file) {
    setError('')
    setResult(null)
    setImage({ file, previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null })

    setStage('uploading')
    let extraction
    if (file.type === 'application/pdf') {
      setStage('reading')
      try {
        const uploadResult = await uploadDocument({ documentType, file })
        extraction = { status: 'success', documentId: uploadResult.id }
      } catch (err) {
        setError(err.message)
        setStage(null)
        return
      }
    } else {
      setStage('reading')
      extraction = await extractTextFromDocument(file, documentType, () => {})
      if (extraction.status === 'error') {
        setError(extraction.error)
        setStage(null)
        return
      }
    }

    setStage('extracting')
    setStage('analyzing')
    try {
      const analysis = await analyzeDocument(extraction.documentId)
      setStage('generating')
      setResult(analysis)
    } catch (err) {
      setError(err.message || 'Unable to analyze this document right now.')
    } finally {
      setStage(null)
    }
  }

  function handleRemove() {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl)
    setImage(null)
    setResult(null)
    setError('')
  }

  function handleAskAboutDocument() {
    if (!result) return
    const message = buildDocumentContextMessage(result.summary, result.fields, result.risks)
    conversation.askFinLens(message, { displayText: 'Please explain this document to me.' })
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Upload Your Financial Documents</h1>
        <p className="text-brand-ink/60">
          Upload ITR, bank statements, loan agreements, or financial documents to receive personalized
          insights.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4">
        <label className="mb-2 block text-sm font-semibold text-brand-ink">Document type</label>
        <select
          value={documentType}
          onChange={(event) => setDocumentType(event.target.value)}
          className="w-full rounded-lg border-2 border-brand-blue-dark/20 p-2.5 text-base focus:border-brand-blue focus:outline-none"
        >
          {DOCUMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-base">{error}</p>
        </div>
      )}

      <ImageUploader
        image={image}
        onSelect={handleSelect}
        onRemove={handleRemove}
        onError={setError}
        isProcessing={Boolean(stage)}
        statusLabel={stage ? STAGE_LABELS[stage] : undefined}
      />

      {result && (
        <div className="space-y-3 rounded-2xl border-2 border-brand-blue-light bg-white p-5">
          <h2 className="text-lg font-semibold text-brand-ink">Summary</h2>
          <p className="text-brand-ink/80">{result.summary}</p>

          {Object.keys(result.fields || {}).length > 0 && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-brand-ink">Key details</h3>
              <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {Object.entries(result.fields).map(
                  ([key, value]) =>
                    value && (
                      <div key={key} className="rounded-lg bg-brand-beige p-2">
                        <dt className="text-xs uppercase tracking-wide text-brand-ink/50">
                          {key.replace(/_/g, ' ')}
                        </dt>
                        <dd className="font-medium text-brand-ink">{value}</dd>
                      </div>
                    ),
                )}
              </dl>
            </div>
          )}

          {result.risks?.length > 0 && (
            <div>
              <h3 className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                <FileWarning className="h-4 w-4" aria-hidden="true" />
                Important clauses to know
              </h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-brand-ink/80">
                {result.risks.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={handleAskAboutDocument}
            disabled={conversation.status === 'thinking'}
            className="rounded-lg bg-brand-blue-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Ask FinLens AI to explain this
          </button>

          {conversation.messages.length > 0 && (
            <div className="space-y-2 border-t border-brand-blue-light pt-3">
              {conversation.messages.slice(-2).map((message) => (
                <p
                  key={message.id}
                  className={message.role === 'user' ? 'font-medium text-brand-ink' : 'text-brand-ink/80'}
                >
                  {message.content}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
