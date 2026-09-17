import { useState } from 'react'
import { useFinancialTwin } from '../context/FinancialTwinContext'
import {
  AFFORDABILITY_COLOR,
  calculateAffordability,
  calculateDti,
  calculateEmi,
} from '../services/financeService'

const PRODUCTS = [
  { id: 'personal-loan', name: 'Personal Loan', kind: 'loan', amount: 500000, rate: 12, tenureMonths: 48, processingFee: '2%', benefits: 'No collateral required', risks: 'Higher interest than secured loans' },
  { id: 'car-loan', name: 'Car Loan', kind: 'loan', amount: 800000, rate: 9, tenureMonths: 60, processingFee: '1%', benefits: 'Lower interest, vehicle as collateral', risks: 'Vehicle can be repossessed on default' },
  { id: 'home-loan', name: 'Home Loan', kind: 'loan', amount: 3500000, rate: 8.5, tenureMonths: 240, processingFee: '0.5%', benefits: 'Tax benefits under Section 80C/24', risks: 'Long-term commitment, property as collateral' },
  { id: 'credit-card', name: 'Credit Card', kind: 'card', amount: 100000, rate: 36, processingFee: 'Annual fee applies', benefits: 'Rewards, short-term interest-free credit', risks: 'Very high interest if not paid in full' },
  { id: 'health-insurance', name: 'Health Insurance', kind: 'insurance', amount: 500000, rate: 0, premium: 12000, tenureMonths: 12, benefits: 'Covers hospitalization costs', risks: 'Exclusions and waiting periods apply' },
  { id: 'term-insurance', name: 'Term Insurance', kind: 'insurance', amount: 5000000, rate: 0, premium: 9000, tenureMonths: 12, benefits: 'High cover at low premium', risks: 'No maturity benefit if outlived' },
]

export default function Products() {
  const { twin } = useFinancialTwin()
  const [analyzedId, setAnalyzedId] = useState(null)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Loan &amp; Product Evaluation</h1>
        <p className="text-brand-ink/60">Check affordability against your Financial Twin before you apply.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((product) => {
          const isLoan = product.kind === 'loan'
          const isInsurance = product.kind === 'insurance'
          const emi = isLoan ? calculateEmi(product.amount, product.rate, product.tenureMonths) : 0
          const dti = isLoan ? calculateDti(twin.existingEmis, emi, twin.monthlyIncome) : 0
          const affordability = isLoan ? calculateAffordability(dti) : null
          const showAnalysis = analyzedId === product.id

          return (
            <div key={product.id} className="flex flex-col gap-2 rounded-2xl border-2 border-brand-blue-light bg-white p-4">
              <p className="text-lg font-semibold text-brand-ink">{product.name}</p>
              <p className="text-sm text-brand-ink/60">
                {isInsurance ? 'Sum Assured' : product.kind === 'card' ? 'Credit Limit' : 'Amount'}: ₹
                {product.amount.toLocaleString('en-IN')}
              </p>
              {isLoan && (
                <>
                  <p className="text-sm text-brand-ink/60">Interest Rate: {product.rate}%</p>
                  <p className="text-sm text-brand-ink/60">Tenure: {product.tenureMonths} Months</p>
                  <p className="text-sm font-semibold text-brand-blue-dark">
                    Estimated EMI: ₹{emi.toLocaleString('en-IN')}
                  </p>
                </>
              )}
              {isInsurance && (
                <p className="text-sm text-brand-ink/60">Premium: ₹{product.premium.toLocaleString('en-IN')}/year</p>
              )}
              {product.kind === 'card' && <p className="text-sm text-brand-ink/60">APR: {product.rate}%</p>}
              <p className="text-sm text-brand-ink/60">Processing Fee: {product.processingFee ?? '-'}</p>
              <p className="text-xs text-brand-green">Benefit: {product.benefits}</p>
              <p className="text-xs text-amber-600">Risk: {product.risks}</p>

              <button
                type="button"
                onClick={() => setAnalyzedId(product.id)}
                className="mt-2 rounded-lg bg-brand-blue-dark px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                Analyze For Me
              </button>

              {showAnalysis && isLoan && (
                <div className="mt-2 rounded-lg bg-brand-beige p-3 text-sm">
                  <p>
                    Debt-to-Income Ratio: <strong>{dti}%</strong>
                  </p>
                  <p>
                    Loan Affordability:{' '}
                    <strong className={AFFORDABILITY_COLOR[affordability]}>{affordability}</strong>
                  </p>
                  <p className="mt-1 text-xs text-brand-ink/50">
                    Educational estimate only - does not guarantee loan approval.
                  </p>
                </div>
              )}
              {showAnalysis && isInsurance && (
                <div className="mt-2 rounded-lg bg-brand-beige p-3 text-sm">
                  <p>
                    This premium is{' '}
                    <strong>{((product.premium / 12 / twin.monthlyIncome) * 100).toFixed(1)}%</strong> of
                    your monthly income.
                  </p>
                </div>
              )}
              {showAnalysis && product.kind === 'card' && (
                <div className="mt-2 rounded-lg bg-brand-beige p-3 text-sm">
                  <p>
                    Credit cards are revolving credit, not an installment loan - there is no fixed EMI.
                    Paying only the minimum due carries a high APR ({product.rate}%) on the remaining
                    balance.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
