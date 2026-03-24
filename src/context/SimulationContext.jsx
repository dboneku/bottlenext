import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { DEFAULT_CONFIG, STORAGE_KEY } from '../utils/constants'
import { validateConfig } from '../utils/validation'
import { runSimulation } from '../simulation/runSimulation'

const SimulationContext = createContext(null)

function createModel(config = DEFAULT_CONFIG) {
  return {
    config: { ...config },
    simulationResult: null,
    validation: validateConfig(config),
  }
}

const initialModel = createModel()

const initialState = {
  ...initialModel,
  ui: {},
}

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return action.payload
    case 'update-config': {
      const config = { ...state.config, [action.payload.field]: action.payload.value }
      return { ...state, config, validation: validateConfig(config) }
    }
    case 'run-simulation': {
      return {
        ...state,
        validation: validateConfig(state.config),
        simulationResult: runSimulation(state.config),
      }
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

    if (parsed?.config) {
      const config = { ...DEFAULT_CONFIG, ...parsed.config }
      return {
        ...initialState,
        ...parsed,
        config,
        validation: validateConfig(config),
      }
    }

    if (Array.isArray(parsed?.scenarios) && parsed.scenarios.length > 0) {
      const previous = parsed.scenarios[0]
      const config = { ...DEFAULT_CONFIG, ...previous.config }
      return {
        ...initialState,
        config,
        simulationResult: previous.simulationResult ?? null,
        validation: validateConfig(config),
        ui: {
          ...initialState.ui,
          ...parsed.ui,
        },
      }
    }

    return initialState
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
        config: state.config,
        simulationResult: state.simulationResult,
        validation: state.validation,
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
