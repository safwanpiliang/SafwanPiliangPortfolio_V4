import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'motion/react'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Honour the OS "reduce motion" setting for every Motion animation */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
)
