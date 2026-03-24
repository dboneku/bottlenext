import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts'
import { Card } from '../shared/Card'
import { KpiCard } from '../shared/KpiCard'
import { formatCurrency, formatNumber } from '../../utils/formatters'

function computeLaunch(config) {
  const horizon = Number(config.simulationHorizon) || 48
  const launchMonth = Number(config.launchMonth) || 0
  const investment = Number(config.launchInvestment) || 0
  const revenuePerUnit = Number(config.launchRevenuePerUnit) || 0
  const grossProfitRate = (Number(config.launchGrossProfitPct) || 0) / 100
  const unitsPerMonth = Number(config.launchUnitsPerMonth) || 0
  const rampMonths = Number(config.launchRampMonths) || 0

  let cumulativeGp = 0
  let cumulativeRevenue = 0
  let breakEvenMonth = null
  const data = []

  for (let m = 0; m <= horizon; m++) {
    let units = 0
    if (m >= launchMonth) {
      const monthsSinceLaunch = m - launchMonth
      if (rampMonths === 0) {
        units = unitsPerMonth
      } else {
        units =
          monthsSinceLaunch >= rampMonths
            ? unitsPerMonth
            : unitsPerMonth * (monthsSinceLaunch / rampMonths)
      }
    }

    const revenue = units * revenuePerUnit
    const gp = revenue * grossProfitRate
    cumulativeRevenue += revenue
    cumulativeGp += gp
    const net = cumulativeGp - investment
    if (net >= 0 && breakEvenMonth === null) breakEvenMonth = m

    data.push({
      month: m,
      investment: Math.round(investment),
      cumulativeGp: Math.round(cumulativeGp),
      net: Math.round(net),
      monthlyRevenue: Math.round(revenue),
    })
  }

  const peakMonthlyRevenue = unitsPerMonth * revenuePerUnit
  const peakMonthlyGp = peakMonthlyRevenue * grossProfitRate

  return {
    data,
    breakEvenMonth,
    peakMonthlyRevenue,
    peakMonthlyGp,
    totalRevenue: cumulativeRevenue,
    totalGp: cumulativeGp,
    investment,
  }
}

export function NewProductLaunch({ scenario }) {
  const config = scenario.config

  if (!config.launchEnabled) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-10 text-center">
        <p className="text-base font-semibold text-ink">Product Launch Module</p>
        <p className="mt-2 text-sm text-muted">
          Enable &ldquo;Product Launch&rdquo; in the{' '}
          <span className="font-medium text-accent">Product Launch</span> section of the config
          panel to model a new product or service alongside your existing business.
        </p>
      </div>
    )
  }

  const {
    data,
    breakEvenMonth,
    peakMonthlyRevenue,
    peakMonthlyGp,
    totalGp,
    investment,
  } = useMemo(() => computeLaunch(config), [config])

  const maxMonth = data.length - 1
  const ticks = [0, 6, 12, 18, 24, 36, 48].filter((t) => t <= maxMonth)
  const roi = investment > 0 ? ((totalGp - investment) / investment) * 100 : null

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-base font-semibold text-ink">New Product / Service Launch</h3>

        <div className="mb-5 grid grid-cols-4 gap-4">
          <KpiCard
            label="Upfront Investment"
            value={formatCurrency(investment)}
            tone="text-coral"
          />
          <KpiCard
            label="Peak Monthly Revenue"
            value={formatCurrency(peakMonthlyRevenue)}
            tone="text-lime"
          />
          <KpiCard
            label="Break-even Month"
            value={breakEvenMonth != null ? `Month ${breakEvenMonth}` : 'Beyond horizon'}
            tone={breakEvenMonth != null ? 'text-accent' : 'text-gold'}
          />
          <KpiCard
            label="Horizon ROI"
            value={roi != null ? `${roi.toFixed(0)}%` : '—'}
            tone={roi != null && roi >= 0 ? 'text-lime' : 'text-coral'}
          />
        </div>
      </div>

      <Card className="p-5">
        <h4 className="mb-4 text-sm font-semibold text-ink">Cumulative Investment Recovery</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#dce3eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `M${v}`}
                ticks={ticks}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) =>
                  Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                }
                width={56}
              />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #dce3eb', fontSize: 12, color: '#111827' }}
                labelFormatter={(v) => `Month ${v}`}
                formatter={(v, name) => [formatCurrency(v), name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine
                x={config.launchMonth}
                stroke="#b45309"
                strokeDasharray="4 4"
                label={{
                  value: 'Launch',
                  fill: '#b45309',
                  fontSize: 11,
                  position: 'insideTopRight',
                }}
              />
              {breakEvenMonth != null && (
                <ReferenceLine
                  x={breakEvenMonth}
                  stroke="#4f46e5"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Break-even',
                    fill: '#4f46e5',
                    fontSize: 11,
                    position: 'insideTopLeft',
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="investment"
                name="Upfront Investment"
                stroke="#dc2626"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="cumulativeGp"
                name="Cumulative Gross Profit"
                stroke="#047857"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <h4 className="mb-4 text-sm font-semibold text-ink">Monthly Revenue Run Rate</h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#dce3eb" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) => `M${v}`}
                ticks={ticks}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(v) =>
                  Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                }
                width={56}
              />
              <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #dce3eb', fontSize: 12, color: '#111827' }}
                labelFormatter={(v) => `Month ${v}`}
                formatter={(v, name) => [formatCurrency(v), name]}
              />
              <ReferenceLine
                x={config.launchMonth}
                stroke="#b45309"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="monthlyRevenue"
                name="Monthly Revenue"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-line bg-panelAlt/50 px-4 py-3">
          <p className="text-xs text-muted">Peak monthly GP</p>
          <p className="mt-1 text-base font-semibold text-lime">{formatCurrency(peakMonthlyGp)}</p>
        </div>
        <div className="rounded-xl border border-line bg-panelAlt/50 px-4 py-3">
          <p className="text-xs text-muted">Total GP over horizon</p>
          <p className="mt-1 text-base font-semibold text-lime">{formatCurrency(totalGp)}</p>
        </div>
        <div className="rounded-xl border border-line bg-panelAlt/50 px-4 py-3">
          <p className="text-xs text-muted">Net after investment</p>
          <p
            className={`mt-1 text-base font-semibold ${
              totalGp - investment >= 0 ? 'text-lime' : 'text-coral'
            }`}
          >
            {formatCurrency(totalGp - investment)}
          </p>
        </div>
      </div>
    </div>
  )
}
