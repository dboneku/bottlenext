export function validateConfig(config) {
  const errors = {}
  const warnings = []

  const requiredNumbers = [
    'numberOfMachines',
    'unitsPerMachine',
    'maxMachines',
    'costPerCapacityUnit',
    'salespeople',
    'unitsPerSalesperson',
    'revenuePerUnit',
    'grossProfitPct',
    'rampTimeMonths',
    'backlogToleranceMonths',
    'autoResolveThresholdPct',
  ]

  requiredNumbers.forEach((field) => {
    const value = config[field]
    if (value === '' || value === null || value === undefined || Number.isNaN(Number(value))) {
      errors[field] = 'Required'
    }
  })

  if (!config.capacityUnitLabel?.trim()) {
    errors.capacityUnitLabel = 'Required'
  }

  if (Number(config.numberOfMachines) < 1) {
    errors.numberOfMachines = 'Must be at least 1'
  }

  if (Number(config.unitsPerMachine) <= 0) {
    errors.unitsPerMachine = 'Must be greater than 0'
  }

  if (Number(config.grossProfitPct) < 0 || Number(config.grossProfitPct) > 100) {
    errors.grossProfitPct = 'Must be between 0 and 100'
  }

  if (Number(config.autoResolveThresholdPct) < 1 || Number(config.autoResolveThresholdPct) > 100) {
    errors.autoResolveThresholdPct = 'Must be between 1 and 100'
  }

  ;[
    'numberOfMachines',
    'maxMachines',
    'costPerCapacityUnit',
    'salespeople',
    'unitsPerSalesperson',
    'salespersonAnnualCost',
    'revenuePerUnit',
    'rampTimeMonths',
    'backlogToleranceMonths',
  ].forEach((field) => {
    if (Number(config[field]) < 0) {
      errors[field] = 'Must be 0 or greater'
    }
  })

  if (config.autoResolveEnabled) {
    if (Number(config.capacityRefillIncrement) <= 0 && Number(config.headcountRefillIncrement) <= 0) {
      errors.capacityRefillIncrement = 'Provide a refill increment'
      errors.headcountRefillIncrement = 'Provide a refill increment'
    }
  }

  if (Number(config.maxMachines) < Number(config.numberOfMachines)) {
    errors.maxMachines = 'Must be ≥ number of machines'
  }

  if (Number(config.maxMachines) === Number(config.numberOfMachines)) {
    warnings.push('Max machines equals current machines — no room to expand capacity.')
  }

  if (Number(config.organicDemandGrowthRate) > 50) {
    warnings.push('Organic demand growth exceeds 50%.')
  }

  if (Number(config.backlogToleranceMonths) > 12) {
    warnings.push('Backlog tolerance window exceeds 12 months.')
  }

  if (
    config.autoResolveEnabled &&
    Number(config.capacityRefillIncrement) === 0 &&
    Number(config.headcountRefillIncrement) === 0
  ) {
    warnings.push('Auto-resolve is disabled in practice because refill increments are zero.')
  }

  return { errors, warnings, isValid: Object.keys(errors).length === 0 }
}
