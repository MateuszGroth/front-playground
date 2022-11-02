import { useNavigate } from 'react-router-dom'
import { useURLQueryState } from './hooks/useURLQueryState'
import useLocalStorage from './hooks/useLocalStorage'

function App() {
  const nav = useNavigate()
  const [text, setText] = useLocalStorage('text', '')
  const [state, setState] = useURLQueryState({
    key: 'test',
    initialValue: 'test',
    parseValue: (val) => val ?? '',
    formatValue: (val) => (val ? val : undefined),
  })

  return (
    <div className="App">
      HI
      <div className="cont">
        <div>
          <input value={state} onChange={(ev) => setState(ev.target.value)} />
          <button onClick={() => nav('/', { replace: true })}>Test</button>
        </div>
        <div>
          <input value={text} onChange={(ev) => setText(ev.target.value)} />
          <button
            onClick={() =>
              setText((prevText) => {
                console.log(prevText)
                return ''
              })
            }
          >
            Text reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
