import { useMemo } from 'react'
import { useSimulation } from './context/SimulationContext'
import { useDebouncedEffect } from './hooks/useDebouncedEffect'
import { ScenarioBar } from './components/scenarios/ScenarioBar'
import { ConfigPanel } from './components/config/ConfigPanel'
import { OutputPanel } from './components/simulation/OutputPanel'

export default function App() {
  const { state, dispatch } = useSimulation()
  const activeScenario = useMemo(
    () => state.scenarios.find((scenario) => scenario.id === state.activeScenarioId),
    [state.scenarios, state.activeScenarioId],
  )

  useDebouncedEffect(
    () => {
      if (activeScenario?.validation.isValid) {
        dispatch({ type: 'run-simulation', payload: { scenarioId: activeScenario.id } })
      }
    },
    [activeScenario?.config],
    450,
  )

  return (
    <div className="min-h-screen px-6 py-6 text-ink">
      <div className="mx-auto max-w-[1680px] space-y-6">
        <header className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">BottleNext</p>
          <div className="flex items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Supply and Demand Bottleneck Simulator</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted">
                Scenario-based operational modeling with backlog, bottleneck, hiring, capacity expansion, and financial impact.
              </p>
            </div>
          </div>
        </header>

        <ScenarioBar />

        <main className="grid grid-cols-[420px_minmax(0,1fr)] gap-6">
          <ConfigPanel onRun={() => dispatch({ type: 'run-simulation', payload: { scenarioId: activeScenario.id } })} />
          <OutputPanel />
        </main>
      </div>
    </div>
  )
}
