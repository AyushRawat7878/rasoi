import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectUser } from '../store/authSlice'

// Wrap a page with this to make it login-only (or admin-only)
export default function RequireAuth({ children, admin = false }) {
  const user = useSelector(selectUser)
  const location = useLocation()
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
