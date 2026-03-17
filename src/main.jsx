import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './providers/AuthProvider.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ToastContainer from './components/ToastContainer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>

        <ToastContainer />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)