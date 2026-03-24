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

const revenueColors = ['#047857', '#065f46', '#059669', '#064e3b', '#10b981']
const gpColors = ['#1d4ed8', '#1e40af', '#2563eb', '#1e3a8a', '#3b82f6']
const lostColors = ['#dc2626', '#b91c1c', '#ef4444', '#991b1b', '#f87171']

function buildData(scenarios) {
  const maxLen = Math.max(...scenarios.map((s) => s.simulationResult.monthlyData.length))
  return Array.from({ length: maxLen }, (_, i) => {
    const entry = { month: i }
    scenarios.forEach((s) => {
      const row = s.simulationResult.monthlyData[i]
      if (row) {
        entry[`${s.id}-rev`] = row.cumulativeRevenue
        entry[`${s.id}-gp`] = row.cumulativeGrossProfit
        entry[`${s.id}-lost`] = row.cumulativeLostRevenue
      }
    })
    return entry
  })
}

export function FinancialChart({ scenarios }) {
  const data = buildData(scenarios)
  const maxMonth = data.length - 1
  const tickStep = maxMonth <= 12 ? 3 : 6
  const ticks = Array.from({ length: Math.floor(maxMonth / tickStep) + 1 }, (_, i) => i * tickStep)

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-base font-semibold text-ink">Revenue &amp; Gross Profit</h3>
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
                key={`${s.id}-rev`}
                type="monotone"
                dataKey={`${s.id}-rev`}
                name={scenarios.length > 1 ? `${s.name} Revenue` : 'Revenue'}
                stroke={revenueColors[i % revenueColors.length]}
                strokeWidth={2}
                dot={false}
              />,
              <Line
                key={`${s.id}-gp`}
                type="monotone"
                dataKey={`${s.id}-gp`}
                name={scenarios.length > 1 ? `${s.name} Gross Profit` : 'Gross Profit'}
                stroke={gpColors[i % gpColors.length]}
                strokeWidth={2}
                strokeDasharray="5 2"
                dot={false}
              />,
              <Line
                key={`${s.id}-lost`}
                type="monotone"
                dataKey={`${s.id}-lost`}
                name={scenarios.length > 1 ? `${s.name} Lost Revenue` : 'Lost Revenue'}
                stroke={lostColors[i % lostColors.length]}
                strokeWidth={1.5}
                strokeDasharray="2 4"
                dot={false}
              />,
            ])}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
