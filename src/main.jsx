import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// ——— Service Worker Registration ———
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Registrado com sucesso:', registration.scope);

        // Detecta novas versões do SW e recarrega a página
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova versão disponível — avisar o SW para ativar imediatamente
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[SW] Falha no registro:', error);
      });
  });
}
