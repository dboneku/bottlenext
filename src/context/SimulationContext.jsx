import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { DEFAULT_CONFIG, STORAGE_KEY } from '../utils/constants'
import { validateConfig } from '../utils/validation'
import { runSimulation } from '../simulation/runSimulation'

const SimulationContext = createContext(null)

function createScenario(name = 'Baseline', config = DEFAULT_CONFIG) {
  return {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    config: { ...config },
    simulationResult: null,
    validation: validateConfig(config),
  }
}

const initialScenario = createScenario()

const initialState = {
  scenarios: [initialScenario],
  activeScenarioId: initialScenario.id,
  comparisonMode: false,
  selectedComparisonIds: [initialScenario.id],
  ui: {
    activeOutputTab: 'charts',
    collapsedPanels: {
      capacity: false,
      sales: false,
      financial: false,
      behavior: true,
      'unit-econ': true,
      launch: true,
    },
  },
}

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return action.payload
    case 'set-active-scenario':
      return { ...state, activeScenarioId: action.payload }
    case 'update-config': {
      const scenarios = state.scenarios.map((scenario) => {
        if (scenario.id !== action.payload.scenarioId) {
          return scenario
        }

        const config = { ...scenario.config, [action.payload.field]: action.payload.value }
        return { ...scenario, config, validation: validateConfig(config) }
      })
      return { ...state, scenarios }
    }
    case 'run-simulation': {
      const scenarios = state.scenarios.map((scenario) => {
        if (scenario.id !== action.payload.scenarioId) {
          return scenario
        }
        return {
          ...scenario,
          validation: validateConfig(scenario.config),
          simulationResult: runSimulation(scenario.config),
        }
      })
      return { ...state, scenarios }
    }
    case 'add-scenario': {
      if (state.scenarios.length >= 5) {
        return state
      }
      const scenario = createScenario(action.payload.name, action.payload.config)
      return {
        ...state,
        scenarios: [...state.scenarios, scenario],
        activeScenarioId: scenario.id,
        selectedComparisonIds: [...new Set([...state.selectedComparisonIds, scenario.id])],
      }
    }
    case 'rename-scenario':
      return {
        ...state,
        scenarios: state.scenarios.map((scenario) =>
          scenario.id === action.payload.scenarioId ? { ...scenario, name: action.payload.name } : scenario,
        ),
      }
    case 'delete-scenario': {
      if (state.scenarios.length === 1) {
        return state
      }
      const scenarios = state.scenarios.filter((scenario) => scenario.id !== action.payload)
      const activeScenarioId =
        state.activeScenarioId === action.payload ? scenarios[0]?.id ?? null : state.activeScenarioId
      return {
        ...state,
        scenarios,
        activeScenarioId,
        selectedComparisonIds: state.selectedComparisonIds.filter((id) => id !== action.payload),
      }
    }
    case 'toggle-comparison':
      return { ...state, comparisonMode: !state.comparisonMode }
    case 'toggle-comparison-scenario': {
      const set = new Set(state.selectedComparisonIds)
      if (set.has(action.payload)) {
        set.delete(action.payload)
      } else {
        set.add(action.payload)
      }
      return { ...state, selectedComparisonIds: [...set] }
    }
    case 'set-output-tab':
      return { ...state, ui: { ...state.ui, activeOutputTab: action.payload } }
    case 'toggle-panel':
      return {
        ...state,
        ui: {
          ...state.ui,
          collapsedPanels: {
            ...state.ui.collapsedPanels,
            [action.payload]: !state.ui.collapsedPanels[action.payload],
          },
        },
      }
    default:
      return state
  }
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return initialState
  }

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed.scenarios) || parsed.scenarios.length === 0) {
      return initialState
    }

    return {
      ...initialState,
      ...parsed,
      scenarios: parsed.scenarios.map((scenario) => {
        const config = { ...DEFAULT_CONFIG, ...scenario.config }
        return {
          ...scenario,
          config,
          validation: validateConfig(config),
        }
      }),
    }
  } catch {
    return initialState
  }
}

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState)

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
        comparisonMode: state.comparisonMode,
        selectedComparisonIds: state.selectedComparisonIds,
        ui: state.ui,
      }),
    )
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useSimulation() {
  const context = useContext(SimulationContext)
  if (!context) {
    throw new Error('useSimulation must be used within SimulationProvider')
  }
  return context
}
