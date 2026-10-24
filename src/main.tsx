import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { tg } from './lib/telegram'

tg.init()
const root = document.documentElement
if (tg.isTelegram) root.classList.add('tg')
const applyTheme = () => root.classList.toggle('dark', tg.isDark)
applyTheme()
tg.onThemeChange(applyTheme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
