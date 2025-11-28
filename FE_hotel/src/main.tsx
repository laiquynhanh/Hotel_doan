import ReactDOM from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
// Sona plugin CSS
import './assets/css/font-awesome.min.css'
import './assets/css/elegant-icons.css'
import './assets/css/flaticon.css'
import './assets/css/owl.carousel.min.css'
import './assets/css/nice-select.css'
import './assets/css/jquery-ui.min.css'
import './assets/css/magnific-popup.css'
import './assets/css/slicknav.min.css'
// Load Bootstrap before Sona style so Sona can override Bootstrap defaults
import 'bootstrap/dist/css/bootstrap.min.css'
// Sona main style should be after Bootstrap
import './assets/css/style.css'
// Project overrides last
import './index.css'
// Bootstrap JS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
// Notification system
import { NotificationProvider } from './context/NotificationContext.tsx'
import ToastContainer from './components/ToastContainer.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <App />
      <ToastContainer />
    </NotificationProvider>
  </StrictMode>
)
