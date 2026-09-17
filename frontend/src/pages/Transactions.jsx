import { AlertTriangle, Upload } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from 'recharts'
import { usePageContext } from '../App'
import { useFinLensConversation } from '../hooks/useFinLensConversation'

const CATEGORY_KEYWORDS = {
  EMIs: ['emi', 'loan'],
  Rent: ['rent'],
  Utilities: ['electricity', 'water bill', 'gas bill', 'utility', 'broadband', 'recharge'],
  Food: ['restaurant', 'zomato', 'swiggy', 'grocery', 'food'],
  Transport: ['uber', 'ola', 'fuel', 'petrol', 'metro', 'transport'],
  Shopping: ['amazon', 'flipkart', 'myntra', 'shopping', 'mall'],
  Entertainment: ['netflix', 'prime video', 'hotstar', 'spotify', 'movie', 'entertainment'],
  Healthcare: ['pharmacy', 'hospital', 'clinic', 'medical', 'health'],
  Investments: ['mutual fund', 'sip', 'stocks', 'investment', 'zerodha', 'groww'],
}
const CATEGORY_COLORS = ['#002970', '#007bff', '#00baf2', '#16a34a', '#f59e0b', '#dc2626', '#6366f1', '#0ea5e9', '#84cc16']

function categorize(description) {
  const lower = description.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category
  }
  return 'Other'
}

/**
 * Supports the two common bank-export shapes:
 * 1. date, description, amount        (signed: negative = debit/expense)
 * 2. date, description, amount, type  (type: Cr/Credit = income, Dr/Debit = expense)
 * Column 4 is optional - if present, it overrides the sign convention,
 * since some exports give all-positive amounts with a separate type column.
 */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  const rows = lines.slice(1).map((line) => {
    const [date, description = '', amountRaw = '0', typeRaw = ''] = line.split(',')
    let amount = parseFloat(amountRaw.replace(/[^0-9.-]/g, '')) || 0
    const type = typeRaw.trim().toLowerCase()
    if (type.startsWith('cr')) amount = Math.abs(amount)
    else if (type.startsWith('dr')) amount = -Math.abs(amount)
    return { date: date?.trim(), description: description.trim(), amount, category: categorize(description) }
  })
  return rows.filter((row) => row.description)
}

export default function Transactions() {
  const { language } = usePageContext()
  const conversation = useFinLensConversation(language)
  const inputRef = useRef(null)
  const [transactions, setTransactions] = useState([])
  const [error, setError] = useState('')

  const summary = useMemo(() => {
    const income = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const byCategory = {}
    for (const t of transactions) {
      if (t.amount >= 0) continue
      byCategory[t.category] = (byCategory[t.category] || 0) + Math.abs(t.amount)
    }
    const categoryData = Object.entries(byCategory).map(([name, value], i) => ({
      name,
      value: Math.round(value),
      fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }))
    const large = transactions.filter((t) => Math.abs(t.amount) > 20000)
    const descriptionCounts = {}
    for (const t of transactions) descriptionCounts[t.description] = (descriptionCounts[t.description] || 0) + 1
    const recurring = Object.entries(descriptionCounts).filter(([, count]) => count >= 2)

    return { income, expenses, categoryData, large, recurring }
  }, [transactions])

  function handleFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rows = parseCsv(String(reader.result))
        if (rows.length === 0) throw new Error('empty')
        setTransactions(rows)
      } catch {
        setError('We could not extract readable text. Please upload a clearer document.')
      }
    }
    reader.onerror = () => setError('Unable to process this document. Please try another file.')
    reader.readAsText(file)
  }

  function handleAskAi() {
    const top3 = [...summary.categoryData].sort((a, b) => b.value - a.value).slice(0, 3)
    const question =
      `Based on my transactions, my top spending categories are: ${top3.map((c) => `${c.name} (₹${c.value})`).join(', ')}. ` +
      'Where am I spending the most, and how can I reduce my monthly expenses?'
    conversation.askFinLens(question)
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4 px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-ink">Transaction Analysis</h1>
        <p className="text-brand-ink/60">Upload a bank statement CSV (date, description, amount) to see where your money goes.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-red-800" role="alert">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
          <p className="text-base">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-blue-dark/40 bg-white p-6 text-brand-ink hover:border-brand-blue"
      >
        <Upload className="h-5 w-5" aria-hidden="true" />
        Upload Transaction CSV
        <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
      </button>

      {transactions.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Income Credits" value={summary.income} tone="success" />
            <StatCard label="Total Expenses" value={summary.expenses} tone="warning" />
            <StatCard label="Large Transactions" value={summary.large.length} isCount />
            <StatCard label="Recurring Payments" value={summary.recurring.length} isCount />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-brand-ink">Category-wise Expenses</p>
              <PieChart width={320} height={220}>
                <Pie data={summary.categoryData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {summary.categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-brand-ink">Monthly Spending Breakdown</p>
              <BarChart width={320} height={220} data={summary.categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="value" fill="#007bff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAskAi}
            disabled={conversation.status === 'thinking'}
            className="self-start rounded-lg bg-brand-blue-dark px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Ask AI About My Spending
          </button>

          {conversation.messages.length > 0 && (
            <div className="space-y-2 rounded-2xl border-2 border-brand-blue-light bg-white p-4">
              {conversation.messages.map((message) => (
                <p
                  key={message.id}
                  className={message.role === 'user' ? 'font-medium text-brand-ink' : 'text-brand-ink/80'}
                >
                  {message.content}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}

function StatCard({ label, value, tone, isCount }) {
  const toneClass = tone === 'success' ? 'text-brand-green' : tone === 'warning' ? 'text-amber-600' : 'text-brand-blue-dark'
  return (
    <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4 text-center">
      <p className="text-xs uppercase tracking-wide text-brand-ink/50">{label}</p>
      <p className={`mt-1 text-lg font-bold ${toneClass}`}>
        {isCount ? value : `₹${Math.round(value).toLocaleString('en-IN')}`}
      </p>
    </div>
  )
}
