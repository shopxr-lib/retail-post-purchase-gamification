import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './ErrorBoundary.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<p className="text-red-500 text-center mt-10">Unexpected error occurred!</p>}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
