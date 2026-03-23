import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '../shared/Card'
import { formatCompactNumber } from '../../utils/formatters'

const palette = ['#7dd3fc', '#f5c451', '#8ce99a', '#ff8d7b', '#81a1ff']

function buildBacklogRanges(monthlyData) {
  const ranges = []
  let start = null
  for (const row of monthlyData) {
    if (row.backlog > 0 && start === null) {
      start = row.month
    } else if (row.backlog === 0 && start !== null) {
      ranges.push({ x1: start, x2: row.month - 1 })
      start = null
    }
  }
  if (start !== null) {
    ranges.push({ x1: start, x2: monthlyData.at(-1)?.month ?? start })
  }
  return ranges
}

export function SupplyDemandChart({ scenarios }) {
  const maxLen = Math.max(...scenarios.map((s) => s.simulationResult.monthlyData.length))
  const maxMonth = maxLen - 1

  const months = Array.from({ length: maxLen }, (_, index) => {
    const entry = { month: index }
    scenarios.forEach((scenario) => {
      const row = scenario.simulationResult.monthlyData[index]
      if (row) {
        entry[`${scenario.id}-supply`] = row.supply
        entry[`${scenario.id}-demand`] = row.demand
        entry[`${scenario.id}-max`] = row.maxCapacity
      }
    })
    return entry
  })

  const tickStep = maxMonth <= 12 ? 3 : 6
  const ticks = Array.from({ length: Math.floor(maxMonth / tickStep) + 1 }, (_, i) => i * tickStep)

  // Use primary scenario for reference annotations
  const primary = scenarios[0]
  const backlogRanges = buildBacklogRanges(primary.simulationResult.monthlyData)
  const events = primary.simulationResult.events

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-base font-semibold text-ink">Supply vs. Demand</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={months} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
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
              tickFormatter={formatCompactNumber}
              width={48}
            />
            <Tooltip
              contentStyle={{ background: '#10283b', border: '1px solid #21415b', fontSize: 12 }}
              labelFormatter={(v) => `Month ${v}`}
              formatter={(value, name) => [formatCompactNumber(value), name]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />

            {/* Backlog shading – highlight periods where demand exceed supply */}
            {backlogRanges.map((range, i) => (
              <ReferenceArea
                key={`backlog-${i}`}
                x1={range.x1}
                x2={range.x2}
                fill="#ff8d7b"
                fillOpacity={0.08}
                stroke="#ff8d7b"
                strokeOpacity={0.2}
                ifOverflow="visible"
              />
            ))}

            {/* Bottleneck event markers */}
            {events.map((event, i) => {
              const isDemand = event.eventType.toLowerCase().includes('demand')
              return (
                <ReferenceLine
                  key={`evt-${i}`}
                  x={event.month}
                  stroke={isDemand ? '#ff8d7b' : '#f5c451'}
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{
                    value: isDemand ? '▼D' : '▼S',
                    position: 'top',
                    fill: isDemand ? '#ff8d7b' : '#f5c451',
                    fontSize: 10,
                  }}
                />
              )
            })}

            {scenarios.flatMap((scenario, index) => [
              <Line
                key={`${scenario.id}-supply`}
                type="monotone"
                dataKey={`${scenario.id}-supply`}
                name={`${scenario.name} Supply`}
                stroke={palette[index % palette.length]}
                strokeWidth={2}
                dot={false}
              />,
              <Line
                key={`${scenario.id}-demand`}
                type="monotone"
                dataKey={`${scenario.id}-demand`}
                name={`${scenario.name} Demand`}
                stroke={palette[(index + 2) % palette.length]}
                strokeDasharray="6 4"
                strokeWidth={2}
                dot={false}
              />,
              <Line
                key={`${scenario.id}-max`}
                type="monotone"
                dataKey={`${scenario.id}-max`}
                name={`${scenario.name} Max Capacity`}
                stroke={palette[(index + 4) % palette.length]}
                strokeDasharray="2 6"
                strokeWidth={1}
                dot={false}
              />,
            ])}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for annotations */}
      {(backlogRanges.length > 0 || events.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
          {backlogRanges.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-4 rounded-sm bg-coral/30" />
              Backlog period
            </span>
          )}
          {events.some((e) => e.eventType.toLowerCase().includes('demand')) && (
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-coral">▼D</span>
              Demand bottleneck
            </span>
          )}
          {events.some((e) => !e.eventType.toLowerCase().includes('demand')) && (
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-gold">▼S</span>
              Supply bottleneck
            </span>
          )}
        </div>
      )}
    </Card>
  )
}
