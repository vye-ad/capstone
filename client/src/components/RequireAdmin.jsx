import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/signin" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/home" replace />;

  return children;
}
