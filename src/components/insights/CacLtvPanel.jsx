import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../shared/Card'
import { KpiCard } from '../shared/KpiCard'
import { formatCurrency, formatNumber } from '../../utils/formatters'

function computeCacLtv(config) {
  const salespersonAnnualCost = Number(config.salespersonAnnualCost) || 0
  const dealsPerRepPerYear = Number(config.dealsPerRepPerYear) || 1
  const averageDealValue = Number(config.averageDealValue) || 0
  const churnRatePct = Number(config.customerChurnRatePct) || 0
  const grossProfitRate = (Number(config.grossProfitPct) || 0) / 100

  const cac = salespersonAnnualCost / dealsPerRepPerYear

  // LTV = (annual GP per customer) / annual churn rate
  // If no churn entered, assume 10-year lifespan as a cap
  const churnRate = churnRatePct / 100
  const ltv =
    churnRate > 0
      ? (averageDealValue * grossProfitRate) / churnRate
      : averageDealValue * grossProfitRate * 10

  const ltvCacRatio = cac > 0 ? ltv / cac : 0

  // CAC payback = months to recover CAC from monthly GP per customer
  const monthlyGpPerCustomer = (averageDealValue * grossProfitRate) / 12
  const paybackMonths = monthlyGpPerCustomer > 0 ? Math.ceil(cac / monthlyGpPerCustomer) : null

  // Min deal value for LTV:CAC ≥ 1
  const minDealValue =
    grossProfitRate > 0 && churnRate > 0 && cac > 0
      ? (cac * churnRate) / grossProfitRate
      : null

  return { cac, ltv, ltvCacRatio, paybackMonths, minDealValue, grossProfitRate, churnRate }
}

function getRatioTone(ratio) {
  if (ratio >= 3) return 'text-lime'
  if (ratio >= 1) return 'text-gold'
  return 'text-coral'
}

function getRatioLabel(ratio) {
  if (ratio >= 5) return 'Excellent'
  if (ratio >= 3) return 'Healthy'
  if (ratio >= 1) return 'Marginal'
  return 'Unprofitable'
}

function buildSensitivityRows(config, cac) {
  const base = Number(config.averageDealValue) || 0
  const churnRate = (Number(config.customerChurnRatePct) || 0) / 100
  const gpRate = (Number(config.grossProfitPct) || 0) / 100

  return [0.5, 0.75, 1, 1.5, 2].map((factor) => {
    const dv = base * factor
    const ltv = churnRate > 0 ? (dv * gpRate) / churnRate : dv * gpRate * 10
    const ratio = cac > 0 ? ltv / cac : 0
    return {
      dealValue: Math.round(dv),
      ratio: ratio.toFixed(1),
      tone: getRatioTone(ratio),
      label: getRatioLabel(ratio),
      isCurrent: factor === 1,
    }
  })
}

export function CacLtvPanel({ scenario }) {
  const config = scenario.config
  const { cac, ltv, ltvCacRatio, paybackMonths, minDealValue } = useMemo(
    () => computeCacLtv(config),
    [config],
  )

  const barData = [
    { name: 'CAC', value: Math.round(cac), fill: '#ff8d7b' },
    { name: 'LTV', value: Math.round(ltv), fill: '#8ce99a' },
  ]

  const sensitivityRows = useMemo(() => buildSensitivityRows(config, cac), [config, cac])

  const ratioTone = getRatioTone(ltvCacRatio)
  const ratioLabel = getRatioLabel(ltvCacRatio)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-1 text-base font-semibold text-ink">
          Customer Acquisition Cost &amp; Lifetime Value
        </h3>
        <p className="mb-4 text-sm text-muted">
          Based on {formatCurrency(config.salespersonAnnualCost)}/yr rep cost,{' '}
          {formatNumber(config.dealsPerRepPerYear)} deals/rep/yr,{' '}
          {formatCurrency(config.averageDealValue)} avg deal value,{' '}
          {config.customerChurnRatePct}% annual churn.
        </p>

        <div className="mb-5 grid grid-cols-4 gap-4">
          <KpiCard label="CAC" value={formatCurrency(cac)} tone="text-coral" />
          <KpiCard label="LTV" value={formatCurrency(ltv)} tone="text-lime" />
          <KpiCard
            label="LTV : CAC"
            value={`${ltvCacRatio.toFixed(1)}× — ${ratioLabel}`}
            tone={ratioTone}
          />
          <KpiCard
            label="CAC Payback"
            value={paybackMonths != null ? `${paybackMonths} months` : '—'}
            tone="text-accent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h4 className="mb-4 text-sm font-semibold text-ink">CAC vs. LTV</h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#21415b" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="#7f9ab2"
                  tick={{ fill: '#7f9ab2', fontSize: 12 }}
                />
                <YAxis
                  stroke="#7f9ab2"
                  tick={{ fill: '#7f9ab2', fontSize: 11 }}
                  tickFormatter={(v) =>
                    Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                  width={56}
                />
                <Tooltip
                  contentStyle={{ background: '#10283b', border: '1px solid #21415b', fontSize: 12 }}
                  formatter={(v, name) => [formatCurrency(v), name]}
                />
                <Bar dataKey="value" name="Value" radius={[6, 6, 0, 0]}>
                  {barData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h4 className="mb-3 text-sm font-semibold text-ink">Deal Value Sensitivity</h4>
          <p className="mb-3 text-xs text-muted">LTV:CAC at different average deal values</p>
          <div className="space-y-2">
            {sensitivityRows.map(({ dealValue, ratio, tone, label, isCurrent }) => (
              <div
                key={dealValue}
                className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                  isCurrent ? 'border border-accent/30 bg-accent/5' : 'bg-panelAlt/50'
                }`}
              >
                <span className="text-sm text-ink">
                  {formatCurrency(dealValue)}
                  {isCurrent && (
                    <span className="ml-2 text-xs text-muted">← current</span>
                  )}
                </span>
                <span className={`text-sm font-semibold ${tone}`}>
                  {ratio}× — {label}
                </span>
              </div>
            ))}
          </div>
          {minDealValue != null && (
            <p className="mt-4 text-xs text-muted">
              Min deal value for LTV:CAC ≥ 1:{' '}
              <span className="font-semibold text-ink">{formatCurrency(minDealValue)}</span>
            </p>
          )}
        </Card>
      </div>

      {ltvCacRatio < 1 && (
        <div className="rounded-xl border border-coral/30 bg-coral/5 px-4 py-3 text-sm text-coral">
          <strong>Warning:</strong> LTV:CAC below 1× means each hire destroys more value than it
          creates at current deal values. Consider raising prices, improving close rates, or
          reducing churn before scaling headcount.
        </div>
      )}
      {ltvCacRatio >= 1 && ltvCacRatio < 3 && (
        <div className="rounded-xl border border-gold/30 bg-gold/5 px-4 py-3 text-sm text-gold">
          <strong>Note:</strong> LTV:CAC of 1–3× is marginal. A ratio of 3× or higher is
          generally considered healthy for scaling headcount confidently.
        </div>
      )}
    </div>
  )
}
