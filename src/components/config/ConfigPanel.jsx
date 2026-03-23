import { FIELD_GROUPS, HORIZON_OPTIONS } from '../../utils/constants'
import { useSimulation } from '../../context/SimulationContext'
import { FormField } from '../shared/FormField'
import { Card } from '../shared/Card'
import { formatCompactNumber, formatPercent } from '../../utils/formatters'
import { unitsToMonthly } from '../../utils/normalizers'

const TIMEFRAME_LABELS = { daily: 'day', weekly: 'week', monthly: 'month', annually: 'year' }

const fieldMeta = {
  numberOfMachines: { label: 'Number of machines', help: 'Machines in operation at month 0', type: 'number' },
  unitsPerMachine: { label: 'Output per machine', help: 'Units produced per machine per period', type: 'number', rateField: true },
  maxMachines: { label: 'Max machines', help: 'Maximum machines before needing new infrastructure', type: 'number' },
  costPerCapacityUnit: { label: 'Cost per machine', help: 'One-time CapEx to add one machine', type: 'number' },
  salespeople: { label: 'Number of salespeople', help: 'Initial sales headcount', type: 'number' },
  unitsPerSalesperson: { label: 'Units per rep', help: 'Average units sold per rep per period', type: 'number', rateField: true },
  salespersonAnnualCost: { label: 'Annual rep cost', help: 'Optional — used for cost chart only', type: 'number' },
  organicDemandGrowthRate: { label: 'Organic demand growth %', help: 'Annual growth independent of hires', type: 'number' },
  revenuePerUnit: { label: 'Revenue per unit', help: 'Selling price per unit', type: 'number' },
  grossProfitPct: { label: 'Gross profit %', help: 'Blended gross margin', type: 'number' },
  simulationHorizon: { label: 'Simulation horizon', help: 'Projection duration', type: 'horizon' },
  rampTimeMonths: { label: 'Ramp time (months)', help: 'Zero output until ramp ends', type: 'number' },
  backlogToleranceMonths: { label: 'Backlog tolerance window', help: 'Months until backlog is lost', type: 'number' },
  autoResolveEnabled: { label: 'Auto-resolve enabled', help: 'Apply refill at threshold', type: 'checkbox' },
  autoResolveThresholdPct: { label: 'Auto-resolve threshold %', help: 'Triggers refill event', type: 'number' },
  capacityRefillIncrement: { label: 'Machines to add per refill', help: 'Machines added each auto-resolve event', type: 'number' },
  headcountRefillIncrement: { label: 'Headcount refill increment', help: 'Reps per refill', type: 'number' },
  // Unit economics
  averageDealValue: { label: 'Avg customer deal value', help: 'Total revenue per closed deal', type: 'number' },
  dealsPerRepPerYear: { label: 'Deals per rep / year', help: 'Avg closed deals per rep annually', type: 'number' },
  customerChurnRatePct: { label: 'Annual customer churn %', help: 'Customers lost per year', type: 'number' },
  // Product launch
  launchEnabled: { label: 'Enable product launch', help: 'Model a new offer alongside existing business', type: 'checkbox' },
  launchName: { label: 'Offer name', help: 'e.g. "Premium Tier"', type: 'text' },
  launchMonth: { label: 'Launch at month', help: 'Simulation month when launch occurs', type: 'number' },
  launchInvestment: { label: 'Upfront investment', help: 'R&D, marketing, and launch costs', type: 'number' },
  launchRevenuePerUnit: { label: 'Revenue per unit', help: 'Selling price for new offer', type: 'number' },
  launchGrossProfitPct: { label: 'Gross profit %', help: 'Margin on new offer', type: 'number' },
  launchUnitsPerMonth: { label: 'Units per month (peak)', help: 'Steady-state monthly run rate', type: 'number' },
  launchRampMonths: { label: 'Ramp months', help: 'Months to reach full output', type: 'number' },
}

export function ConfigPanel({ onRun }) {
  const { state, dispatch } = useSimulation()
  const scenario = state.scenarios.find((item) => item.id === state.activeScenarioId)

  const config = scenario.config
  const period = config.outputTimeframe || 'monthly'
  const periodLabel = TIMEFRAME_LABELS[period] || period
  const unitsPerMachineMonthly = unitsToMonthly(config.unitsPerMachine, period)
  const derivedCapacity = (Number(config.numberOfMachines) || 0) * unitsPerMachineMonthly
  const derivedMaxCapacity = (Number(config.maxMachines) || 0) * unitsPerMachineMonthly
  const monthlyUnitsPerRep = unitsToMonthly(config.unitsPerSalesperson, period)
  const baseDemand = monthlyUnitsPerRep * (Number(config.salespeople) || 0)
  const derivedUtilization = derivedCapacity > 0 ? Math.min(100, (baseDemand / derivedCapacity) * 100) : 0

  return (
    <Card className="h-full overflow-y-auto p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-ink">Scenario Configuration</h2>
        <p className="mt-1 text-sm text-muted">Inputs are stored per scenario and re-simulated after edits.</p>
      </div>

      {/* Global meta row: unit label + output period */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-ink">Unit label</span>
          <input
            type="text"
            value={config.capacityUnitLabel}
            onChange={(e) => dispatch({ type: 'update-config', payload: { scenarioId: scenario.id, field: 'capacityUnitLabel', value: e.target.value } })}
            placeholder="e.g. widgets"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink outline-none"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-ink">Output period</span>
          <select
            value={period}
            onChange={(e) => dispatch({ type: 'update-config', payload: { scenarioId: scenario.id, field: 'outputTimeframe', value: e.target.value } })}
            className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink outline-none"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </label>
      </div>

      <div className="space-y-4">
        {FIELD_GROUPS.map((group) => (
          <section key={group.id} className="rounded-xl border border-line bg-panelAlt/70">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => dispatch({ type: 'toggle-panel', payload: group.id })}
            >
              <span className="font-semibold text-ink">{group.label}</span>
              <span className="text-sm text-muted">{state.ui.collapsedPanels[group.id] ? '+' : '−'}</span>
            </button>

            {!state.ui.collapsedPanels[group.id] ? (
              <div className="grid gap-4 border-t border-line px-4 py-4">
                {group.fields.map((field) => {
                  const meta = fieldMeta[field]
                  // Hide auto-resolve-dependent fields when toggle is off
                  const isAutoResolveGated = ['autoResolveThresholdPct', 'capacityRefillIncrement', 'headcountRefillIncrement'].includes(field)
                  if (isAutoResolveGated && !scenario.config.autoResolveEnabled) return null
                  const isLaunchGated = ['launchName', 'launchMonth', 'launchInvestment', 'launchRevenuePerUnit', 'launchGrossProfitPct', 'launchUnitsPerMonth', 'launchRampMonths'].includes(field)
                  if (isLaunchGated && !config.launchEnabled) return null
                  return (
                    <FormField key={field} label={meta.label} help={meta.help} error={scenario.validation.errors[field]}>
                      {renderField({
                        meta,
                        value: scenario.config[field],
                        onChange: (value) =>
                          dispatch({
                            type: 'update-config',
                            payload: { scenarioId: scenario.id, field, value },
                          }),
                        suffix: meta.rateField ? `per ${periodLabel}` : undefined,
                      })}
                    </FormField>
                  )
                })}

                {/* Derived capacity display for the Capacity section */}
                {group.id === 'capacity' && (
                  <div className="rounded-xl border border-accent/20 bg-accent/5 px-4 py-3">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent/70">Computed from inputs</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-bg/70 px-3 py-2">
                        <p className="text-[10px] text-muted">Starting capacity</p>
                        <p className="mt-1 text-sm font-semibold text-ink">{formatCompactNumber(derivedCapacity)}<span className="ml-1 text-xs font-normal text-muted">/mo</span></p>
                      </div>
                      <div className="rounded-lg bg-bg/70 px-3 py-2">
                        <p className="text-[10px] text-muted">Max capacity</p>
                        <p className="mt-1 text-sm font-semibold text-ink">{formatCompactNumber(derivedMaxCapacity)}<span className="ml-1 text-xs font-normal text-muted">/mo</span></p>
                      </div>
                      <div className="rounded-lg bg-bg/70 px-3 py-2">
                        <p className="text-[10px] text-muted">Utilization</p>
                        <p className={`mt-1 text-sm font-semibold ${derivedUtilization >= 90 ? 'text-coral' : derivedUtilization >= 70 ? 'text-gold' : 'text-lime'}`}>
                          {formatPercent(derivedUtilization)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        ))}
      </div>

      {!!scenario.validation.warnings.length ? (
        <div className="mt-5 rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
          {scenario.validation.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onRun}
        disabled={!scenario.validation.isValid}
        className="mt-5 w-full rounded-xl bg-accent px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
      >
        Run Simulation
      </button>
    </Card>
  )
}

function renderField({ meta, value, onChange, suffix }) {
  if (meta.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-line bg-bg"
      />
    )
  }

  if (meta.type === 'horizon') {
    return (
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink outline-none"
      >
        {HORIZON_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  if (suffix) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink outline-none"
        />
        <span className="shrink-0 text-xs text-muted">{suffix}</span>
      </div>
    )
  }

  return (
    <input
      type={meta.type}
      value={value}
      onChange={(event) => onChange(meta.type === 'number' ? Number(event.target.value) : event.target.value)}
      className="w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-ink outline-none"
    />
  )
}
