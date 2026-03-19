import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// NOTE: StrictMode removed intentionally — it causes double-invocation of
// useEffect which triggers Firebase listeners to be registered twice,
// leading to white screen / crash on startup.

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
