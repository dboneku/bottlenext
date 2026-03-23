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

const revenueColors = ['#8ce99a', '#6bb878', '#a8f0b5', '#50a060', '#c0f0c8']
const gpColors = ['#7dd3fc', '#5bb0d8', '#99deff', '#4499bb', '#bbe8ff']
const lostColors = ['#ff8d7b', '#cc6a5e', '#ffaa9c', '#bb5045', '#ffc0b0']

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
              tickFormatter={formatCompactCurrency}
              width={52}
            />
            <Tooltip
              contentStyle={{ background: '#10283b', border: '1px solid #21415b', fontSize: 12 }}
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
