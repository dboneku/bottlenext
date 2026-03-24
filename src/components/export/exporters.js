import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export async function exportScenarioToPdf(model, rootElement) {
  const pdf = new jsPDF('p', 'pt', 'a4')
  pdf.setFontSize(18)
  pdf.text('BottleNext Simulation Report', 40, 40)
  pdf.setFontSize(10)
  pdf.text(`Exported ${new Date().toLocaleString()}`, 40, 58)

  const canvas = await html2canvas(rootElement, { backgroundColor: '#f8fafc', scale: 1.4 })
  const image = canvas.toDataURL('image/png')
  const width = 515
  const height = (canvas.height * width) / canvas.width
  pdf.addImage(image, 'PNG', 40, 80, width, height)

  pdf.addPage()
  autoTable(pdf, {
    head: [['Date', 'Type', 'Supply', 'Demand', 'Backlog', 'Revenue Impact']],
    body: model.simulationResult.events.map((event) => [
      event.dateLabel,
      event.eventType,
      Math.round(event.supply),
      Math.round(event.demand),
      Math.round(event.backlog),
      Math.round(event.revenueImpact),
    ]),
    startY: 40,
  })

  pdf.save('bottlenext-report.pdf')
}

export function exportScenarioToExcel(model) {
  const workbook = XLSX.utils.book_new()

  const eventRows = model.simulationResult.events.map((event) => ({ ...event }))
  const financialRows = model.simulationResult.financialSummary.map((row) => ({ ...row }))
  const capacityRows = model.simulationResult.capacityLog.map((row) => ({ ...row }))
  const rawRows = model.simulationResult.monthlyData.map((row) => ({ ...row }))

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(eventRows), 'Bottleneck Events')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(financialRows), 'Financial Summary')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(capacityRows), 'Capacity Log')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rawRows), 'Raw Monthly Data')
  XLSX.writeFile(workbook, 'bottlenext-report.xlsx')
}

export function exportScenarioToCsv(model) {
  const rows = model.simulationResult.monthlyData.map((row) => ({ ...row }))
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
