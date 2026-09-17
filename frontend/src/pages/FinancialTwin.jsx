import { Download, FileText, ShieldCheck, WalletCards } from 'lucide-react'
import { useFinancialTwin } from '../context/FinancialTwinContext'
import { calculateHealthScore, downloadDocument } from '../services/financeService'

const NUMBER_FIELDS = [
  { key: 'monthlyIncome', label: 'Monthly Income (₹)' },
  { key: 'monthlyExpenses', label: 'Monthly Expenses (₹)' },
  { key: 'existingEmis', label: 'Existing EMI (₹)' },
  { key: 'savings', label: 'Savings (₹)' },
  { key: 'investments', label: 'Investments (₹)' },
]

export default function FinancialTwin() {
  const { twin, updateTwin, monthlySurplus, isProfileLoading, profileError } = useFinancialTwin()
  const health = calculateHealthScore({
    monthlyIncome: twin.monthlyIncome,
    monthlyExpenses: twin.monthlyExpenses,
    existingEmis: twin.existingEmis,
    savings: twin.savings,
  })

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Financial Twin</h1>
        <p className="text-brand-ink/60">Your personalized financial profile, used to personalize every answer.</p>
      </div>

      {profileError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{profileError}</p>}
      {isProfileLoading && (
        <p className="rounded-xl bg-brand-blue-light p-3 text-sm text-brand-blue-dark">Loading your saved profile...</p>
      )}

      <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-5">
        <label className="mb-1 block text-sm font-semibold text-brand-ink">Name</label>
        <input
          value={twin.name}
          onChange={(event) => updateTwin({ name: event.target.value })}
          className="mb-4 w-full rounded-lg border-2 border-brand-blue-dark/20 p-2.5 focus:border-brand-blue focus:outline-none"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {NUMBER_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="mb-1 block text-sm font-semibold text-brand-ink">{field.label}</label>
              <input
                type="number"
                min={0}
                value={twin[field.key]}
                onChange={(event) => updateTwin({ [field.key]: Number(event.target.value) || 0 })}
                className="w-full rounded-lg border-2 border-brand-blue-dark/20 p-2.5 focus:border-brand-blue focus:outline-none"
              />
            </div>
          ))}

          <div>
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

          <div>
            <label className="mb-1 block text-sm font-semibold text-brand-ink">Risk Tolerance</label>
            <select
              value={twin.riskTolerance}
              onChange={(event) => updateTwin({ riskTolerance: event.target.value })}
              className="w-full rounded-lg border-2 border-brand-blue-dark/20 p-2.5 focus:border-brand-blue focus:outline-none"
            >
              <option>Conservative</option>
              <option>Moderate</option>
              <option>Aggressive</option>
            </select>
          </div>
        </div>

        <label className="mb-1 mt-4 block text-sm font-semibold text-brand-ink">Financial Goals</label>
        <textarea
          value={twin.goals}
          onChange={(event) => updateTwin({ goals: event.target.value })}
          rows={2}
          placeholder="e.g. Buy a house in 5 years, build an emergency fund"
          className="w-full rounded-lg border-2 border-brand-blue-dark/20 p-2.5 focus:border-brand-blue focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border-2 border-brand-blue-light bg-brand-blue-dark p-5 text-white">
        <p className="text-lg font-semibold">{twin.name}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Monthly Surplus" value={`₹${monthlySurplus.toLocaleString('en-IN')}`} />
          <Stat label="Savings" value={`₹${twin.savings.toLocaleString('en-IN')}`} />
          <Stat
            label="Financial Health"
            value={health.score >= 65 ? 'Stable' : health.score >= 40 ? 'Moderate' : 'At Risk'}
          />
          <Stat
            label="Insurance / month"
            value={`₹${Number(twin.monthlyInsurancePremiums || 0).toLocaleString('en-IN')}`}
          />
        </div>
      </div>

      <ProfileCollection
        icon={WalletCards}
        title="My Loans"
        emptyText="Loan agreements you save after upload will appear here."
        items={twin.loans || []}
      />
      <ProfileCollection
        icon={ShieldCheck}
        title="My Insurance"
        emptyText="Insurance policies you save after upload will appear here."
        items={twin.insurancePolicies || []}
      />
      {(twin.savedDocuments || []).length > 0 && (
        <ProfileCollection
          icon={FileText}
          title="Other Documents"
          emptyText=""
          items={twin.savedDocuments}
        />
      )}
    </main>
  )
}

function ProfileCollection({ icon: Icon, title, emptyText, items }) {
  return (
    <section className="rounded-2xl border-2 border-brand-blue-light bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue-light text-brand-blue-dark">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-semibold text-brand-ink">{title}</h2>
          <p className="text-xs text-brand-ink/50">{items.length} saved</p>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl bg-brand-beige p-4 text-sm text-brand-ink/60">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-xl border border-brand-blue-light p-3">
              <p className="font-medium text-brand-ink">{item.filename}</p>
              <p className="mt-1 text-sm text-brand-ink/65">{item.summary}</p>
              {item.monthly_impact > 0 && (
                <p className="mt-2 text-sm font-semibold text-brand-blue-dark">
                  Monthly profile impact: ₹{Number(item.monthly_impact).toLocaleString('en-IN')}
                </p>
              )}
              <button
                type="button"
                onClick={() => downloadDocument(item.document_id || item.id, item.filename)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue-dark hover:text-brand-blue"
              >
                <Download className="h-3.5 w-3.5" /> Download document
              </button>
              {Object.keys(item.fields || {}).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {Object.entries(item.fields).filter(([, value]) => value).slice(0, 3).map(([key, value]) => (
                    <span key={key} className="rounded-full bg-brand-blue-light px-2 py-1 text-xs text-brand-blue-dark">
                      {key.replace(/_/g, ' ')}: {value}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  )
}
