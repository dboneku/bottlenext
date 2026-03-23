import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export async function exportScenarioToPdf(scenario, rootElement) {
  const pdf = new jsPDF('p', 'pt', 'a4')
  pdf.setFontSize(18)
  pdf.text(`${scenario.name} Simulation Report`, 40, 40)
  pdf.setFontSize(10)
  pdf.text(`Exported ${new Date().toLocaleString()}`, 40, 58)

  const canvas = await html2canvas(rootElement, { backgroundColor: '#06131f', scale: 1.4 })
  const image = canvas.toDataURL('image/png')
  const width = 515
  const height = (canvas.height * width) / canvas.width
  pdf.addImage(image, 'PNG', 40, 80, width, height)

  pdf.addPage()
  autoTable(pdf, {
    head: [['Date', 'Type', 'Supply', 'Demand', 'Backlog', 'Revenue Impact']],
    body: scenario.simulationResult.events.map((event) => [
      event.dateLabel,
      event.eventType,
      Math.round(event.supply),
      Math.round(event.demand),
      Math.round(event.backlog),
      Math.round(event.revenueImpact),
    ]),
    startY: 40,
  })

  pdf.save(`${scenario.name.toLowerCase().replace(/\s+/g, '-')}.pdf`)
}

export function exportScenarioToExcel(scenarios) {
  const workbook = XLSX.utils.book_new()

  const eventRows = scenarios.flatMap((scenario) =>
    scenario.simulationResult.events.map((event) => ({
      scenario: scenario.name,
      ...event,
    })),
  )
  const financialRows = scenarios.flatMap((scenario) =>
    scenario.simulationResult.financialSummary.map((row) => ({
      scenario: scenario.name,
      ...row,
    })),
  )
  const capacityRows = scenarios.flatMap((scenario) =>
    scenario.simulationResult.capacityLog.map((row) => ({
      scenario: scenario.name,
      ...row,
    })),
  )
  const rawRows = scenarios.flatMap((scenario) =>
    scenario.simulationResult.monthlyData.map((row) => ({
      scenario: scenario.name,
      ...row,
    })),
  )

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(eventRows), 'Bottleneck Events')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(financialRows), 'Financial Summary')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(capacityRows), 'Capacity Log')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rawRows), 'Raw Monthly Data')
  XLSX.writeFile(workbook, 'bottlenext-scenarios.xlsx')
}

export function exportScenarioToCsv(scenarios) {
  const rows = scenarios.flatMap((scenario) =>
    scenario.simulationResult.monthlyData.map((row) => ({
      scenario: scenario.name,
      ...row,
    })),
  )
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(worksheet)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'bottlenext-raw-data.csv'
  link.click()
  URL.revokeObjectURL(url)
}
