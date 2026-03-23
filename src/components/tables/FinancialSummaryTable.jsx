import { formatCurrency } from '../../utils/formatters'
import { Card } from '../shared/Card'

export function FinancialSummaryTable({ scenario }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <h3 className="text-base font-semibold text-ink">Financial Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-panelAlt text-left text-muted">
            <tr>
              {['Period', 'Revenue', 'Gross Profit', 'Cumulative CapEx', 'Cumulative Headcount Cost', 'Lost Revenue', 'Net'].map((heading) => (
                <th key={heading} className="px-4 py-3 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {scenario.simulationResult.financialSummary.map((row) => (
              <tr key={row.period} className="border-t border-line/60">
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
