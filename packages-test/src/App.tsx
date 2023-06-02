import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import TestSearchParams from './pages/TestSearchParams'

const Query = lazy(async () => import('./pages/Query'))
const Interview = lazy(async () => import('./pages/Interview'))

function App() {
  return (
    <Router>
      <div className="cont">
        <Suspense fallback={<div>Page is Loading...</div>}>
          {/* todo */}
          <Routes>
            <Route path="/" element={<>Testing packages</>} />
            <Route path="/int" element={<Interview />} />
            <Route path="/query" element={<Query />} />
            <Route path="/query/:id" element={<Query />} />
            <Route path="/params" element={<TestSearchParams />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App
