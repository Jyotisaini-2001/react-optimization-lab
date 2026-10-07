// Generates src/data/bigData.js — a deliberately LARGE file (~10k records)
// so you can see its cost in the bundle. Run: node scripts/generate-data.js
import { writeFileSync } from 'node:fs'

const cities = ['Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Jaipur', 'Chennai', 'Kolkata', 'Hyderabad']
const categories = ['Electronics', 'Books', 'Clothing', 'Grocery', 'Toys', 'Sports']

const rows = []
for (let i = 1; i <= 10000; i++) {
  rows.push({
    id: i,
    customer: `Customer ${i}`,
    city: cities[i % cities.length],
    category: categories[(i * 7) % categories.length],
    amount: Math.round(((i * 9301 + 49297) % 233280) / 233280 * 10000) / 100,
    date: new Date(Date.UTC(2025, 0, 1) + (i % 365) * 86400000).toISOString(),
    notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(2),
  })
}

writeFileSync('src/data/bigData.js', `// AUTO-GENERATED — do not edit\nexport const orders = ${JSON.stringify(rows, null, 2)}\n`)
console.log('wrote', rows.length, 'rows')
