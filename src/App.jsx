import { useSimulation } from './context/SimulationContext'
import { useDebouncedEffect } from './hooks/useDebouncedEffect'
import { ConfigPanel } from './components/config/ConfigPanel'
import { OutputPanel } from './components/simulation/OutputPanel'

export default function App() {
  const { state, dispatch } = useSimulation()

  useDebouncedEffect(
    () => {
      if (state.validation.isValid) {
        dispatch({ type: 'run-simulation' })
      }
    },
    [state.config],
    450,
  )

  return (
    <div className="min-h-screen px-5 py-8 text-slate-900 md:px-8">
      <div className="mx-auto max-w-[1520px] space-y-8">
        <header className="border-b border-line pb-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">BottleNext</p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Business Bottleneck Simulator</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600">
                Enter your current capacity and sales team numbers to find your maximum possible output, what it would be worth, and how long it would take to get there.
              </p>
            </div>
          </div>
        </header>

        <main className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <ConfigPanel />
          <OutputPanel />
        </main>
      </div>
    </div>
  )
}
