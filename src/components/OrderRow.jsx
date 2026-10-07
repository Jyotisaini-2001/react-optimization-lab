import { memo } from 'react'
import { fromNow } from '../utils/date'

// Wrapped in memo — only re-renders when order, style or onClick change.
function OrderRow({ order, style, onClick }) {
  return (
    <tr style={style} onClick={() => onClick(order)}>
      <td>{order.id}</td>
      <td>{order.customer}</td>
      <td>{order.city}</td>
      <td>{order.category}</td>
      <td>₹{order.amount}</td>
      <td>{fromNow(order.date)}</td>
    </tr>
  )
}

export default memo(OrderRow)
