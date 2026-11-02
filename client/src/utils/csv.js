// Small CSV helpers for exporting table data. No dependencies.

// A leading =, +, -, @, tab or carriage return makes Excel/Sheets treat a cell as a formula (OWASP). Item names come from
// server data, so text cells starting with these characters get a leading apostrophe
// (the usual CSV-injection mitigation). Numbers are written raw and never go through this.
const FORMULA_TRIGGER = /^[=+\-@\t\r]/

const escapeCell = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''

  let text = String(value)
  if (FORMULA_TRIGGER.test(text)) text = `'${text}`

  // RFC 4180: quote cells containing a comma, quote, or line break; double any inner quotes
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * Build CSV text from a header row and data rows (arrays of cells).
 * Uses CRLF line endings per RFC 4180.
 */
export function toCsv(headers, rows) {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n')
}

/**
 * Trigger a browser download of CSV text. The leading BOM makes Excel open the file as
 * UTF-8; without it, Japanese text (the app has a ja locale) shows up garbled.
 */
export function downloadCsv(filename, csvText) {
  const blob = new Blob(['\uFEFF', csvText], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  // Revoke after a short delay: revoking immediately cancels the download in some browsers
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
