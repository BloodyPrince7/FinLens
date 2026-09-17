import { Loader2, Send, ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import ImageUploader from '../components/ImageUploader'
import LanguageSelector from '../components/LanguageSelector'
import Navbar from '../components/Navbar'
import QuestionBox from '../components/QuestionBox'
import ResponseCard from '../components/ResponseCard'
import { analyzeQuestion } from '../services/api'

const ASK_BUTTON_LABEL = {
  en: 'Ask Sahayak',
  hi: 'Sahayak से पूछें',
}

const ASKING_LABEL = {
  en: 'Asking Sahayak...',
  hi: 'पूछ रहे हैं...',
}

const DISCLAIMER = {
  en: 'Sahayak provides general health information and is not a replacement for a qualified doctor. Please consult a doctor or pharmacist before taking medication.',
  hi: 'Sahayak सामान्य स्वास्थ्य जानकारी प्रदान करता है और यह योग्य डॉक्टर का विकल्प नहीं है। दवा लेने से पहले कृपया डॉक्टर या फार्मासिस्ट से सलाह लें।',
}

export default function Assistant({ user, onLogout }) {
  const [language, setLanguage] = useState('en')
  const [image, setImage] = useState(null)
  const [question, setQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answer, setAnswer] = useState('')
  const [formError, setFormError] = useState('')
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    return () => {
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl)
    }
  }, [image])

  function handleSelectImage(file) {
    setFormError('')
    setImage((previous) => {
      if (previous?.previewUrl) URL.revokeObjectURL(previous.previewUrl)
      return { file, previewUrl: URL.createObjectURL(file) }
    })
  }

  function handleRemoveImage() {
    setImage((previous) => {
      if (previous?.previewUrl) URL.revokeObjectURL(previous.previewUrl)
      return null
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (isSubmitting) return

    if (!image) {
      setFormError('Please upload a prescription or medical report image before asking a question.')
      return
    }
    if (!question.trim()) {
      setFormError('Please enter your health-related question.')
      return
    }

    setIsSubmitting(true)
    setFormError('')
    setApiError('')
    setAnswer('')
    try {
      const data = await analyzeQuestion({ image: image.file, question: question.trim(), language })
      setAnswer(data.answer)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-beige">
      <Navbar userName={user.name} onLogout={onLogout} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-brand-ink">Language</h2>
            <LanguageSelector language={language} onChange={setLanguage} />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-brand-ink">
              Upload your prescription or medical report
            </h2>
            <ImageUploader
              image={image}
              onSelect={handleSelectImage}
              onRemove={handleRemoveImage}
              onError={setFormError}
            />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-brand-ink">Ask your question</h2>
            <QuestionBox question={question} onChange={setQuestion} language={language} />
          </section>

          {formError && (
            <p className="rounded-lg bg-red-50 p-3 text-lg text-red-800" role="alert">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-4 text-xl font-semibold text-white transition-colors hover:brightness-95 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-6 w-6" aria-hidden="true" />
            )}
            {isSubmitting ? ASKING_LABEL[language] : ASK_BUTTON_LABEL[language]}
          </button>
        </form>

        <div className="mt-6">
          <ResponseCard answer={answer} language={language} isLoading={isSubmitting} error={apiError} />
        </div>

        <footer className="mt-8 flex items-start gap-2 rounded-xl bg-brand-blue-light p-4 text-brand-ink/80">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue-dark" aria-hidden="true" />
          <p className="text-sm">{DISCLAIMER[language]}</p>
        </footer>
      </main>
    </div>
  )
}
