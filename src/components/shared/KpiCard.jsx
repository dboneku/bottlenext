import { Card } from './Card'

export function KpiCard({ label, value, tone = 'text-ink' }) {
  return (
    <Card className="border-l-4 border-l-slate-300 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 text-[1.85rem] font-semibold tracking-tight ${tone}`}>{value}</p>
    </Card>
  )
}
