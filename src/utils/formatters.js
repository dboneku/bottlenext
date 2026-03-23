export function formatNumber(value, maximumFractionDigits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(value)
}

export function formatCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPercent(value, maximumFractionDigits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  return `${Number(value).toFixed(maximumFractionDigits)}%`
}

export function formatMonth(month) {
  return `Month ${month}`
}

export function formatCompactNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(Math.round(value))
}

export function formatCompactCurrency(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(0)}k`
  return `$${Math.round(value)}`
}
