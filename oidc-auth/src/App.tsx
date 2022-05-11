import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="App">
      <header>
        <NavLink to="/">Main</NavLink>
        <NavLink to="/priv">Priv</NavLink>
      </header>
      <div className="cont">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/priv" element={<Private />} />
        </Routes>
      </div>
    </div>
  )
}

const Main = () => {
  return <h2>Main Page</h2>
}
const Private = () => {
  return <h2>Private Page</h2>
}

export default App
