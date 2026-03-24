import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters'
import { Card } from '../shared/Card'

export function EventsTable({ scenario }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-slate-50 px-5 py-4">
        <h3 className="text-base font-semibold text-ink">Bottleneck Events</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-muted">
            <tr>
              {['Date', 'Month', 'Event Type', 'Supply', 'Demand', 'Utilization %', 'Backlog', 'Action Taken', 'CapEx Triggered', 'Revenue Impact'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenario.simulationResult.events.map((event, index) => (
              <tr key={`${event.eventType}-${index}`} className="border-t border-line/60 odd:bg-white even:bg-slate-50/60">
                <td className="px-4 py-3">{event.dateLabel}</td>
                <td className="px-4 py-3">{event.month}</td>
                <td className="px-4 py-3">{event.eventType}</td>
                <td className="px-4 py-3">{formatNumber(event.supply)}</td>
                <td className="px-4 py-3">{formatNumber(event.demand)}</td>
                <td className="px-4 py-3">{formatPercent(event.utilizationPct)}</td>
                <td className="px-4 py-3">{formatNumber(event.backlog)}</td>
                <td className="px-4 py-3">{event.actionTaken}</td>
                <td className="px-4 py-3">{formatCurrency(event.capexTriggered)}</td>
                <td className="px-4 py-3">{formatCurrency(event.revenueImpact)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
