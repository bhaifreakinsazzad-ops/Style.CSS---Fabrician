import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { StoreDataProvider } from './context/StoreDataContext.tsx';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      updateSW(true).catch(() => {});
    },
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        // Periodically check for deployed SW updates when active
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('Service worker registration error:', error);
    },
  });
}

createRoot(document.getElementById('root')!).render(
  <StoreDataProvider>
    <App />
  </StoreDataProvider>
);
