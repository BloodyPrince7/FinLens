import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, Cell, Tooltip, XAxis, YAxis } from 'recharts'
import { useFinancialTwin } from '../context/FinancialTwinContext'
import {
  AFFORDABILITY_COLOR,
  calculateAffordability,
  calculateDti,
  calculateEmi,
  calculateTotalInterest,
} from '../services/financeService'

function Slider({ label, value, onChange, min, max, step, format }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <label className="font-semibold text-brand-ink">{label}</label>
        <span className="text-brand-blue-dark">{format ? format(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-brand-blue-dark"
      />
    </div>
  )
}

export default function Simulator() {
  const { twin } = useFinancialTwin()
  const [income, setIncome] = useState(twin.monthlyIncome)
  const [expenses, setExpenses] = useState(twin.monthlyExpenses)
  const [rate, setRate] = useState(12)
  const [tenure, setTenure] = useState(48)
  const [existingEmi, setExistingEmi] = useState(twin.existingEmis)
  const [loanAmount, setLoanAmount] = useState(500000)
  const [prepayment, setPrepayment] = useState(0)

  const emi = useMemo(() => calculateEmi(loanAmount, rate, tenure), [loanAmount, rate, tenure])
  const totalInterest = useMemo(() => calculateTotalInterest(loanAmount, emi, tenure), [loanAmount, emi, tenure])
  const dti = useMemo(() => calculateDti(existingEmi, emi, income), [existingEmi, emi, income])
  const affordability = calculateAffordability(dti)
  const surplus = income - expenses - existingEmi - emi
  const effectiveTenure = prepayment > 0 ? Math.max(1, Math.round((loanAmount / (emi + prepayment)) * 1)) : tenure

  const cashFlowData = [
    { name: 'Income', value: income },
    { name: 'Expenses', value: expenses },
    { name: 'EMIs', value: existingEmi + emi },
    { name: 'Surplus', value: Math.max(0, surplus) },
  ]
  const principalVsInterest = [
    { name: 'Principal', value: loanAmount, fill: '#007bff' },
    { name: 'Interest', value: totalInterest, fill: '#00baf2' },
  ]

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">What If?</h1>
        <p className="text-brand-ink/60">
          Adjust income, expenses, and loan terms to instantly see the impact - no data leaves your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-2xl border-2 border-brand-blue-light bg-white p-5">
          <Slider
            label="Monthly Income"
            value={income}
            onChange={setIncome}
            min={10000}
            max={300000}
            step={1000}
            format={(v) => `₹${v.toLocaleString('en-IN')}`}
          />
          <Slider
            label="Monthly Expenses"
            value={expenses}
            onChange={setExpenses}
            min={0}
            max={200000}
            step={500}
            format={(v) => `₹${v.toLocaleString('en-IN')}`}
          />
          <Slider
            label="Existing EMI"
            value={existingEmi}
            onChange={setExistingEmi}
            min={0}
            max={100000}
            step={500}
            format={(v) => `₹${v.toLocaleString('en-IN')}`}
          />
          <Slider
            label="New Loan Amount"
            value={loanAmount}
            onChange={setLoanAmount}
            min={50000}
            max={5000000}
            step={10000}
            format={(v) => `₹${v.toLocaleString('en-IN')}`}
          />
          <Slider label="Interest Rate" value={rate} onChange={setRate} min={5} max={24} step={0.25} format={(v) => `${v}%`} />
          <Slider label="Loan Tenure" value={tenure} onChange={setTenure} min={6} max={360} step={6} format={(v) => `${v} months`} />
          <Slider
            label="Additional Monthly Prepayment"
            value={prepayment}
            onChange={setPrepayment}
            min={0}
            max={20000}
            step={500}
            format={(v) => `₹${v.toLocaleString('en-IN')}`}
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Estimated EMI" value={`₹${emi.toLocaleString('en-IN')}`} />
            <ResultCard label="Total Interest" value={`₹${totalInterest.toLocaleString('en-IN')}`} />
            <ResultCard label="Debt-to-Income" value={`${dti}%`} />
            <ResultCard label="Affordability" value={affordability} valueClass={AFFORDABILITY_COLOR[affordability]} />
          </div>

          <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-brand-ink">Cash Flow</p>
            <BarChart width={340} height={200} data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="#007bff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </div>

          <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4">
            <p className="mb-2 text-sm font-semibold text-brand-ink">Principal vs Interest</p>
            <PieChart width={340} height={200}>
              <Pie data={principalVsInterest} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {principalVsInterest.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </div>

          {prepayment > 0 && (
            <p className="text-sm text-brand-ink/70">
              With an extra ₹{prepayment.toLocaleString('en-IN')}/month, you could close this loan in
              roughly {effectiveTenure} months instead of {tenure}.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

function ResultCard({ label, value, valueClass = 'text-brand-blue-dark' }) {
  return (
    <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-3 text-center">
      <p className="text-xs uppercase tracking-wide text-brand-ink/50">{label}</p>
      <p className={`mt-1 text-lg font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}
