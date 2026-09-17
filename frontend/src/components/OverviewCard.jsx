const TONE_CLASSES = {
  default: 'text-brand-ink',
  success: 'text-brand-green',
  warning: 'text-amber-600',
  brand: 'text-brand-blue-dark',
}

export default function OverviewCard({ label, value, suffix, tone = 'default' }) {
  const formatted = suffix ? `${value}${suffix}` : `₹${Number(value).toLocaleString('en-IN')}`

  return (
    <div className="rounded-2xl border-2 border-brand-blue-light bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">{label}</p>
      <p className={`mt-1 text-xl font-bold ${TONE_CLASSES[tone] ?? TONE_CLASSES.default}`}>{formatted}</p>
    </div>
  )
}
