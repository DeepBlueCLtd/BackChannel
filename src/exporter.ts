import type { CommentEntry } from './storage'

function escapeCsvCell(cell: string | undefined): string {
  if (cell === undefined || cell === null) {
    return ''
  }
  const str = String(cell)
  // If the cell contains a comma, a double-quote, or a newline, wrap it in double-quotes.
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    // Also, any double-quote characters within the cell must be escaped by preceding them with another double-quote.
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportCommentsToCSV(comments: CommentEntry[]) {
  const headers = ['label', 'selector', 'text', 'timestamp', 'initials']
  const rows = comments.map(comment =>
    [
      escapeCsvCell(comment.label),
      escapeCsvCell(comment.selector),
      escapeCsvCell(comment.text),
      escapeCsvCell(comment.timestamp),
      escapeCsvCell(comment.initials)
    ].join(',')
  )

  const csvContent = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'backchannel-feedback.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
