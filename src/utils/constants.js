export const STORAGE_KEY = 'bottlenext-scenarios'

export const HORIZON_OPTIONS = [
  { label: '1 year', value: 12 },
  { label: '2 years', value: 24 },
  { label: '4 years', value: 48 },
]

export const SUMMARY_MONTHS = [0, 6, 12, 24, 48]

export const DEFAULT_CONFIG = {
  capacityUnitLabel: 'units',
  outputTimeframe: 'monthly',
  numberOfMachines: 10,
  unitsPerMachine: 100,
  maxMachines: 18,
  costPerCapacityUnit: 1200,
  salespeople: 6,
  unitsPerSalesperson: 90,
  salespersonAnnualCost: 95000,
  organicDemandGrowthRate: 12,
  revenuePerUnit: 480,
  grossProfitPct: 42,
  simulationHorizon: 48,
  rampTimeMonths: 3,
  backlogToleranceMonths: 2,
  autoResolveEnabled: false,
  autoResolveThresholdPct: 90,
  capacityRefillIncrement: 200,
  headcountRefillIncrement: 1,
  // Unit economics / CAC
  averageDealValue: 9600,
  dealsPerRepPerYear: 6,
  customerChurnRatePct: 15,
  // Product launch
  launchEnabled: false,
  launchName: 'New Offer',
  launchMonth: 6,
  launchInvestment: 50000,
  launchRevenuePerUnit: 350,
  launchGrossProfitPct: 55,
  launchUnitsPerMonth: 60,
  launchRampMonths: 4,
}

export const FIELD_GROUPS = [
  {
    id: 'capacity',
    label: 'Capacity',
    fields: [
      'numberOfMachines',
      'unitsPerMachine',
      'maxMachines',
      'costPerCapacityUnit',
    ],
  },
  {
    id: 'sales',
    label: 'Sales & Demand',
    fields: [
      'salespeople',
      'unitsPerSalesperson',
      'salespersonAnnualCost',
      'organicDemandGrowthRate',
    ],
  },
  {
    id: 'financial',
    label: 'Financial',
    fields: ['revenuePerUnit', 'grossProfitPct'],
  },
  {
    id: 'behavior',
    label: 'Advanced',
    fields: [
      'simulationHorizon',
      'rampTimeMonths',
      'backlogToleranceMonths',
      'autoResolveEnabled',
      'autoResolveThresholdPct',
      'capacityRefillIncrement',
      'headcountRefillIncrement',
    ],
  },
  {
    id: 'unit-econ',
    label: 'Unit Economics',
    fields: ['averageDealValue', 'dealsPerRepPerYear', 'customerChurnRatePct'],
  },
  {
    id: 'launch',
    label: 'Product Launch',
    fields: [
      'launchEnabled',
      'launchName',
      'launchMonth',
      'launchInvestment',
      'launchRevenuePerUnit',
      'launchGrossProfitPct',
      'launchUnitsPerMonth',
      'launchRampMonths',
    ],
  },
]
