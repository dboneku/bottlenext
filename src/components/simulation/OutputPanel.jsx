import { useMemo, useRef } from 'react'
import { useSimulation } from '../../context/SimulationContext'
import { SectionHeader } from '../shared/SectionHeader'
import { KpiCard } from '../shared/KpiCard'
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters'
import { SupplyDemandChart } from '../charts/SupplyDemandChart'
import { CostChart } from '../charts/CostChart'
import { FinancialChart } from '../charts/FinancialChart'
import { BottleneckTimelineChart } from '../charts/BottleneckTimelineChart'
import { EventsTable } from '../tables/EventsTable'
import { FinancialSummaryTable } from '../tables/FinancialSummaryTable'
import { CapacityLogTable } from '../tables/CapacityLogTable'
import { exportScenarioToCsv, exportScenarioToExcel, exportScenarioToPdf } from '../export/exporters'
import { HiringModeler } from '../insights/HiringModeler'
import { CacLtvPanel } from '../insights/CacLtvPanel'
import { NewProductLaunch } from '../insights/NewProductLaunch'

export function OutputPanel() {
  const { state, dispatch } = useSimulation()
  const exportRef = useRef(null)

  const visibleScenarios = useMemo(() => {
    const base = state.comparisonMode
      ? state.scenarios.filter(
          (scenario) => state.selectedComparisonIds.includes(scenario.id) && scenario.simulationResult,
        )
      : state.scenarios.filter(
          (scenario) => scenario.id === state.activeScenarioId && scenario.simulationResult,
        )
    return base
  }, [state])

  if (!visibleScenarios.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-panel/50 p-10 text-center text-muted">
        Configure the active scenario and run the simulation to populate charts and tables.
      </div>
    )
  }

  const primaryScenario = visibleScenarios[0]
  const latest = primaryScenario.simulationResult.monthlyData.at(-1)
  const cac =
    (Number(primaryScenario.config.salespersonAnnualCost) || 0) /
    Math.max(1, Number(primaryScenario.config.dealsPerRepPerYear) || 1)

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Simulation Output"
        subtitle="Charts, event logs, summary metrics, and client-side exports."
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => exportScenarioToPdf(primaryScenario, exportRef.current)}
              className="rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-ink"
            >
              PDF
            </button>
            <button
              type="button"
              onClick={() => exportScenarioToExcel(visibleScenarios)}
              className="rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-ink"
            >
              Excel
            </button>
            <button
              type="button"
              onClick={() => exportScenarioToCsv(visibleScenarios)}
              className="rounded-xl border border-line bg-panelAlt px-3 py-2 text-sm text-ink"
            >
              CSV
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-5 gap-4">
        <KpiCard label="Scenarios in View" value={formatNumber(visibleScenarios.length)} />
        <KpiCard label="Ending Backlog" value={formatNumber(latest.backlog)} tone="text-gold" />
        <KpiCard label="Cumulative Lost Revenue" value={formatCurrency(latest.cumulativeLostRevenue)} tone="text-coral" />
        <KpiCard label="Gross Profit" value={formatCurrency(latest.cumulativeGrossProfit)} tone="text-lime" />
        <KpiCard label="CAC" value={formatCurrency(cac)} tone="text-accent" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'charts', label: 'Charts' },
          { id: 'tables', label: 'Tables' },
          { id: 'summary', label: 'Summary' },
          { id: 'hiring', label: 'Hiring' },
          { id: 'unit-econ', label: 'Unit Econ' },
          { id: 'launch', label: 'Launch' },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => dispatch({ type: 'set-output-tab', payload: id })}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              state.ui.activeOutputTab === id ? 'bg-accent text-slate-950' : 'bg-panelAlt text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div ref={exportRef} className="space-y-6">
        {state.ui.activeOutputTab === 'charts' ? (
          <>
            <SupplyDemandChart scenarios={visibleScenarios} />
            <div className="grid grid-cols-2 gap-6">
              <CostChart scenarios={visibleScenarios} />
              <FinancialChart scenarios={visibleScenarios} />
            </div>
            <BottleneckTimelineChart scenario={primaryScenario} />
          </>
        ) : null}

        {state.ui.activeOutputTab === 'tables' ? (
          <>
            <EventsTable scenario={primaryScenario} />
            <FinancialSummaryTable scenario={primaryScenario} />
            <CapacityLogTable scenario={primaryScenario} />
          </>
        ) : null}

        {state.ui.activeOutputTab === 'summary' ? (
          <div className="grid gap-4">
            {visibleScenarios.map((scenario) => {
              const end = scenario.simulationResult.monthlyData.at(-1)
              const net = end.cumulativeGrossProfit - end.cumulativeCapex - end.cumulativeHeadcountCost
              return (
                <div key={scenario.id} className="rounded-2xl border border-line bg-panel p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{scenario.name}</h3>
                      <p className="mt-1 text-xs font-mono uppercase tracking-widest text-muted">
                        {scenario.config.simulationHorizon}-month horizon · {scenario.config.capacityUnitLabel}
                      </p>
                    </div>
                    {scenario.simulationResult.warnings.length > 0 && (
                      <div className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold">
                        {scenario.simulationResult.warnings.join(' ')}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div className="flex justify-between border-b border-line/40 pb-2">
                      <span className="text-muted">Bottleneck events</span>
                      <span className="font-semibold text-ink">{formatNumber(scenario.simulationResult.events.length)}</span>
                    </div>
                    <div className="flex justify-between border-b border-line/40 pb-2">
                      <span className="text-muted">Expansion actions</span>
                      <span className="font-semibold text-ink">{formatNumber(scenario.simulationResult.capacityLog.length)}</span>
                    </div>
                    <div className="flex justify-between border-b border-line/40 pb-2">
                      <span className="text-muted">Cumulative revenue</span>
                      <span className="font-semibold text-lime">{formatCurrency(end.cumulativeRevenue)}</span>
                    </div>
                    <div className="flex justify-between border-b border-line/40 pb-2">
                      <span className="text-muted">Gross profit</span>
                      <span className="font-semibold text-lime">{formatCurrency(end.cumulativeGrossProfit)}</span>
                    </div>
                    <div className="flex justify-between border-b border-line/40 pb-2">
                      <span className="text-muted">Total CapEx</span>
                      <span className="font-semibold text-gold">{formatCurrency(end.cumulativeCapex)}</span>
                    </div>
                    <div className="flex justify-between border-b border-line/40 pb-2">
                      <span className="text-muted">Headcount cost</span>
                      <span className="font-semibold text-gold">{formatCurrency(end.cumulativeHeadcountCost)}</span>
                    </div>
                    <div className="flex justify-between border-b border-line/40 pb-2">
                      <span className="text-muted">Lost revenue</span>
                      <span className="font-semibold text-coral">{formatCurrency(end.cumulativeLostRevenue)}</span>
                    </div>
                    <div className="flex justify-between border-b border-line/40 pb-2">
                      <span className="text-muted">Net contribution</span>
                      <span className={`font-semibold ${net >= 0 ? 'text-lime' : 'text-coral'}`}>{formatCurrency(net)}</span>
                    </div>
                  </div>

                  {scenario.simulationResult.events.length > 0 && (
                    <div className="mt-5">
                      <p className="mb-2 text-xs uppercase tracking-widest text-muted">First bottleneck</p>
                      <p className="text-sm text-ink">
                        <span className={scenario.simulationResult.events[0].eventType.toLowerCase().includes('demand') ? 'text-coral' : 'text-gold'}>
                          {scenario.simulationResult.events[0].eventType}
                        </span>
                        {' '}at {scenario.simulationResult.events[0].dateLabel} — utilization{' '}
                        {formatPercent(scenario.simulationResult.events[0].utilizationPct)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : null}

        {state.ui.activeOutputTab === 'hiring' ? (
          <HiringModeler scenario={primaryScenario} />
        ) : null}

        {state.ui.activeOutputTab === 'unit-econ' ? (
          <CacLtvPanel scenario={primaryScenario} />
        ) : null}

        {state.ui.activeOutputTab === 'launch' ? (
          <NewProductLaunch scenario={primaryScenario} />
        ) : null}
      </div>
    </div>
  )
}
