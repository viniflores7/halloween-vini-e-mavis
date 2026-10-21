import { BrowserRouter } from 'react-router'
import { AppRoutes } from './AppRoutes'
import { VercelInsights } from './VercelInsights'

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      {import.meta.env.PROD && <VercelInsights />}
    </BrowserRouter>
  )
}
