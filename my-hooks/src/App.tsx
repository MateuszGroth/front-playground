import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useURLQueryState } from './hooks/useURLQueryState'

function App() {
  const nav = useNavigate()
  const [state, setState] = useURLQueryState({
    key: 'test',
    initialValue: 'test',
    parseValue: (val) => val ?? '',
    formatValue: (val) => (val ? val : undefined),
  })

  console.log(state)
  return (
    <div className="App">
      HI
      <div className="cont">
        <div>
          <input value={state} onChange={(ev) => setState(ev.target.value)} />
          <button onClick={() => nav('/', { replace: true })}>Test</button>
        </div>
      </div>
    </div>
  )
}

export default App
