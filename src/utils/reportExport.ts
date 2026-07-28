import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import type { ReportByLeaveType, ReportMonthly, ReportSummary, ReportFrequentStudent } from '@/types/stats'

export interface ReportExportPayload {
  rangeLabel: string
  summary: ReportSummary
  byType: ReportByLeaveType[]
  monthly: ReportMonthly[]
  frequentStudents: ReportFrequentStudent[]
}

function fileTimestamp(): string {
  return new Date().toISOString().slice(0, 10)
}

export function exportReportToPdf({ rangeLabel, summary, byType, monthly, frequentStudents }: ReportExportPayload): void {
  const doc = new jsPDF()

  // ── Title & Period ───────────────────────────────────
  doc.setFontSize(16)
  doc.text('Leave Reports', 14, 18)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Period: ${rangeLabel}`, 14, 25)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

  // ── Summary Table ────────────────────────────────────
  autoTable(doc, {
    startY: 36,
    head: [['Metric', 'Value']],
    body: [
      ['Total Requests', String(summary.total)],
      ['Approved', String(summary.approved)],
      ['Pending', String(summary.pending)],
      ['Rejected', String(summary.rejected)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  })

  // ── By Leave Type Table ──────────────────────────────
  const afterSummaryY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.setTextColor(30)
  doc.text('Requests by Leave Type', 14, afterSummaryY)

  autoTable(doc, {
    startY: afterSummaryY + 4,
    head: [['Leave Type', 'Count']],
    body: byType.length ? byType.map((row) => [row.name, String(row.count)]) : [['No data', '-']],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  })

  // ── Monthly Summary Table ────────────────────────────
  const afterTypeY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.text('Monthly Summary', 14, afterTypeY)

  autoTable(doc, {
    startY: afterTypeY + 4,
    head: [['Month', 'Submitted', 'Approved', 'Rejected', 'Approval Rate']],
    body: monthly.length
      ? monthly.map((m) => [
          m.month,
          String(m.submitted),
          String(m.approved),
          String(m.rejected),
          `${m.approval_rate}%`,
        ])
      : [['No data', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  })

  // ── Frequent Students Table ───────────────────────────
  const afterMonthlyY = (doc as any).lastAutoTable.finalY + 10
  doc.setFontSize(12)
  doc.text('Students with More Than 3 Leave Requests in a Month', 14, afterMonthlyY)

  autoTable(doc, {
    startY: afterMonthlyY + 4,
    head: [['#', 'Student', 'Email', 'Month', 'Requests']],
    body: frequentStudents.length
      ? frequentStudents.map((s, i) => [String(i + 1), s.name, s.email, s.month_label, String(s.request_count)])
      : [['-', 'No data', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
  })

  doc.save(`leave-report-${fileTimestamp()}.pdf`)
}

export function exportReportToExcel({ rangeLabel, summary, byType, monthly, frequentStudents }: ReportExportPayload): void {
  const workbook = XLSX.utils.book_new()

  // ── Summary Sheet ────────────────────────────────────
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['Leave Report Summary'],
    ['Period', rangeLabel],
    ['Generated', new Date().toLocaleString()],
    [],
    ['Metric', 'Value'],
    ['Total Requests', summary.total],
    ['Approved', summary.approved],
    ['Pending', summary.pending],
    ['Rejected', summary.rejected],
  ])
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

  // ── By Leave Type Sheet ──────────────────────────────
  const byTypeSheet = XLSX.utils.json_to_sheet(
    byType.length ? byType.map((row) => ({ 'Leave Type': row.name, Count: row.count })) : [{ 'Leave Type': 'No data', Count: 0 }],
  )
  XLSX.utils.book_append_sheet(workbook, byTypeSheet, 'By Leave Type')

  // ── Monthly Summary Sheet ────────────────────────────
  const monthlySheet = XLSX.utils.json_to_sheet(
    monthly.length
      ? monthly.map((m) => ({
          Month: m.month,
          Submitted: m.submitted,
          Approved: m.approved,
          Rejected: m.rejected,
          'Approval Rate (%)': m.approval_rate,
        }))
      : [{ Month: 'No data', Submitted: 0, Approved: 0, Rejected: 0, 'Approval Rate (%)': 0 }],
  )
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Summary')

  // ── Frequent Students Sheet ───────────────────────────
  const frequentStudentsSheet = XLSX.utils.json_to_sheet(
    frequentStudents.length
      ? frequentStudents.map((s, i) => ({
          '#': i + 1,
          Student: s.name,
          Email: s.email,
          Month: s.month_label,
          Requests: s.request_count,
        }))
      : [{ '#': '-', Student: 'No data', Email: '-', Month: '-', Requests: 0 }],
  )
  XLSX.utils.book_append_sheet(workbook, frequentStudentsSheet, 'Frequent Students')

  XLSX.writeFile(workbook, `leave-report-${fileTimestamp()}.xlsx`)
}
