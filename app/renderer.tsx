import { WindowContextProvider, menuItems } from '@/lib/window'
import appIcon from '@/resources/build/icon.png'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <WindowContextProvider titlebar={{ title: 'Inventoria', icon: appIcon, menuItems }}>
      <App />
    </WindowContextProvider>
  </React.StrictMode>
)
