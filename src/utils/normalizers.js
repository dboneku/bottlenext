export function unitsToMonthly(units, timeframe) {
  const value = Number(units) || 0

  switch (timeframe) {
    case 'daily':
      return value * 30
    case 'weekly':
      return value * 4.345
    case 'annually':
      return value / 12
    case 'monthly':
    default:
      return value
  }
}

export function annualToMonthly(value) {
  return (Number(value) || 0) / 12
}
