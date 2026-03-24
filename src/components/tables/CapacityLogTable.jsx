import { formatCurrency, formatNumber } from '../../utils/formatters'
import { Card } from '../shared/Card'

export function CapacityLogTable({ scenario }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-slate-50 px-5 py-4">
        <h3 className="text-base font-semibold text-ink">Capacity Expansion Log</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-muted">
            <tr>
              {['Date', 'Type', 'Added', 'Cost', 'Ramp Completes'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenario.simulationResult.capacityLog.map((row, index) => (
              <tr key={`${row.type}-${index}`} className="border-t border-line/60 odd:bg-white even:bg-slate-50/60">
                <td className="px-4 py-3">{row.date}</td>
                <td className="px-4 py-3">{row.type}</td>
                <td className="px-4 py-3">
                  {formatNumber(row.unitsAdded)}{' '}
                  <span className="text-muted">{row.type === 'capacity' ? 'machines' : 'reps'}</span>
                </td>
                <td className="px-4 py-3">{formatCurrency(row.cost)}</td>
                <td className="px-4 py-3">{row.rampCompletes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
