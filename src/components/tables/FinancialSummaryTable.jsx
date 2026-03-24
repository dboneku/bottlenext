import { formatCurrency } from '../../utils/formatters'
import { Card } from '../shared/Card'

export function FinancialSummaryTable({ scenario }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line bg-slate-50 px-5 py-4">
        <h3 className="text-base font-semibold text-ink">Financial Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-muted">
            <tr>
              {['Period', 'Revenue', 'Gross Profit', 'Cumulative CapEx', 'Cumulative Headcount Cost', 'Lost Revenue', 'Net'].map((heading) => (
                <th key={heading} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenario.simulationResult.financialSummary.map((row) => (
              <tr key={row.period} className="border-t border-line/60 odd:bg-white even:bg-slate-50/60">
                <td className="px-4 py-3">{row.period}</td>
                <td className="px-4 py-3">{formatCurrency(row.revenue)}</td>
                <td className="px-4 py-3">{formatCurrency(row.grossProfit)}</td>
                <td className="px-4 py-3">{formatCurrency(row.cumulativeCapex)}</td>
                <td className="px-4 py-3">{formatCurrency(row.cumulativeHeadcountCost)}</td>
                <td className="px-4 py-3">{formatCurrency(row.lostRevenue)}</td>
                <td className="px-4 py-3">{formatCurrency(row.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
