import React from 'react'

function App() {
  return (
    <div
      className="App"
      style={{
        display: 'grid',
        justifyItems: 'center',
        alignItems: 'start',
        padding: '20px 0',
        height: '100vh',
        background: '#F5F8FE',
        gridTemplateRows: 'auto auto 1fr auto',
      }}
    >
      <h2 style={{ marginBottom: '2rem' }}>Imagine some content here</h2>
      <span style={{ marginBottom: '0.5rem' }}>(Iframe below)</span>
      <iframe
        title="test"
        id="iframe"
        style={{ width: '100%', height: '100%', minHeight: '900px', border: 0 }}
        src="https://app.bthexocean.com/jobs-list/?iframe=true"
      />
      <span style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>(end of iframe)</span>
      <h2 style={{ marginBottom: '2rem' }}>Some content at the bottom</h2>
    </div>
  )
}

export default App
