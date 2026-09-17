import { AlertTriangle, Bot, Check, Download, FileWarning, FolderPlus, ShieldCheck, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageContext } from '../App'
import ImageUploader from '../components/ImageUploader'
import { analyzeDocument, downloadDocument, uploadDocument } from '../services/financeService'
import { extractTextFromDocument } from '../services/imageService'
import { useFinancialTwin } from '../context/FinancialTwinContext'

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
  uploading: 'Uploading document...',
  analyzing: 'Analyzing with Gemini Vision...',
  generating: 'Extracting financial insights...',
}

export default function Documents() {
  const { geminiModel } = usePageContext()
  const navigate = useNavigate()
  const { saveAssetToProfile } = useFinancialTwin()

  const [documentType, setDocumentType] = useState('bank_statement')
  const [image, setImage] = useState(null)
  const [stage, setStage] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [savedToProfile, setSavedToProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSelect(file) {
    setError('')
    setResult(null)
    setSavedToProfile(false)
    setImage({ file, previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null })

    setStage('uploading')
    let uploadResult
    try {
      uploadResult = await uploadDocument({ documentType, file })
    } catch (err) {
      setError(err.message || 'Unable to upload this document. Please try another file.')
      setStage(null)
      return
    }

    setStage('analyzing')
    try {
      const analysis = await analyzeDocument(uploadResult.id, geminiModel)
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
    setSavedToProfile(false)
    setError('')
  }

  async function handleSaveToProfile() {
    if (!result) return
    const record = {
      id: result.id,
      filename: result.filename || image?.file?.name || 'Financial document',
      documentType: result.document_type || documentType,
      summary: result.summary,
      fields: result.fields || {},
      risks: result.risks || [],
      savedAt: new Date().toISOString(),
    }
    if (!['loan_agreement', 'insurance_policy'].includes(documentType)) {
      setError('Only loan agreements and insurance policies can be added to the structured profile right now.')
      return
    }
    setIsSaving(true)
    setError('')
    try {
      await saveAssetToProfile(documentType, record)
      setSavedToProfile(true)
    } catch (err) {
      setError(err.message || 'Unable to save this document to your profile.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleAskAboutDocument() {
    if (!result) return
    navigate('/assistant', {
      state: {
        document: {
          filename: result.filename || image?.file?.name || 'Uploaded document',
          documentType: result.document_type || documentType,
          summary: result.summary,
          fields: result.fields || {},
          risks: result.risks || [],
        },
      },
    })
  }

  const profileDestination = documentType === 'loan_agreement'
    ? 'Loans'
    : documentType === 'insurance_policy'
      ? 'Insurance'
      : 'Documents'
  const ProfileIcon = documentType === 'loan_agreement'
    ? WalletCards
    : documentType === 'insurance_policy'
      ? ShieldCheck
      : FolderPlus
  const canSaveToProfile = ['loan_agreement', 'insurance_policy'].includes(documentType)

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
          <button
            type="button"
            onClick={() => downloadDocument(result.id, result.filename || image?.file?.name).catch((err) => setError(err.message))}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-blue-dark/20 px-3 py-2 text-sm font-semibold text-brand-blue-dark hover:bg-brand-blue-light"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download original
          </button>

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

          <div className="border-t border-brand-blue-light pt-4">
            <div className="mb-3">
              <h3 className="font-semibold text-brand-ink">What would you like to do?</h3>
              <p className="text-sm text-brand-ink/60">Choose where this document should go next.</p>
            </div>
            <div className={`grid gap-3 ${canSaveToProfile ? 'sm:grid-cols-2' : ''}`}>
              {canSaveToProfile && <div className="flex flex-col rounded-xl border-2 border-brand-blue-light bg-brand-beige p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-brand-blue-dark">
                  <ProfileIcon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h4 className="font-semibold text-brand-ink">Save to my {profileDestination}</h4>
                <p className="mt-1 flex-1 text-sm text-brand-ink/60">
                  Keep these extracted details in your Financial Twin for future comparisons and advice.
                </p>
                <button
                  type="button"
                  onClick={handleSaveToProfile}
                  disabled={savedToProfile || isSaving}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-blue-dark ring-1 ring-brand-blue-dark/20 hover:bg-brand-blue-light disabled:text-brand-green"
                >
                  {savedToProfile ? <Check className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
                  {savedToProfile ? `Saved to ${profileDestination}` : isSaving ? 'Saving...' : `Save to ${profileDestination}`}
                </button>
              </div>}

              <div className="flex flex-col rounded-xl bg-brand-blue-dark p-4 text-white shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </div>
                <h4 className="font-semibold">Ask FinLens AI</h4>
                <p className="mt-1 flex-1 text-sm text-white/70">
                  Ask anything about this document. FinLens will also use your income, expenses, loans, policies, and goals.
                </p>
                <button
                  type="button"
                  onClick={handleAskAboutDocument}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                >
                  <Bot className="h-4 w-4" />
                  Open AI conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
