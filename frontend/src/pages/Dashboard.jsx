import { AlertTriangle, ArrowUpRight, ShieldAlert, Sparkles, TrendingUp, Upload, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageContext } from '../App'
import ChatPanel from '../components/ChatPanel'
import OverviewCard from '../components/OverviewCard'
import { useFinancialTwin } from '../context/FinancialTwinContext'
import { buildDynamicContext } from '../services/geminiService'
import { calculateHealthScore } from '../services/financeService'
import { useFinLensConversation } from '../hooks/useFinLensConversation'
import { geminiModelLabel } from '../services/geminiModels'

const DISCLAIMER =
  'FinLens AI provides educational financial information and personalized analysis for informational ' +
  'purposes only. It is not a substitute for professional financial advice, loan approval, tax advice, ' +
  'or investment recommendations.'

export default function Dashboard() {
  const { language, user, geminiModel } = usePageContext()
  const { twin, monthlySurplus } = useFinancialTwin()
  const conversation = useFinLensConversation(language, geminiModel)
  const health = calculateHealthScore({
    monthlyIncome: twin.monthlyIncome,
    monthlyExpenses: twin.monthlyExpenses,
    existingEmis: twin.existingEmis,
    savings: twin.savings,
  })

  function handleSendText(text) {
    const dynamicContext = buildDynamicContext({ twin })
    conversation.askFinLens(text, { dynamicContext })
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue-dark via-[#06418c] to-brand-blue p-6 text-white shadow-xl shadow-brand-blue-dark/10 sm:p-8">
        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border-[36px] border-white/5" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered financial intelligence
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Good to see you, {user?.name?.split(' ')[0]}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/70 sm:text-base">Your money, documents and financial decisions—understood in one secure place.</p>
          </div>
          <Link to="/documents" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-brand-blue-dark shadow-lg hover:bg-cyan-50">
            Analyze a document <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {conversation.error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-base">{conversation.error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <OverviewCard label="Monthly Income" value={twin.monthlyIncome} tone="success" />
        <OverviewCard label="Monthly Expenses" value={twin.monthlyExpenses} tone="default" />
        <OverviewCard label="Existing EMIs" value={twin.existingEmis} tone="warning" />
        <OverviewCard label="Available Balance" value={monthlySurplus} tone="success" />
        <OverviewCard label="Financial Health Score" value={health.score} suffix="/100" tone="brand" />
      </div>

      <div className="min-h-[430px]">
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-brand-blue-light bg-white px-4 py-3">
          <div>
            <p className="text-lg font-semibold text-brand-ink">Ask Gemini about your money</p>
            <p className="text-sm text-brand-ink/60">Answers include your live profile, loans and insurance context.</p>
          </div>
          <span className="hidden rounded-full bg-brand-blue-light px-3 py-1 text-xs font-semibold text-brand-blue-dark sm:block">Gemini {geminiModelLabel(geminiModel)}</span>
        </div>
        <ChatPanel
          messages={conversation.messages}
          onSendText={handleSendText}
          disabled={conversation.status === 'thinking'}
          isSpeaking={conversation.isSpeaking}
          onStopSpeaking={conversation.stopSpeaking}
          isVoiceOutputEnabled={conversation.isVoiceOutputEnabled}
          onToggleVoiceOutput={conversation.setVoiceOutputEnabled}
        />
      </div>

      <Link
        to="/documents"
        className="flex items-center justify-between rounded-2xl border-2 border-dashed border-brand-blue-light bg-white p-5 hover:border-brand-blue"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue-dark">
            <Upload className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold text-brand-ink">Upload Your Financial Documents</p>
            <p className="text-sm text-brand-ink/60">
              ITR, bank statements, loan agreements, salary slips, and more
            </p>
          </div>
        </div>
        <span className="rounded-lg bg-brand-blue-dark px-4 py-2 text-sm font-semibold text-white">
          Go to Documents
        </span>
      </Link>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/simulator"
          className="flex items-center gap-3 rounded-2xl border-2 border-brand-blue-light bg-white p-4 hover:border-brand-blue"
        >
          <TrendingUp className="h-6 w-6 text-brand-blue-dark" aria-hidden="true" />
          <div>
            <p className="font-semibold text-brand-ink">What If?</p>
            <p className="text-sm text-brand-ink/60">Simulate income, rate, and tenure changes</p>
          </div>
        </Link>
        <Link
          to="/products"
          className="flex items-center gap-3 rounded-2xl border-2 border-brand-blue-light bg-white p-4 hover:border-brand-blue"
        >
          <Wallet className="h-6 w-6 text-brand-blue-dark" aria-hidden="true" />
          <div>
            <p className="font-semibold text-brand-ink">Loan &amp; Product Evaluation</p>
            <p className="text-sm text-brand-ink/60">Check affordability before you apply</p>
          </div>
        </Link>
      </div>

      <footer className="flex items-start gap-2 rounded-xl bg-brand-blue-light p-4 text-brand-ink/80">
        <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue-dark" aria-hidden="true" />
        <p className="text-sm">{DISCLAIMER}</p>
      </footer>
    </main>
  )
}
