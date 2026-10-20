import { Navigate, Route, Routes } from 'react-router'
import { ContestPage } from '@/features/contest'
import { GamePage } from '@/features/game'
import { HomePage } from '@/features/home'
import { AmongUsEntryPage, ContestEntryPage } from '@/features/room-entry'
import { FramedLayout } from './layout/FramedLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<FramedLayout />}>
        <Route index element={<HomePage />} />
        <Route path="concurso" element={<ContestEntryPage />} />
        <Route path="concurso/:code" element={<ContestPage />} />
        <Route path="jogatina" element={<AmongUsEntryPage />} />
        <Route path="sala/:code" element={<GamePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
