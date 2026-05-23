import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const redirect =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'lawyer'
          ? '/lawyer'
          : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
