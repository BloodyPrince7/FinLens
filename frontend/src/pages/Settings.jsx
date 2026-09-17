import { ShieldCheck } from 'lucide-react'
import { usePageContext } from '../App'
import { useFinancialTwin } from '../context/FinancialTwinContext'

const PRIVACY_NOTICE =
  'Your Financial Twin data and uploaded document text are stored only in your browser and this ' +
  'local backend during your session - documents are processed and not retained beyond what is ' +
  'needed to serve your requests.'

const DISCLAIMER =
  'FinLens AI provides educational financial information and personalized analysis for informational ' +
  'purposes only. It is not a substitute for professional financial advice, loan approval, tax advice, ' +
  'or investment recommendations.'

export default function Settings() {
  const { user } = usePageContext()
  const { twin, updateTwin } = useFinancialTwin()

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Settings</h1>
        <p className="text-brand-ink/60">Manage your profile and preferences.</p>
      </div>

      <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-5">
        <p className="text-sm font-semibold text-brand-ink">Account</p>
        <p className="mt-1 text-brand-ink/70">{user?.name}</p>
        <p className="text-sm text-brand-ink/50">{user?.email}</p>
      </div>

      <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-5">
        <label className="mb-1 block text-sm font-semibold text-brand-ink">Employment Type</label>
        <select
          value={twin.employmentType}
          onChange={(event) => updateTwin({ employmentType: event.target.value })}
          className="w-full rounded-lg border-2 border-brand-blue-dark/20 p-2.5 focus:border-brand-blue focus:outline-none"
        >
          <option>Salaried</option>
          <option>Self-Employed</option>
          <option>Business Owner</option>
          <option>Retired</option>
        </select>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-brand-blue-light p-4 text-brand-ink/80">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-blue-dark" aria-hidden="true" />
        <p className="text-sm">{PRIVACY_NOTICE}</p>
      </div>

      <div className="rounded-xl bg-brand-beige p-4 text-sm text-brand-ink/70">{DISCLAIMER}</div>
    </main>
  )
}
