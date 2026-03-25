import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './Styles/index.css'
import './Styles/mediaquery.css'
import AppRoutes from './Routes/AppRoutes.tsx'
import { NotificationProvider } from './Components/NotifyProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </NotificationProvider>
  </StrictMode>,
)
