import { useFinancialTwin } from '../context/FinancialTwinContext'
import { calculateHealthScore } from '../services/financeService'

const NUMBER_FIELDS = [
  { key: 'monthlyIncome', label: 'Monthly Income (₹)' },
  { key: 'monthlyExpenses', label: 'Monthly Expenses (₹)' },
  { key: 'existingEmis', label: 'Existing EMI (₹)' },
  { key: 'savings', label: 'Savings (₹)' },
  { key: 'investments', label: 'Investments (₹)' },
]

export default function FinancialTwin() {
  const { twin, updateTwin, monthlySurplus } = useFinancialTwin()
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
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Monthly Surplus" value={`₹${monthlySurplus.toLocaleString('en-IN')}`} />
          <Stat label="Savings" value={`₹${twin.savings.toLocaleString('en-IN')}`} />
          <Stat
            label="Financial Health"
            value={health.score >= 65 ? 'Stable' : health.score >= 40 ? 'Moderate' : 'At Risk'}
          />
        </div>
      </div>
    </main>
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
