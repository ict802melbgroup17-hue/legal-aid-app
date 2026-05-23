import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const homePath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'lawyer'
        ? '/lawyer'
        : '/dashboard';

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <Link to={homePath} className="brand">
            <span className="brand-mark" aria-hidden="true" />
            Legal Aid Connect
          </Link>
          {user && (
            <div className="header-actions">
              <span className="user-chip">
                {user.name}
                <span className="role-tag">{user.role}</span>
              </span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="app-main">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
