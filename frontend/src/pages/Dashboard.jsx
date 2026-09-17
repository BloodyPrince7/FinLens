import { AlertTriangle, ShieldAlert, TrendingUp, Upload, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageContext } from '../App'
import CharacterPanel from '../components/CharacterPanel'
import ChatPanel from '../components/ChatPanel'
import ConvaiAvatarEmbed from '../components/ConvaiAvatarEmbed'
import OverviewCard from '../components/OverviewCard'
import { useFinancialTwin } from '../context/FinancialTwinContext'
import { buildDynamicContext } from '../services/convaiService'
import { calculateHealthScore } from '../services/financeService'
import { useFinLensConversation } from '../hooks/useFinLensConversation'

const DISCLAIMER =
  'FinLens AI provides educational financial information and personalized analysis for informational ' +
  'purposes only. It is not a substitute for professional financial advice, loan approval, tax advice, ' +
  'or investment recommendations.'

export default function Dashboard() {
  const { language } = usePageContext()
  const { twin, monthlySurplus } = useFinancialTwin()
  const conversation = useFinLensConversation(language)
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

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="flex min-h-[420px] flex-col gap-4 lg:col-span-3">
          <div className="rounded-2xl border-2 border-brand-blue-light bg-white px-4 py-2">
            <p className="text-lg font-semibold text-brand-ink">Ask FinLens AI</p>
            <p className="text-sm text-brand-ink/60">Your personal financial guide</p>
          </div>
          <CharacterPanel
            status={conversation.status}
            errorMessage={conversation.error}
            isMicSupported={conversation.isMicSupported}
            isMicActive={conversation.isMicActive}
            onToggleMic={conversation.toggleMic}
            isSpeechOutputSupported={conversation.isSpeechOutputSupported}
            onResetConversation={conversation.resetConversation}
          />
          <ConvaiAvatarEmbed />
        </div>
        <div className="min-h-[420px] lg:col-span-2">
          <ChatPanel
            messages={conversation.messages}
            onSendText={handleSendText}
            disabled={conversation.status === 'thinking'}
          />
        </div>
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
