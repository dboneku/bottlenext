import { useMemo } from 'react'
import { useSimulation } from '../../context/SimulationContext'
import { formatCurrency, formatNumber } from '../../utils/formatters'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'

const PERIOD_LABELS = { daily: 'day', weekly: 'week', monthly: 'month', annually: 'year' }

function KpiCard({ question, value, sub, tone = 'text-slate-900' }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-3 leading-relaxed">
        {question}
      </p>
      <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

export function OutputPanel() {
  const { state } = useSimulation()
  const model = useMemo(() => state, [state])

  if (!model.simulationResult) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        Fill in your numbers to see results.
      </div>
    )
  }

  const r = model.simulationResult
  const label = r.meta.capacityUnitLabel || 'units'
  const periodLabel = PERIOD_LABELS[r.meta.outputTimeframe] || 'month'
  const hiresPerMonth = Number(model.config.hiresPerMonth) || 1

  return (
    <div className="space-y-8">

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          If you had unlimited sales&hellip;
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            question="Maximum you can produce"
            value={`${formatNumber(r.maxOutputMonthly)} ${label}`}
            sub="per month (at full capacity)"
          />
          <KpiCard
            question="Revenue at max output"
            value={formatCurrency(r.maxRevenue)}
            sub="per month"
            tone="text-emerald-700"
          />
          <KpiCard
            question="Profit at max output"
            value={formatCurrency(r.maxProfit)}
            sub={`${model.config.profitMarginPct}% margin \u00b7 per month`}
            tone="text-emerald-700"
          />
        </div>
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Sales team gap
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            question="Reps needed to fill capacity"
            value={`${formatNumber(r.repsNeeded)} reps`}
            sub={`each selling ${formatNumber(model.config.unitsPerSalesperson)} ${label}/${periodLabel}`}
          />
          <KpiCard
            question="Reps you have today"
            value={`${formatNumber(model.config.salespeople)} reps`}
            sub={r.repsGap > 0 ? `${formatNumber(r.repsGap)} short of filling capacity` : 'Already covering full capacity'}
            tone={r.repsGap > 0 ? 'text-amber-700' : 'text-emerald-700'}
          />
          <KpiCard
            question="Reps to hire"
            value={r.repsGap > 0 ? `+${formatNumber(r.repsGap)} reps` : 'None needed'}
            sub={
              r.repsGap > 0
                ? `${hiresPerMonth}/month \u2192 ${r.monthsToMax} months to full capacity`
                : 'Your team can already fill your output'
            }
            tone={r.repsGap > 0 ? 'text-amber-700' : 'text-emerald-700'}
          />
        </div>
      </section>

      {r.repsGap > 0 && (
        <section>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Timeline to full capacity
          </p>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-6">
            <div className="flex flex-wrap items-baseline gap-8 mb-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1">Time to max</p>
                <p className="text-3xl font-semibold text-slate-900">
                  {r.monthsToMax}{' '}
                  <span className="text-base font-medium text-slate-500">months</span>
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1">Hiring plan</p>
                <p className="text-base font-semibold text-slate-900">{r.repsGap} reps</p>
                <p className="text-xs text-slate-500">{hiresPerMonth} per month for {r.monthsToMax} months</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={r.rampTimeline} margin={{ top: 4, right: 20, bottom: 4, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  label={{ value: 'months', position: 'insideBottomRight', offset: -4, fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => formatNumber(v)} width={60} />
                <Tooltip
                  formatter={(v, name) => [formatNumber(v), name]}
                  labelFormatter={(v) => `Month ${v}`}
                  contentStyle={{ fontSize: 12, borderColor: '#e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                <Line type="monotone" dataKey="capacity" name="Max capacity (ceiling)" stroke="#cbd5e1" strokeDasharray="6 3" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="demand" name="Sales demand (ramp)" stroke="#2563eb" dot={false} strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {r.repsGap === 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-base font-semibold text-emerald-800">Your sales team can already fill your capacity.</p>
          <p className="mt-1 text-sm text-emerald-700">
            {formatNumber(model.config.salespeople)} reps &times; {formatNumber(model.config.unitsPerSalesperson)} {label}/{periodLabel} = {formatNumber(model.config.salespeople * model.config.unitsPerSalesperson)} {label}/{periodLabel} demand &mdash; meets or exceeds your {formatNumber(r.maxOutputMonthly)} {label}/month ceiling.
          </p>
        </div>
      )}

    </div>
  )
}
