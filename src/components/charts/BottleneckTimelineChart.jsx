import { formatCurrency, formatPercent } from '../../utils/formatters'
import { Card } from '../shared/Card'

export function BottleneckTimelineChart({ scenario }) {
  const events = scenario.simulationResult.events
  const horizon = Number(scenario.config.simulationHorizon) || 48

  const milestones = [0, 12, 24, 36, 48].filter((m) => m <= horizon)

  return (
    <Card className="p-5">
      <h3 className="mb-5 text-base font-semibold text-ink">Bottleneck Event Timeline</h3>

      {events.length === 0 ? (
        <p className="text-sm text-muted">No bottleneck events within the selected horizon.</p>
      ) : (
        <>
          {/* Horizontal timeline bar with event markers */}
          <div className="relative mb-6 px-2">
            <div className="h-1 w-full rounded-full bg-line" />

            {/* Milestone labels */}
            <div className="relative mt-1">
              {milestones.map((m) => (
                <span
                  key={m}
                  className="absolute -translate-x-1/2 text-[10px] text-muted"
                  style={{ left: `${(m / horizon) * 100}%` }}
                >
                  M{m}
                </span>
              ))}
            </div>

            {/* Event markers */}
            {events.map((event, i) => {
              const isDemand = event.eventType.toLowerCase().includes('demand')
              const pct = Math.min(100, (event.month / horizon) * 100)
              return (
                <div
                  key={i}
                  className="absolute top-0 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pct}%` }}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-bg text-[9px] font-bold ${isDemand ? 'bg-coral text-bg' : 'bg-gold text-bg'}`}
                    title={`${event.eventType} — Month ${event.month}`}
                  >
                    {i + 1}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Event detail cards */}
          <div className="mt-8 space-y-2">
            {events.map((event, i) => {
              const isDemand = event.eventType.toLowerCase().includes('demand')
              return (
                <div
                  key={i}
                  className="grid grid-cols-[1.25rem_5rem_1fr_auto] items-start gap-3 rounded-xl border border-line bg-bg/60 px-4 py-3 text-sm"
                >
                  <span
                    className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isDemand ? 'bg-coral/20 text-coral' : 'bg-gold/20 text-gold'}`}
                  >
                    {i + 1}
                  </span>
                  <span className="font-mono text-xs font-semibold text-muted">{event.dateLabel}</span>
                  <div>
                    <p className={`font-semibold ${isDemand ? 'text-coral' : 'text-gold'}`}>{event.eventType}</p>
                    {event.actionTaken ? <p className="mt-0.5 text-xs text-muted">{event.actionTaken}</p> : null}
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-muted">
                      Util{' '}
                      <span className={isDemand ? 'text-coral' : 'text-gold'}>
                        {formatPercent(event.utilizationPct)}
                      </span>
                    </p>
                    {event.revenueImpact > 0 ? (
                      <p className="mt-0.5 text-coral">{formatCurrency(event.revenueImpact)} lost</p>
                    ) : null}
                    {event.capexTriggered > 0 ? (
                      <p className="mt-0.5 text-gold">{formatCurrency(event.capexTriggered)} CapEx</p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Card>
  )
}
