import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './i18n/config'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { initGtag } from './lib/gtag'
import GoogleAnalyticsRouteListener from './components/GoogleAnalyticsRouteListener.jsx'

initGtag()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <GoogleAnalyticsRouteListener />
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
