// Small date helpers built on the browser's Intl API — replaces moment (no library needed).

const fullDate = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

// "2 Jan 2025"
export function formatDate(date) {
  return fullDate.format(new Date(date))
}

// "3 months ago", "yesterday", "in 2 days"
export function fromNow(date) {
  const seconds = (new Date(date) - Date.now()) / 1000
  const units = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return relative.format(Math.round(seconds), 'second')
}
