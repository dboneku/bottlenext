import { useSimulation } from '../../context/SimulationContext'

const PERIOD_LABELS = { daily: 'day', weekly: 'week', monthly: 'month', annually: 'year' }

function inputCls(error) {
  return `w-full rounded-lg border ${error ? 'border-red-400' : 'border-slate-300'} bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-700`
}

function Field({ label, error, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-900">{label}</span>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </label>
  )
}

export function ConfigPanel() {
  const { state, dispatch } = useSimulation()
  const { config, validation } = state
  const periodLabel = PERIOD_LABELS[config.outputTimeframe] || 'month'
  const unitLabel = config.capacityUnitLabel || 'units'

  const update = (field, value) =>
    dispatch({ type: 'update-config', payload: { field, value } })

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm h-full overflow-y-auto">
      <div className="border-b border-slate-200 px-6 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Inputs</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">Your Numbers</h2>
      </div>

      <div className="px-6 py-5 space-y-7">

        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit label" error={validation.errors.capacityUnitLabel}>
            <input
              type="text"
              value={config.capacityUnitLabel}
              onChange={(e) => update('capacityUnitLabel', e.target.value)}
              placeholder="e.g. widgets"
              className={inputCls(validation.errors.capacityUnitLabel)}
            />
          </Field>
          <Field label="Output period">
            <select
              value={config.outputTimeframe}
              onChange={(e) => update('outputTimeframe', e.target.value)}
              className={inputCls(false)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </Field>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Production capacity</p>
          <div className="space-y-3">
            <Field label="Machines" error={validation.errors.numberOfMachines}>
              <input
                type="number"
                min="1"
                value={config.numberOfMachines}
                onChange={(e) => update('numberOfMachines', e.target.value)}
                className={inputCls(validation.errors.numberOfMachines)}
              />
            </Field>
            <Field label={`Output per machine / ${periodLabel}`} error={validation.errors.unitsPerMachine}>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={config.unitsPerMachine}
                  onChange={(e) => update('unitsPerMachine', e.target.value)}
                  className={inputCls(validation.errors.unitsPerMachine) + ' pr-20'}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {unitLabel}/{periodLabel}
                </span>
              </div>
            </Field>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Revenue &amp; margin</p>
          <div className="space-y-3">
            <Field label={`Revenue per ${unitLabel}`} error={validation.errors.revenuePerUnit}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={config.revenuePerUnit}
                  onChange={(e) => update('revenuePerUnit', e.target.value)}
                  className={inputCls(validation.errors.revenuePerUnit) + ' pl-7'}
                />
              </div>
            </Field>
            <Field label="Profit margin" error={validation.errors.profitMarginPct}>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={config.profitMarginPct}
                  onChange={(e) => update('profitMarginPct', e.target.value)}
                  className={inputCls(validation.errors.profitMarginPct) + ' pr-8'}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">%</span>
              </div>
            </Field>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Sales team</p>
          <div className="space-y-3">
            <Field label="Current salespeople" error={validation.errors.salespeople}>
              <input
                type="number"
                min="0"
                value={config.salespeople}
                onChange={(e) => update('salespeople', e.target.value)}
                className={inputCls(validation.errors.salespeople)}
              />
            </Field>
            <Field label={`Sales per rep / ${periodLabel}`} error={validation.errors.unitsPerSalesperson}>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={config.unitsPerSalesperson}
                  onChange={(e) => update('unitsPerSalesperson', e.target.value)}
                  className={inputCls(validation.errors.unitsPerSalesperson) + ' pr-20'}
                />
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  {unitLabel}/{periodLabel}
                </span>
              </div>
            </Field>
            <Field label="Hiring pace (new reps / month)" error={validation.errors.hiresPerMonth}>
              <input
                type="number"
                min="1"
                value={config.hiresPerMonth}
                onChange={(e) => update('hiresPerMonth', e.target.value)}
                className={inputCls(validation.errors.hiresPerMonth)}
              />
            </Field>
          </div>
        </div>

      </div>
    </div>
  )
}
