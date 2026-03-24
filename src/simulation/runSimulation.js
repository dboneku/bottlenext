import { unitsToMonthly } from '../utils/normalizers'

export function runSimulation(config) {
  const period = config.outputTimeframe || 'monthly'
  const unitsPerMachineMonthly = unitsToMonthly(config.unitsPerMachine, period)
  const salesPerRepMonthly = unitsToMonthly(config.unitsPerSalesperson, period)
  const maxOutputMonthly = unitsPerMachineMonthly * (Number(config.numberOfMachines) || 0)
  const revenuePerUnit = Number(config.revenuePerUnit) || 0
  const profitMarginRate = (Number(config.profitMarginPct) || 30) / 100
  const currentReps = Number(config.salespeople) || 0
  const hiresPerMonth = Math.max(1, Number(config.hiresPerMonth) || 1)

  const maxRevenue = maxOutputMonthly * revenuePerUnit
  const maxProfit = maxRevenue * profitMarginRate
  const repsNeeded = salesPerRepMonthly > 0 ? Math.ceil(maxOutputMonthly / salesPerRepMonthly) : 0
  const repsGap = Math.max(0, repsNeeded - currentReps)
  const monthsToMax = repsGap > 0 ? Math.ceil(repsGap / hiresPerMonth) : 0

  // Build ramp timeline — show at least 24 months, or the full ramp + 6 months buffer
  const horizonMonths = Math.max(monthsToMax + 6, 24)
  const rampTimeline = []
  let reps = currentReps

  for (let month = 0; month <= horizonMonths; month++) {
    const demand = reps * salesPerRepMonthly
    rampTimeline.push({
      month,
      demand: Math.round(demand),
      capacity: Math.round(maxOutputMonthly),
      reps,
    })
    if (month < monthsToMax) {
      reps = Math.min(repsNeeded, reps + hiresPerMonth)
    }
  }

  return {
    maxOutputMonthly,
    maxRevenue,
    maxProfit,
    repsNeeded,
    repsGap,
    monthsToMax,
    rampTimeline,
    meta: {
      capacityUnitLabel: config.capacityUnitLabel,
      outputTimeframe: period,
    },
  }
}


