import {
  AlertTriangle,
  Bot,
  Check,
  CheckCircle2,
  Download,
  FileWarning,
  FolderPlus,
  Headphones,
  Languages,
  Loader2,
  ShieldCheck,
  Square,
  Volume2,
  WalletCards,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePageContext } from '../App'
import ImageUploader from '../components/ImageUploader'
import {
  analyzeDocument,
  downloadDocument,
  getHindiDocumentExplanation,
  uploadDocument,
} from '../services/financeService'
import { isSpeechSynthesisSupported, speak, stopSpeaking } from '../services/speechService'
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
  const { language, geminiModel } = usePageContext()
  const navigate = useNavigate()
  const { saveAssetToProfile } = useFinancialTwin()

  const [documentType, setDocumentType] = useState('bank_statement')
  const [image, setImage] = useState(null)
  const [stage, setStage] = useState(null)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [savedToProfile, setSavedToProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [hindiExplanation, setHindiExplanation] = useState(null)
  const [loadingHindi, setLoadingHindi] = useState(false)
  const [isSpeakingHindi, setIsSpeakingHindi] = useState(false)

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  async function handleSelect(file) {
    setError('')
    setResult(null)
    setHindiExplanation(null)
    setIsSpeakingHindi(false)
    stopSpeaking()
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
      if (language === 'hi') {
        handleFetchHindiExplanation(analysis.id)
      }
    } catch (err) {
      setError(err.message || 'Unable to analyze this document right now.')
    } finally {
      setStage(null)
    }
  }

  function handleRemove() {
    stopSpeaking()
    setIsSpeakingHindi(false)
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl)
    setImage(null)
    setResult(null)
    setHindiExplanation(null)
    setSavedToProfile(false)
    setError('')
  }

  async function handleFetchHindiExplanation(docId = result?.id) {
    if (!docId) return
    setLoadingHindi(true)
    setError('')
    try {
      const data = await getHindiDocumentExplanation(docId, geminiModel)
      setHindiExplanation(data)
    } catch (err) {
      setError(err.message || 'Unable to generate Hindi explanation right now.')
    } finally {
      setLoadingHindi(false)
    }
  }

  async function handleToggleHindiSpeech() {
    if (isSpeakingHindi) {
      stopSpeaking()
      setIsSpeakingHindi(false)
      return
    }

    if (!hindiExplanation) return

    const speechText = hindiExplanation.spoken_text || hindiExplanation.hindi_summary
    if (!speechText) return

    setIsSpeakingHindi(true)
    try {
      await speak(speechText, 'hi')
    } catch (err) {
      console.error('Speech error:', err)
    } finally {
      setIsSpeakingHindi(false)
    }
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

          {/* Hindi Reading & Voice Readout Section */}
          <div className="rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Languages className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-ink flex items-center gap-2">
                    <span>हिंदी में समझें और सुनें</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Hindi Readout
                    </span>
                  </h3>
                  <p className="text-xs text-brand-ink/65">
                    दस्तावेज़ का सरल सारांश, आंकड़े और आवाज में सुनने की सुविधा
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!hindiExplanation ? (
                  <button
                    type="button"
                    onClick={() => handleFetchHindiExplanation()}
                    disabled={loadingHindi}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {loadingHindi ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>हिंदी तैयार हो रही है...</span>
                      </>
                    ) : (
                      <>
                        <Languages className="h-3.5 w-3.5" />
                        <span>हिंदी विवरण देखें</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {isSpeechSynthesisSupported && (
                      <button
                        type="button"
                        onClick={handleToggleHindiSpeech}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer ${
                          isSpeakingHindi
                            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isSpeakingHindi ? (
                          <>
                            <Square className="h-3.5 w-3.5 fill-current" />
                            <span>रोकें (Stop)</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>हिंदी में सुनें</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {loadingHindi && !hindiExplanation && (
              <div className="py-6 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-emerald-600" />
                <p className="mt-2 text-sm text-brand-ink/70">
                  Gemini आपके दस्तावेज़ को सरल हिंदी में तैयार कर रहा है...
                </p>
              </div>
            )}

            {hindiExplanation && (
              <div className="mt-3.5 space-y-3.5">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    {hindiExplanation.hindi_title}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-brand-ink/90 font-medium">
                    {hindiExplanation.hindi_summary}
                  </p>
                </div>

                {hindiExplanation.key_points?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                      मुख्य बिंदु (Key Highlights)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {hindiExplanation.key_points.map((point, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-white/90 p-2.5 shadow-xs"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span className="text-xs font-semibold text-brand-ink/90 leading-snug">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hindiExplanation.risks?.length > 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3">
                    <h5 className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1.5">
                      <FileWarning className="h-3.5 w-3.5 text-amber-700" />
                      जरूरी सावधानियां एवं शर्तें
                    </h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-amber-950/90 font-medium">
                      {hindiExplanation.risks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {hindiExplanation.spoken_text && (
                  <div className="rounded-xl bg-white/80 border border-emerald-100 p-2.5 flex items-center justify-between gap-3 text-xs text-brand-ink/75">
                    <div className="flex items-center gap-2 truncate">
                      <Headphones className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        <strong className="text-brand-ink">ऑडियो टेक्स्ट:</strong> {hindiExplanation.spoken_text}
                      </span>
                    </div>
                    {isSpeechSynthesisSupported && (
                      <button
                        type="button"
                        onClick={handleToggleHindiSpeech}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 shrink-0 underline cursor-pointer"
                      >
                        {isSpeakingHindi ? 'रोकें' : 'सुनें'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

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
