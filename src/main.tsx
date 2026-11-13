import React from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { StoreDataProvider } from './context/StoreDataContext.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
}

class StoreErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090B] text-[#F5F2EB] flex flex-col items-center justify-center p-6 text-center font-sans">
          <h1 className="font-serif-luxury text-3xl text-[#D5BA80] mb-3">
            FABRICIAN Storefront
          </h1>
          <p className="text-sm text-[#9A9892] max-w-md mb-6">
            A temporary display interruption occurred. Reload to restore your shopping bag and catalog view.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-lg bg-[#B69A60] hover:bg-[#D5BA80] text-[#09090B] text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
          >
            Reload Storefront
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  <StoreErrorBoundary>
    <StoreDataProvider>
      <App />
    </StoreDataProvider>
  </StoreErrorBoundary>
);
