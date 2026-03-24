import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../shared/Card'
import { formatCompactCurrency } from '../../utils/formatters'

const capexColors = ['#b45309', '#92400e', '#d97706', '#78350f', '#c07a2a']
const headcountColors = ['#4f46e5', '#4338ca', '#6366f1', '#3730a3', '#818cf8']

function buildData(scenarios) {
  const maxLen = Math.max(...scenarios.map((s) => s.simulationResult.monthlyData.length))
  return Array.from({ length: maxLen }, (_, i) => {
    const entry = { month: i }
    scenarios.forEach((s) => {
      const row = s.simulationResult.monthlyData[i]
      if (row) {
        entry[`${s.id}-capex`] = row.cumulativeCapex
        entry[`${s.id}-hc`] = row.cumulativeHeadcountCost
      }
    })
    return entry
  })
}

export function CostChart({ scenarios }) {
  const data = buildData(scenarios)
  const maxMonth = data.length - 1
  const tickStep = maxMonth <= 12 ? 3 : 6
  const ticks = Array.from({ length: Math.floor(maxMonth / tickStep) + 1 }, (_, i) => i * tickStep)

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-base font-semibold text-ink">Cumulative CapEx &amp; Headcount Cost</h3>
      <div className="h-80">
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
              tickFormatter={formatCompactCurrency}
              width={52}
            />
            <Tooltip
              contentStyle={{ background: '#ffffff', border: '1px solid #dce3eb', fontSize: 12, color: '#111827' }}
              labelFormatter={(v) => `Month ${v}`}
              formatter={(value, name) => [formatCompactCurrency(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {scenarios.flatMap((s, i) => [
              <Line
                key={`${s.id}-capex`}
                type="monotone"
                dataKey={`${s.id}-capex`}
                name={scenarios.length > 1 ? `${s.name} CapEx` : 'CapEx'}
                stroke={capexColors[i % capexColors.length]}
                strokeWidth={2}
                dot={false}
              />,
              <Line
                key={`${s.id}-hc`}
                type="monotone"
                dataKey={`${s.id}-hc`}
                name={scenarios.length > 1 ? `${s.name} Headcount` : 'Headcount'}
                stroke={headcountColors[i % headcountColors.length]}
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
              />,
            ])}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
