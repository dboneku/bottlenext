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
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { annualToMonthly, unitsToMonthly } from '../../utils/normalizers'

function computeHiringPayback(config) {
  const period = config.outputTimeframe || 'monthly'
  const monthlyCost = annualToMonthly(config.salespersonAnnualCost)
  const monthlyUnits = unitsToMonthly(config.unitsPerSalesperson, period)
  const revenuePerUnit = Number(config.revenuePerUnit) || 0
  const grossProfitRate = (Number(config.grossProfitPct) || 0) / 100
  const rampMonths = Number(config.rampTimeMonths) || 0
  const horizon = Math.min(Number(config.simulationHorizon) || 48, 48)

  let cumulativeCost = 0
  let cumulativeContribution = 0
  let breakEvenMonth = null
  const data = []

  for (let m = 0; m <= horizon; m++) {
    cumulativeCost += monthlyCost
    const output = m < rampMonths ? 0 : monthlyUnits
    const contribution = output * revenuePerUnit * grossProfitRate
    cumulativeContribution += contribution
    const net = cumulativeContribution - cumulativeCost
    if (net >= 0 && breakEvenMonth === null) breakEvenMonth = m
    data.push({
      month: m,
      cost: Math.round(cumulativeCost),
      contribution: Math.round(cumulativeContribution),
      net: Math.round(net),
    })
  }

  const monthlyContribution = monthlyUnits * revenuePerUnit * grossProfitRate
  const year1Net = data[12]?.net ?? null

  return { data, breakEvenMonth, monthlyCost, monthlyContribution, year1Net }
}

function buildWaterfallData(monthlyData) {
  return monthlyData.map((row) => ({
    month: row.month,
    laborPct:
      row.cumulativeRevenue > 0
        ? Math.round((row.cumulativeHeadcountCost / row.cumulativeRevenue) * 1000) / 10
        : 0,
    grossMarginPct:
      row.cumulativeRevenue > 0
        ? Math.round((row.cumulativeGrossProfit / row.cumulativeRevenue) * 1000) / 10
        : 0,
  }))
}

export function HiringModeler({ scenario }) {
  const config = scenario.config
  const { data, breakEvenMonth, monthlyCost, monthlyContribution, year1Net } = useMemo(
    () => computeHiringPayback(config),
    [config],
  )

  const simData = scenario.simulationResult?.monthlyData ?? []
  const waterfallData = useMemo(() => buildWaterfallData(simData), [simData])

  const maxMonth = data.length - 1
  const ticks = [0, 6, 12, 18, 24, 36, 48].filter((t) => t <= maxMonth)

  return (
    <div className="space-y-6">
      {/* Module 1: Per-rep hiring economics */}
      <div>
        <h3 className="mb-1 text-base font-semibold text-ink">Hiring Decision Modeler</h3>
        <p className="mb-4 text-sm text-muted">
          Per-rep economics based on {formatCurrency(config.salespersonAnnualCost)}/yr cost,{' '}
          {config.unitsPerSalesperson} units/{config.outputTimeframe || 'month'} at full productivity,{' '}
          {config.rampTimeMonths}-month ramp.
        </p>

        <div className="mb-5 grid grid-cols-4 gap-4">
          <KpiCard label="Monthly Rep Cost" value={formatCurrency(monthlyCost)} tone="text-coral" />
          <KpiCard
            label="Monthly GP Contribution"
            value={formatCurrency(monthlyContribution)}
            tone="text-lime"
          />
          <KpiCard
            label="Break-even Month"
            value={breakEvenMonth != null ? `Month ${breakEvenMonth}` : 'Beyond horizon'}
            tone={breakEvenMonth != null ? 'text-accent' : 'text-gold'}
          />
          <KpiCard
            label="Year 1 Net"
            value={year1Net != null ? formatCurrency(year1Net) : '—'}
            tone={year1Net != null && year1Net >= 0 ? 'text-lime' : 'text-coral'}
          />
        </div>

        <Card className="p-5">
          <h4 className="mb-4 text-sm font-semibold text-ink">
            Cumulative Cost vs. Gross Profit Contribution (per rep)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#21415b" strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  stroke="#7f9ab2"
                  tick={{ fill: '#7f9ab2', fontSize: 11 }}
                  tickFormatter={(v) => `M${v}`}
                  ticks={ticks}
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
                  labelFormatter={(v) => `Month ${v}`}
                  formatter={(v, name) => [formatCurrency(v), name]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {breakEvenMonth != null && (
                  <ReferenceLine
                    x={breakEvenMonth}
                    stroke="#7c3aed"
                    strokeDasharray="4 4"
                    label={{
                      value: `Break-even`,
                      fill: '#7c3aed',
                      fontSize: 11,
                      position: 'insideTopLeft',
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="cost"
                  name="Cumulative Cost"
                  stroke="#ff8d7b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="contribution"
                  name="Cumulative GP Contribution"
                  stroke="#8ce99a"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Module 2: Workforce cost waterfall */}
      {simData.length > 0 && (
        <div>
          <h3 className="mb-1 text-base font-semibold text-ink">Workforce Cost Waterfall</h3>
          <p className="mb-4 text-sm text-muted">
            Cumulative labor cost and gross margin as % of cumulative revenue over the simulation
            horizon. Labor cost squeezing toward gross margin signals an unsustainable headcount
            trajectory.
          </p>
          <Card className="p-5">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={waterfallData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="#21415b" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    stroke="#7f9ab2"
                    tick={{ fill: '#7f9ab2', fontSize: 11 }}
                    tickFormatter={(v) => `M${v}`}
                    ticks={ticks}
                  />
                  <YAxis
                    stroke="#7f9ab2"
                    tick={{ fill: '#7f9ab2', fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{ background: '#10283b', border: '1px solid #21415b', fontSize: 12 }}
                    labelFormatter={(v) => `Month ${v}`}
                    formatter={(v, name) => [`${v.toFixed(1)}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="grossMarginPct"
                    name="Gross Margin %"
                    stroke="#8ce99a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="laborPct"
                    name="Labor Cost %"
                    stroke="#ff8d7b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
