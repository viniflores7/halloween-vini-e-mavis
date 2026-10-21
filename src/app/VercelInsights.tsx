import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useLocation } from 'react-router'
import { routePattern } from './routePattern'

export function VercelInsights() {
  const { pathname } = useLocation()
  const route = routePattern(pathname)

  return (
    <>
      <Analytics route={route} path={pathname} />
      <SpeedInsights route={route} />
    </>
  )
}
