// HeavyReport — written WITHOUT any optimization, on purpose.
//
// Things that are "wrong" here (try to spot / fix them one by one):
//  - imports the WHOLE lodash library instead of single functions
//  - imports moment (big, not tree-shakeable)
//  - imports a 2.8 MB data file statically, so it lands in the main bundle
//  - recomputes expensive stats on EVERY render (no useMemo)
//  - creates new functions/objects on every render and passes them to children
//  - renders thousands of rows into the DOM at once (no pagination/virtualization)
//  - uses array index as the key

// Only the 5 lodash functions we use, not the whole library
import groupBy from 'lodash/groupBy'
import map from 'lodash/map'
import sumBy from 'lodash/sumBy'
import orderBy from 'lodash/orderBy'
import round from 'lodash/round'
import { orders } from '../data/bigData'
import OrderRow from './OrderRow'
import { formatDate } from '../utils/date'
import { memo, useCallback, useMemo, useState } from 'react'

const PAGE_SIZE = 50

function HeavyReport({ search, theme }) {
  const [page, setPage] = useState(0)

  // Go back to page 1 whenever the search changes
  const [prevSearch, setPrevSearch] = useState(search)
  if (search !== prevSearch) {
    setPrevSearch(search)
    setPage(0)
  }

  console.log('HeavyReport rendered — search:', JSON.stringify(search), '| theme:', theme)

  // Expensive work done on every single render
  console.time('filter')
  const filtered = useMemo(() => {
    return orders.filter(
      (o) =>
        o.customer.toLowerCase().includes(search.toLowerCase()) ||
        o.city.toLowerCase().includes(search.toLowerCase())
    )
  },[search])
  // const filtered = orders.filter(
  //   (o) =>
  //     o.customer.toLowerCase().includes(search.toLowerCase()) ||
  //     o.city.toLowerCase().includes(search.toLowerCase())
  // )
  console.timeEnd('filter')

  console.time('group + sort')

  const byCity = groupBy(filtered, 'city')
  const cityTotals = map(byCity, (list, city) => ({
    city,
    total: sumBy(list, 'amount'),
    count: list.length,
  }))
  const sortedCities = orderBy(cityTotals, ['total'], ['desc'])
  console.timeEnd('group + sort')

  // Artificial slowness so the cost is easy to feel
  console.time('waste loop')
  let waste = 0
  for (let i = 0; i < 20_000_000; i++) waste += i
  console.timeEnd('waste loop')

  // New object + new function every render
  const rowStyle = useMemo(() => {
 return { color: theme === 'dark' ? '#eee' : '#222' }
  }, [theme])

  // const rowStyle = { color: theme === 'dark' ? '#eee' : '#222' }
  
  const handleRowClick = useCallback((order) =>{
   alert(`${order.customer} spent ₹${order.amount} on ${formatDate(order.date)}`)
  },[])
  // const handleRowClick = (order) => {
  //   alert(`${order.customer} spent ₹${order.amount} on ${moment(order.date).format('Do MMM YYYY')}`)
  // }

  // Only draw one page of rows instead of all of them
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section>
      <h2>Order report ({filtered.length} orders)</h2>

      <h3>Totals by city</h3>
      <ul>
        {sortedCities.map((c) => (
          <li key={c.city}>
            {c.city}: ₹{round(c.total, 2)} ({c.count} orders)
          </li>
        ))}
      </ul>

      <h3>All orders</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Customer</th>
            <th>City</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {pageRows.map((order) => (
            <OrderRow key={order.id} order={order} style={rowStyle} onClick={handleRowClick} />
          ))}
        </tbody>
      </table>

      <div>
        <button onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
          Previous
        </button>
        <span> Page {page + 1} of {totalPages} </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
          Next
        </button>
      </div>
    </section>
  )
}

export default memo(HeavyReport)
