# Supply/Demand Bottleneck Simulator
## Requirements & Implementation Specification for Claude Coding Agent

---

## Project Overview

Build a production-grade, interactive React SPA that simulates supply and demand dynamics for a business over a configurable timeline. The tool is used in a consulting context to show clients when they will hit operational bottlenecks and what the downstream financial and capacity implications are. It must support multi-scenario comparison, be fully interactive, and export results to PDF, Excel, and CSV.

This is not a throwaway prototype. Build it with a clean component architecture that can be extended into a larger product later, potentially self-service or embedded. No backend or database. Use local storage for persistence.

---

## Tech Stack

- **Framework**: React (functional components, hooks only, no class components)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Export**: jsPDF (PDF), SheetJS/xlsx (Excel, CSV)
- **State**: React useState / useReducer + useContext for global sim state
- **Persistence**: localStorage (scenarios only, not runtime state)
- **Build**: Vite
- **No backend. No database. No auth.**

Keep component files small and purposeful. Suggested top-level structure:

```
/src
  /components
    /config       # All input/configuration panels
    /simulation   # Simulation engine logic (pure functions, no UI)
    /charts       # Recharts wrappers
    /tables       # Data table components
    /scenarios    # Scenario management UI
    /export       # PDF/Excel/CSV export logic
    /shared       # Reusable UI primitives
  /context        # Global simulation state context
  /hooks          # Custom hooks
  /utils          # Formatters, calculators, normalizers
  App.jsx
  main.jsx
```

---

## Simulation Engine

The simulation engine should be implemented as pure functions in `/src/simulation/`. No side effects, no UI dependencies. This makes it independently testable and reusable.

### Core Concepts

**Supply** = productive capacity available at any point in time, expressed in user-defined units (e.g., widgets/month, patients/week, jobs/quarter).

**Demand** = units being requested by the market, driven by salespeople and organic growth.

**Bottleneck** = the moment either supply or demand becomes the limiting factor at or above the configured threshold.

**Backlog** = unfulfilled demand that accumulates when demand exceeds supply. Carried forward for a user-configured window; after that window it becomes lost revenue.

### Simulation Steps (Milestone-Based)

The simulation does not run in continuous time steps. It projects forward to find the *next* bottleneck event, records it, then continues from that point. Steps:

1. Start from `t = 0` with initial state (capacity, utilization, headcount, demand).
2. Apply organic growth rate to demand each period.
3. Determine effective supply (current capacity x utilization, capped at max capacity).
4. Determine effective demand (salespeople x units per rep per period, compounded by organic growth rate).
5. Find when supply utilization hits the threshold OR when demand exceeds supply by the backlog tolerance window.
6. Record the bottleneck event (type, date, supply level, demand level, backlog, financials at that moment).
7. If auto-resolve is enabled: apply the user-defined refill increment (capacity units or salespeople), apply ramp time (zero output during ramp), re-evaluate threshold, repeat until under threshold, then resume.
8. If auto-resolve is disabled: continue projecting past the bottleneck to show degradation curve until the 4-year horizon.
9. Repeat until the simulation horizon (4 years) is reached.

### Bottleneck Priority Rule

When both supply and demand could bottleneck simultaneously, resolve demand first. Backlog builds on the demand side. Supply constraint is secondary. This matches real-world sales-led growth dynamics.

### Ramp Time

When new capacity or new salespeople are added (via auto-resolve or manual scenario input), they contribute **zero output** during the ramp period. After ramp completes, they contribute full output. Default ramp = 3 months. Configurable per scenario.

### Time Normalization

All internal calculations should use a **monthly** base unit. User inputs can be in daily, weekly, monthly, or annual rates. Normalize all inputs to monthly at calculation time. Display outputs in the most readable unit given context.

---

## Configuration Inputs

All inputs are per-scenario. Scenarios branch from a shared baseline. Each input should have inline help text (tooltip or label description).

### Capacity

| Parameter | Type | Default | Notes |
|---|---|---|---|
| Capacity unit label | string | "units" | User defines (e.g., "widgets", "patients", "jobs") |
| Starting capacity | number | required | Total available capacity at t=0 |
| Current utilization % | number | required | % of capacity currently in use |
| Max capacity | number | required | Hard ceiling before expansion is required |
| Cost per unit of capacity | currency | required | One-time CapEx per unit added |

### Sales / Demand

| Parameter | Type | Default | Notes |
|---|---|---|---|
| Number of salespeople | number | required | Headcount at t=0 |
| Units per salesperson | number | required | Avg units sold per rep per selected period |
| Units timeframe | select | monthly | daily, weekly, monthly, annually |
| Salesperson annual cost | currency | required | Fully loaded cost per rep (salary + benefits + overhead) |
| Organic demand growth rate | % | 0 | Annual % growth applied to demand independent of headcount |

### Financial

| Parameter | Type | Default | Notes |
|---|---|---|---|
| Revenue per unit | currency | required | Selling price per unit |
| Gross profit % | % | required | Blended margin applied to all revenue |

### Simulation Behavior

| Parameter | Type | Default | Notes |
|---|---|---|---|
| Simulation horizon | select | 4 years | Fixed at now / 1yr / 2yr / 4yr milestones |
| Ramp time | months | 3 | Applies to both new capacity and new hires |
| Backlog tolerance window | months | 0 | 0 = lost revenue immediately; >0 = backlog carried forward this many months before becoming lost |
| Auto-resolve enabled | toggle | off | When off, sim shows raw degradation; when on, applies refill at threshold |
| Auto-resolve threshold | % | 90 | Triggers refill when utilization hits this % |
| Capacity refill increment | number | required if auto-resolve on | Units of capacity to add per refill event |
| Headcount refill increment | number | required if auto-resolve on | Salespeople to add per refill event |

---

## Scenario Management

### Behavior

- On first load, a default scenario ("Baseline") is created from empty/default inputs.
- User configures inputs and runs the simulation.
- User can snapshot the current config as a named scenario.
- Snapshots are stored in localStorage keyed by scenario ID.
- Creating a new scenario from an existing one copies all current values; user then tweaks independently.
- Up to 5 scenarios can be active simultaneously for comparison.
- Scenarios can be renamed or deleted.
- The active/selected scenario drives the configuration panel on the left.

### Data Model (localStorage)

```json
{
  "scenarios": [
    {
      "id": "uuid",
      "name": "Baseline",
      "createdAt": "ISO timestamp",
      "config": { ...all input values... },
      "simulationResult": { ...cached result or null... }
    }
  ]
}
```

---

## Output: Charts

Use Recharts. All charts should support multi-scenario overlay (one series per scenario, distinct colors).

### Chart 1: Supply vs. Demand Over Time

- X-axis: time (months 0-48)
- Y-axis: units (capacity unit label)
- Lines: effective supply, effective demand, max capacity ceiling (dashed)
- Markers: bottleneck events (distinct icon/color per type: supply vs. demand)
- If backlog enabled: shaded area between demand and supply during backlog window

### Chart 2: Cumulative CapEx and Headcount Cost

- X-axis: time
- Y-axis: cumulative dollars
- Stacked area or dual-line: CapEx spend vs. headcount cost
- Annotate each spend event

### Chart 3: Revenue and Gross Profit

- X-axis: time
- Y-axis: dollars
- Lines: projected revenue, projected gross profit
- Shaded area for lost revenue during backlog/overflow periods

### Chart 4: Bottleneck Events Timeline

- Horizontal timeline chart (Gantt-style)
- Shows each bottleneck event, type, duration if applicable, and resolution action taken (if auto-resolve on)

All charts: include a legend, tooltips on hover with full event detail, and zoom/pan for the 4-year view.

---

## Output: Tables

### Bottleneck Events Table

| Date | Month | Event Type | Supply | Demand | Utilization % | Backlog | Action Taken | CapEx Triggered | Revenue Impact |
|---|---|---|---|---|---|---|---|---|---|

### Financial Summary Table

| Period | Revenue | Gross Profit | Cumulative CapEx | Cumulative Headcount Cost | Lost Revenue | Net |
|---|---|---|---|---|---|---|

Periods: now, 6mo, 12mo, 24mo, 48mo.

### Capacity Expansion Log

| Date | Type (capacity/headcount) | Units Added | Cost | Ramp Completes |
|---|---|---|---|---|

---

## Export

### PDF

- Use jsPDF + html2canvas or jsPDF autotable
- Include: scenario name, all config inputs, all charts (rendered as images), all tables
- Page header with scenario name and export date
- Clean print layout, no debug UI

### Excel

- Use SheetJS
- One sheet per: Bottleneck Events, Financial Summary, Capacity Log, Raw Monthly Data
- Include scenario name in header row of each sheet
- Multi-scenario export: prefix each row with scenario name/ID

### CSV

- Flat export of raw monthly simulation data
- One file per scenario or combined with scenario column

Export buttons should be visible in the output panel header. Export should work entirely client-side.

---

## UI Layout

### Overall Layout

Three-panel layout:

```
[ Scenario Bar (top) ]
[ Config Panel (left) | Simulation Output (center/right) ]
```

- **Scenario Bar**: tabs or pills for each active scenario, add/remove/rename controls, compare toggle
- **Config Panel**: all input fields, organized in collapsible sections (Capacity, Sales, Financial, Simulation Behavior), run simulation button at bottom
- **Output Panel**: tabs for Charts / Tables / Summary, export buttons in header

### Responsive

Desktop-first. Minimum viable at 1280px wide. Does not need to be mobile-optimized.

### Design Aesthetic

Professional, data-dense, consulting-grade. Think Bloomberg terminal meets modern SaaS dashboard. Dark or light mode optional but pick one and execute it well. Avoid generic AI dashboard aesthetics. Use a distinctive font pairing. The tool should feel credible enough to put in front of a client.

---

## State Management

Use React Context + useReducer for global simulation state. Do not use Redux or any external state library.

Context should hold:
- All scenarios (array)
- Active scenario ID
- Comparison mode (boolean) + selected comparison scenario IDs
- UI state (active tab, panel collapsed states)

Simulation results are derived from config inputs via pure simulation functions. Cache results on scenario object after run. Re-run simulation when inputs change (debounced, not on every keystroke).

---

## Validation

- All required fields must be validated before simulation runs
- Show inline validation errors on blur
- Prevent simulation run if any required field is empty or out of range
- Warn (not block) if: max capacity equals starting capacity, organic growth rate exceeds 50%, backlog window exceeds 12 months

---

## Edge Cases to Handle

- Demand never catches supply: show flat utilization line, note no bottleneck within horizon
- Supply is already at max capacity at t=0: flag immediately as day-0 bottleneck
- Auto-resolve fires but refill increment is 0: show warning and disable auto-resolve
- Backlog window = 0 and demand exceeds supply: all overflow is lost revenue, no carry-forward
- Multiple bottleneck events in the same month: log all, resolve in order (demand first)
- Ramp period extends beyond simulation horizon: cap at horizon, note partial ramp

---

## Not In Scope (v1)

- Backend, database, or user accounts
- Partial ramp productivity (ramp = zero output until complete)
- Multiple simultaneous capacity constraints
- Cost of sales / variable cost modeling beyond blended GP%
- Import from external data sources
- Real-time collaboration
- Mobile layout

---

## Acceptance Criteria

1. User can configure all inputs listed above and run a simulation.
2. Simulation correctly identifies bottleneck events on supply and demand sides.
3. Auto-resolve toggle correctly applies refill increments with ramp delay and re-evaluates.
4. Backlog accumulates and converts to lost revenue after tolerance window.
5. Charts render correctly for single scenario and multi-scenario comparison.
6. Tables show correct event log, financial summary, and expansion log.
7. Scenarios can be created, named, branched, compared, and persisted in localStorage.
8. Export to PDF, Excel, and CSV works client-side with no server dependency.
9. Simulation state re-runs when inputs change (debounced).
10. All validation rules enforced before simulation runs.
11. App loads and runs in a standard Vite + React setup with no errors.