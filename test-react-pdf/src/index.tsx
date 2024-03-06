import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.scss'
import App from './App'
import { onServiceWorkerUpdate } from './utils/onServiceWorkerUpdate'
import reportWebVitals from './reportWebVitals'
import * as serviceWorker from './serviceWorker'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

if (process.env.NODE_ENV !== 'development') {
  const config = {
    onUpdate: onServiceWorkerUpdate,
  }
  serviceWorker.register(config)
} else {
  serviceWorker.unregister()
}
