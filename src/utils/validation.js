export function validateConfig(config) {
  const errors = {}

  if (!config.capacityUnitLabel?.trim()) {
    errors.capacityUnitLabel = 'Required'
  }

  ;['numberOfMachines', 'unitsPerMachine', 'revenuePerUnit', 'unitsPerSalesperson'].forEach((field) => {
    const val = Number(config[field])
    if (config[field] === '' || config[field] === null || config[field] === undefined || isNaN(val)) {
      errors[field] = 'Required'
    } else if (val <= 0) {
      errors[field] = 'Must be greater than 0'
    }
  })

  ;['salespeople', 'hiresPerMonth', 'profitMarginPct'].forEach((field) => {
    const val = Number(config[field])
    if (config[field] === '' || config[field] === null || config[field] === undefined || isNaN(val)) {
      errors[field] = 'Required'
    } else if (val < 0) {
      errors[field] = 'Must be 0 or greater'
    }
  })

  if (Number(config.profitMarginPct) > 100) {
    errors.profitMarginPct = 'Must be between 0 and 100'
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}
