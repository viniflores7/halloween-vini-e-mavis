import { Navigate, Route, Routes } from 'react-router'
import { CostumeContestPage } from '@/features/costume-contest'
import { HomePage } from '@/features/home'
import { FramedLayout } from './layout/FramedLayout'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<FramedLayout />}>
        <Route index element={<HomePage />} />
        <Route path="concurso" element={<CostumeContestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
