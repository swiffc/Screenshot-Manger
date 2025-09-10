import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// PWA: prompt user to update when a new SW is available
if ('serviceWorker' in navigator) {
  window.addEventListener('swUpdated', () => {
    const shouldReload = confirm('A new version is available. Reload now?');
    if (shouldReload) window.location.reload();
  });
}
