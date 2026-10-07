// DeferredDemo — shows where useDeferredValue actually helps.
//
// The slow work is split into 300 small components (~1ms each),
// so React can pause between them and handle your typing first.
// Try swapping `deferredText` for `text` below to feel the difference.

import { useState, useDeferredValue, memo } from 'react'

function SlowItem({ text }) {
  const start = performance.now()
  while (performance.now() - start < 1) {} // ~1ms of fake work
  return <li>{text}</li>
}

const SlowList = memo(function SlowList({ text }) {
  const items = []
  for (let i = 0; i < 300; i++) {
    items.push(<SlowItem key={i} text={text} />)
  }
  return <ul>{items}</ul>
})

function DeferredDemo() {
  const [text, setText] = useState('')
  const deferredText = useDeferredValue(text)
console.log('text:', text, '| deferred:', deferredText)

  return (
    <section>
      <h2>useDeferredValue demo</h2>
      <input
        placeholder="Type fast here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <SlowList text={deferredText} />
    </section>
  )
}

export default DeferredDemo
