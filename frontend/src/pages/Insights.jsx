import { Activity, BarChart3, Sliders, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

const SECTIONS = [
  {
    to: '/health-score',
    icon: Activity,
    title: 'Financial Health Score',
    description: 'See your 0-100 wellness score with a factor-by-factor breakdown.',
  },
  {
    to: '/products',
    icon: Wallet,
    title: 'Loan & Product Evaluation',
    description: 'Compare loans, cards, and insurance against your Financial Twin.',
  },
  {
    to: '/simulator',
    icon: Sliders,
    title: 'What-If Simulator',
    description: 'Adjust income, rate, and tenure to see real-time impact.',
  },
  {
    to: '/transactions',
    icon: BarChart3,
    title: 'Transaction Analysis',
    description: 'Understand where your money goes each month.',
  },
]

export default function Insights() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Insights</h1>
        <p className="text-brand-ink/60">Understand. Evaluate. Decide.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.to}
            to={section.to}
            className="flex items-start gap-4 rounded-2xl border-2 border-brand-blue-light bg-white p-5 hover:border-brand-blue"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue-dark">
              <section.icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-semibold text-brand-ink">{section.title}</p>
              <p className="text-sm text-brand-ink/60">{section.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
