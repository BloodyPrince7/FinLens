import { RadialBar, RadialBarChart } from 'recharts'
import { useFinancialTwin } from '../context/FinancialTwinContext'
import { calculateHealthScore } from '../services/financeService'

export default function HealthScore() {
  const { twin } = useFinancialTwin()
  const health = calculateHealthScore({
    monthlyIncome: twin.monthlyIncome,
    monthlyExpenses: twin.monthlyExpenses,
    existingEmis: twin.existingEmis,
    savings: twin.savings,
  })

  const chartData = [{ name: 'score', value: health.score, fill: '#00baf2' }]

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Financial Health Score</h1>
        <p className="text-brand-ink/60">
          An AI-generated educational financial wellness indicator - not a regulated credit score.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-brand-blue-light bg-white p-6">
        <RadialBarChart
          width={220}
          height={220}
          innerRadius="70%"
          outerRadius="100%"
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" cornerRadius={12} background={{ fill: '#e5e9f0' }} max={100} />
        </RadialBarChart>
        <p className="-mt-32 text-4xl font-bold text-brand-blue-dark">{health.score}</p>
        <p className="-mt-1 text-sm text-brand-ink/50">out of 100</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <FactorCard label="Income Stability" value={health.incomeStability} />
        <FactorCard label="Savings" value={health.savings} />
        <FactorCard label="Debt Burden" value={health.debtBurden} />
        <FactorCard label="Cash Flow" value={health.cashFlow} />
      </div>
    </main>
  )
}

function FactorCard({ label, value }) {
  return (
    <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-brand-ink/50">{label}</p>
      <p className="mt-1 text-lg font-bold text-brand-ink">{value}</p>
    </div>
  )
}
