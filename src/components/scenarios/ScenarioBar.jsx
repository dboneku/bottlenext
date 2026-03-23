import { useState } from 'react'
import { Card } from '../shared/Card'
import { useSimulation } from '../../context/SimulationContext'

export function ScenarioBar() {
  const { state, dispatch } = useSimulation()
  const [renameId, setRenameId] = useState(null)
  const [draftName, setDraftName] = useState('')
  const activeScenario = state.scenarios.find((scenario) => scenario.id === state.activeScenarioId)

  function addScenario() {
    dispatch({
      type: 'add-scenario',
      payload: {
        name: `${activeScenario.name} Copy`,
        config: activeScenario.config,
      },
    })
  }

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        {state.scenarios.map((scenario) => {
          const isActive = scenario.id === state.activeScenarioId
          const isComparing = state.selectedComparisonIds.includes(scenario.id)
          return (
            <div
              key={scenario.id}
              className={`rounded-full border px-4 py-2 ${isActive ? 'border-accent bg-accent/10' : 'border-line bg-panelAlt/80'}`}
            >
              <button
                type="button"
                className="mr-3 text-sm font-semibold text-ink"
                onClick={() => dispatch({ type: 'set-active-scenario', payload: scenario.id })}
              >
                {renameId === scenario.id ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onBlur={() => {
                      dispatch({
                        type: 'rename-scenario',
                        payload: { scenarioId: scenario.id, name: draftName || scenario.name },
                      })
                      setRenameId(null)
                    }}
                    className="w-32 rounded-md border border-line bg-bg px-2 py-1 text-sm text-ink outline-none"
                  />
                ) : (
                  scenario.name
                )}
              </button>
              <button
                type="button"
                className="mr-2 text-xs text-muted hover:text-ink"
                onClick={() => {
                  setRenameId(scenario.id)
                  setDraftName(scenario.name)
                }}
              >
                Rename
              </button>
              <button
                type="button"
                className="mr-2 text-xs text-muted hover:text-ink"
                onClick={() => dispatch({ type: 'toggle-comparison-scenario', payload: scenario.id })}
              >
                {isComparing ? 'Hide' : 'Compare'}
              </button>
              <button
                type="button"
                className="text-xs text-coral hover:text-white"
                onClick={() => dispatch({ type: 'delete-scenario', payload: scenario.id })}
              >
                Delete
              </button>
            </div>
          )
        })}
        <button
          type="button"
          disabled={state.scenarios.length >= 5}
          onClick={addScenario}
          className="rounded-full border border-dashed border-gold px-4 py-2 text-sm font-semibold text-gold disabled:opacity-40"
        >
          Add Scenario
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'toggle-comparison' })}
          className={`ml-auto rounded-full px-4 py-2 text-sm font-semibold ${
            state.comparisonMode ? 'bg-lime/15 text-lime' : 'bg-panelAlt text-muted'
          }`}
        >
          Comparison {state.comparisonMode ? 'On' : 'Off'}
        </button>
      </div>
    </Card>
  )
}
