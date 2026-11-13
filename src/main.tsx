import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { StoreDataProvider } from './context/StoreDataContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StoreDataProvider>
    <App />
  </StoreDataProvider>
);
