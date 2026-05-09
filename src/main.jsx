import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SystemProvider } from './context/SystemContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SystemProvider>
          <App />
        </SystemProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
