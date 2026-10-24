import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { tg } from './lib/telegram'

tg.init()
if (tg.isTelegram) document.documentElement.classList.add('tg')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
