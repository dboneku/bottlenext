import { Card } from './Card'

export function KpiCard({ label, value, tone = 'text-ink' }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${tone}`}>{value}</p>
    </Card>
  )
}
