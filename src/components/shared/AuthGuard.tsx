import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

interface Props {
  children: React.ReactNode
}

export function AuthGuard({ children }: Props) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
