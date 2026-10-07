# React Optimization Lab — Learning Notes

A small Vite + React app that started out **deliberately unoptimized**: a heavy
report that imports big libraries and a 2.8 MB data file, rendered from an
`App` with unrelated state (counter, theme, search). These notes record each
optimization I made, why it works, and how I measured it.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # shows bundle sizes
```

Regenerate the large data file with `node scripts/generate-data.js`.

## Bundle size

| Stage | Main JS (`index`) | Report chunk | Notes |
|---|---|---|---|
| Starting point | 2,717 kB (268 kB gzip) | — | Everything in one file |
| Now | 223 kB (70 kB gzip) | 2,385 kB (161 kB gzip) | Report is lazy-loaded; lodash/moment slimmed |

The first screen now downloads ~12× less JavaScript. The report's code is only
fetched when "Show report" is clicked.

## What I optimized

### 1. Code splitting — `React.lazy` + `Suspense` (`App.jsx`)
```jsx
const HeavyReport = lazy(() => import('./components/HeavyReport'))
<Suspense fallback={<p>report loading..</p>}>…</Suspense>
```
A static `import` puts a component in the main bundle even if it is never shown.
`lazy` + dynamic `import()` makes Vite emit a separate chunk that loads on
demand. `Suspense` shows a fallback while the chunk downloads.

### 2. Smaller library imports (`HeavyReport.jsx`)
`import _ from 'lodash'` pulls in the whole library. Importing only the
functions used (`lodash/groupBy`, `lodash/sumBy`, …) ships just those.

### 3. Replacing a heavy library with the platform (`utils/date.js`)
`moment` is large and not tree-shakeable. The browser's built-in
`Intl.DateTimeFormat` and `Intl.RelativeTimeFormat` cover what the app needed
(`formatDate`, `fromNow`) with zero bundle cost.

### 4. `useMemo` for expensive calculations
The filter over 10,000 orders is wrapped in `useMemo(..., [search])`, so it only
reruns when the search changes — not when the theme or a page button changes.
Measured with `console.time('filter')`.

### 5. Stable props for children — `useMemo` / `useCallback`
A new object or function is created on every render, so a memoized child sees
"new" props every time. `rowStyle` uses `useMemo([theme])` and
`handleRowClick` uses `useCallback([])` so their identity stays the same.

### 6. `React.memo` (`OrderRow.jsx`, `HeavyReport.jsx`)
`memo` skips re-rendering a component when its props are shallow-equal to last
time. Clicking the counter no longer re-renders the report. Note that `memo`
only works together with #5: unstable props defeat it.

### 7. Stable keys
`key={index}` → `key={order.id}`. Index keys break when the list is filtered or
reordered: React reuses the wrong DOM rows and memoized rows re-render anyway.

### 8. Rendering less DOM — pagination
Only 50 rows (`PAGE_SIZE`) are rendered at a time instead of all 10,000.
Resetting to page 1 when the search changes uses the "adjust state during
render" pattern (compare with `prevSearch`) instead of a `useEffect`, which
avoids an extra render.

### 9. Debouncing the search (`App.jsx`)
The input updates `search` on every keystroke, but the report receives
`debouncedSearch`, which is set 300 ms after typing stops (`setTimeout` in a
`useEffect`, cleared on the next keystroke). The expensive render runs once per
pause, not once per key.

### 10. `useDeferredValue` (`DeferredDemo.jsx`)
`useDeferredValue` lets React render the input immediately and the slow list
afterwards, interrupting the slow render if more typing comes in. It only helps
when the slow work is split across many components (here 300 × ~1 ms) so React
has places to pause — one big blocking calculation can't be interrupted.
Swap `deferredText` for `text` in the demo to feel the difference.

**Debounce vs. `useDeferredValue`:** debounce waits a fixed time and skips work;
`useDeferredValue` does the work as soon as the browser is free and drops stale
renders. No fixed delay, but the work must be interruptible.

## How I measured
- `npm run build` — chunk sizes before/after.
- `console.log` / `console.time` inside components — what re-renders and how long it takes.
- React DevTools **Profiler** — which components rendered on each interaction and why.

## Still exploring
<!-- Add the next things you find and fix here. -->
