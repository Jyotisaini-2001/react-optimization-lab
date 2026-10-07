import { lazy, Suspense, useEffect, useState } from 'react'
import DeferredDemo from './components/DeferredDemo'
import './App.css'
const HeavyReport =lazy(() => import('./components/HeavyReport'));

function App() {
  const [count, setCount] = useState(0)
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState('light')
  const [showReport, setShowReport] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [debouncedSearch, setDebouncedSearch] =useState('');


   useEffect(()=>{
    const id= setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
   },[search])

  return (
    <div className={`app ${theme}`}>
      <h1>React Optimization Lab</h1>

      {/* This counter has nothing to do with the report, yet clicking it re-renders HeavyReport */}
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>

      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Theme: {theme}
      </button>

      <button onClick={() => setShowReport(!showReport)}>
        {showReport ? 'Hide' : 'Show'} report
      </button>

      <button onClick={() => setShowDemo(!showDemo)}>
        {showDemo ? 'Hide' : 'Show'} deferred demo
      </button>

      {/* Every keystroke triggers the full expensive render */}
      <div>
        <input
          placeholder="Search customer or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {showReport &&
      <Suspense fallback={<p>report loading..</p>}>
        <HeavyReport search={debouncedSearch} theme={theme} />
      </Suspense>
      }


      {showDemo && <DeferredDemo />}
    </div>
  )
}

export default App
