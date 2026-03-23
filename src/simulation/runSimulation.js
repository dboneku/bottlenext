import { annualToMonthly, unitsToMonthly } from '../utils/normalizers'
import { SUMMARY_MONTHS } from '../utils/constants'

function growthMultiplier(rate) {
  const annualRate = (Number(rate) || 0) / 100
  return Math.pow(1 + annualRate, 1 / 12)
}

function createPendingAddition(type, unitsAdded, month, rampTimeMonths, cost) {
  return {
    type,
    unitsAdded,
    addedAtMonth: month,
    rampCompletesMonth: month + rampTimeMonths,
    cost,
  }
}

function computeBacklogAging(backlogBuckets, tolerance) {
  if (tolerance <= 0) {
    return { nextBuckets: [], lostUnits: backlogBuckets.reduce((sum, bucket) => sum + bucket.units, 0) }
  }

  let lostUnits = 0
  const nextBuckets = backlogBuckets
    .map((bucket) => {
      const age = bucket.age + 1
      if (age > tolerance) {
        lostUnits += bucket.units
        return null
      }

      return { ...bucket, age }
    })
    .filter(Boolean)

  return { nextBuckets, lostUnits }
}

function consumeBacklog(backlogBuckets, availableSupply) {
  let remainingSupply = availableSupply
  const nextBuckets = []

  backlogBuckets.forEach((bucket) => {
    if (remainingSupply <= 0) {
      nextBuckets.push(bucket)
      return
    }

    const served = Math.min(bucket.units, remainingSupply)
    const remainingUnits = bucket.units - served
    remainingSupply -= served

    if (remainingUnits > 0) {
      nextBuckets.push({ ...bucket, units: remainingUnits })
    }
  })

  return {
    nextBuckets,
    servedUnits: availableSupply - remainingSupply,
    remainingSupply,
  }
}

function summarizeAtMonths(monthlyData) {
  return SUMMARY_MONTHS.map((month) => {
    const row = monthlyData.find((entry) => entry.month === month)
    if (!row) {
      return {
        period: month === 0 ? 'Now' : `${month} mo`,
        month,
        revenue: null,
        grossProfit: null,
        cumulativeCapex: null,
        cumulativeHeadcountCost: null,
        lostRevenue: null,
        net: null,
      }
    }

    return {
      period: month === 0 ? 'Now' : `${month} mo`,
      month,
      revenue: row.cumulativeRevenue,
      grossProfit: row.cumulativeGrossProfit,
      cumulativeCapex: row.cumulativeCapex,
      cumulativeHeadcountCost: row.cumulativeHeadcountCost,
      lostRevenue: row.cumulativeLostRevenue,
      net: row.cumulativeGrossProfit - row.cumulativeCapex - row.cumulativeHeadcountCost,
    }
  })
}

export function runSimulation(config) {
  const horizon = Number(config.simulationHorizon) || 48
  const rampTimeMonths = Number(config.rampTimeMonths) || 0
  const backlogToleranceMonths = Number(config.backlogToleranceMonths) || 0
  const threshold = (Number(config.autoResolveThresholdPct) || 90) / 100
  // Derive capacity from machines — use unified outputTimeframe
  const period = config.outputTimeframe || 'monthly'
  const monthlyUnitsPerRep = unitsToMonthly(config.unitsPerSalesperson, period)
  const monthlyRepCost = annualToMonthly(config.salespersonAnnualCost)
  const monthlyGrowth = growthMultiplier(config.organicDemandGrowthRate)
  const revenuePerUnit = Number(config.revenuePerUnit) || 0
  const grossProfitRate = (Number(config.grossProfitPct) || 0) / 100
  const unitsPerMachineMonthly = unitsToMonthly(config.unitsPerMachine, period)
  let currentCapacity = (Number(config.numberOfMachines) || 0) * unitsPerMachineMonthly
  const maxCapacity = (Number(config.maxMachines) || 0) * unitsPerMachineMonthly
  let activeSalespeople = Number(config.salespeople) || 0
  let backlogBuckets = []
  let cumulativeCapex = 0
  let cumulativeHeadcountCost = 0
  let cumulativeRevenue = 0
  let cumulativeGrossProfit = 0
  let cumulativeLostRevenue = 0
  const pendingCapacityAdditions = []
  const pendingHeadcountAdditions = []
  const monthlyData = []
  const events = []
  const capacityLog = []
  const warnings = []
  let previousPrimaryBottleneck = null

  if (config.autoResolveEnabled && Number(config.capacityRefillIncrement) <= 0 && Number(config.headcountRefillIncrement) <= 0) {
    warnings.push('Auto-resolve disabled because both refill increments are zero.')
  }

  for (let month = 0; month <= horizon; month += 1) {
    pendingCapacityAdditions
      .filter((entry) => entry.rampCompletesMonth === month)
      .forEach((entry) => {
        currentCapacity = Math.min(maxCapacity, currentCapacity + entry.unitsAdded)
      })

    pendingHeadcountAdditions
      .filter((entry) => entry.rampCompletesMonth === month)
      .forEach((entry) => {
        activeSalespeople += entry.unitsAdded
      })

    cumulativeHeadcountCost += activeSalespeople * monthlyRepCost

    // Machines produce their rated output — no utilization multiplier needed
    const effectiveSupply = Math.min(maxCapacity, currentCapacity)
    const effectiveDemand = activeSalespeople * monthlyUnitsPerRep * Math.pow(monthlyGrowth, month)

    const aged = computeBacklogAging(backlogBuckets, backlogToleranceMonths)
    backlogBuckets = aged.nextBuckets
    const lostUnitsThisMonth = aged.lostUnits
    const backlogService = consumeBacklog(backlogBuckets, effectiveSupply)
    backlogBuckets = backlogService.nextBuckets
    const currentDemandServed = Math.min(backlogService.remainingSupply, effectiveDemand)
    const fulfilledUnits = backlogService.servedUnits + currentDemandServed
    const backlogCreated = Math.max(0, effectiveDemand - currentDemandServed)

    if (backlogCreated > 0) {
      backlogBuckets.push({ units: backlogCreated, age: 0 })
    }

    const backlogUnits = backlogBuckets.reduce((sum, bucket) => sum + bucket.units, 0)
    const utilization = currentCapacity > 0 ? effectiveDemand / currentCapacity : 0
    const lostRevenue = lostUnitsThisMonth * revenuePerUnit
    const revenue = fulfilledUnits * revenuePerUnit
    const grossProfit = revenue * grossProfitRate

    cumulativeRevenue += revenue
    cumulativeGrossProfit += grossProfit
    cumulativeLostRevenue += lostRevenue

    const demandBottleneck = backlogCreated > 0
    const supplyBottleneck = utilization >= threshold || (month === 0 && currentCapacity >= maxCapacity)
    const primaryBottleneck = demandBottleneck ? 'demand' : supplyBottleneck ? 'supply' : null

    const actionsTaken = []
    let capexTriggered = 0

    const canAutoResolve =
      config.autoResolveEnabled &&
      (Number(config.capacityRefillIncrement) > 0 || Number(config.headcountRefillIncrement) > 0)

    const hasPendingHeadcount = pendingHeadcountAdditions.some((entry) => entry.rampCompletesMonth > month)
    const hasPendingCapacity = pendingCapacityAdditions.some((entry) => entry.rampCompletesMonth > month)

    // Any bottleneck → add machines (resolves both demand overflow and supply ceiling pressure)
    if (canAutoResolve && primaryBottleneck && !hasPendingCapacity) {
      if (Number(config.capacityRefillIncrement) > 0 && currentCapacity < maxCapacity) {
        const machinesAvailable = Math.floor((maxCapacity - currentCapacity) / unitsPerMachineMonthly)
        const machinesAdded = Math.min(Number(config.capacityRefillIncrement), machinesAvailable)
        if (machinesAdded > 0) {
          const unitsAdded = machinesAdded * unitsPerMachineMonthly
          const cost = machinesAdded * Number(config.costPerCapacityUnit)
          const addition = createPendingAddition('capacity', unitsAdded, month, rampTimeMonths, cost)
          pendingCapacityAdditions.push(addition)
          cumulativeCapex += cost
          capexTriggered += cost
          actionsTaken.push(`Added ${machinesAdded} machine${machinesAdded !== 1 ? 's' : ''}`)
          capacityLog.push({
            date: `Month ${month}`,
            type: 'capacity',
            unitsAdded: machinesAdded,
            cost,
            rampCompletes: `Month ${Math.min(addition.rampCompletesMonth, horizon)}`,
          })
        }
      }
    }

    // Supply bottleneck only → also add headcount so demand grows to fill the new capacity
    if (canAutoResolve && primaryBottleneck === 'supply' && !hasPendingHeadcount) {
      if (Number(config.headcountRefillIncrement) > 0) {
        const cost = Number(config.headcountRefillIncrement) * monthlyRepCost * 12
        const addition = createPendingAddition(
          'headcount',
          Number(config.headcountRefillIncrement),
          month,
          rampTimeMonths,
          cost,
        )
        pendingHeadcountAdditions.push(addition)
        actionsTaken.push(`Added ${addition.unitsAdded} reps`)
        capacityLog.push({
          date: `Month ${month}`,
          type: 'headcount',
          unitsAdded: addition.unitsAdded,
          cost,
          rampCompletes: `Month ${Math.min(addition.rampCompletesMonth, horizon)}`,
        })
      }
    }

    if (demandBottleneck && previousPrimaryBottleneck !== 'demand') {
      events.push({
        month,
        dateLabel: `Month ${month}`,
        eventType: 'Demand bottleneck',
        supply: effectiveSupply,
        demand: effectiveDemand,
        utilizationPct: utilization * 100,
        backlog: backlogUnits,
        actionTaken: actionsTaken.join(', ') || 'Demand exceeded supply',
        capexTriggered,
        revenueImpact: lostRevenue,
      })
    }

    if (supplyBottleneck && previousPrimaryBottleneck !== 'supply') {
      events.push({
        month,
        dateLabel: `Month ${month}`,
        eventType: month === 0 && currentCapacity >= maxCapacity ? 'Day-0 supply bottleneck' : 'Supply bottleneck',
        supply: effectiveSupply,
        demand: effectiveDemand,
        utilizationPct: utilization * 100,
        backlog: backlogUnits,
        actionTaken: actionsTaken.join(', ') || 'Supply threshold reached',
        capexTriggered,
        revenueImpact: lostRevenue,
      })
    }

    previousPrimaryBottleneck = primaryBottleneck

    monthlyData.push({
      month,
      supply: effectiveSupply,
      demand: effectiveDemand,
      maxCapacity,
      backlog: backlogUnits,
      utilizationPct: utilization * 100,
      revenue,
      grossProfit,
      lostRevenue,
      cumulativeRevenue,
      cumulativeGrossProfit,
      cumulativeCapex,
      cumulativeHeadcountCost,
      cumulativeLostRevenue,
      actionsTaken: actionsTaken.join(', '),
      bottleneckType: primaryBottleneck,
    })
  }

  if (!events.length) {
    warnings.push('No bottleneck occurs within the selected horizon.')
  }

  return {
    monthlyData,
    events,
    capacityLog,
    financialSummary: summarizeAtMonths(monthlyData),
    warnings,
    meta: {
      capacityUnitLabel: config.capacityUnitLabel,
      horizon,
    },
  }
}
