import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { role: 'client', email: 'john@gmail.com', password: 'password123' },
  { role: 'admin', email: 'admin@legalconnect.com', password: 'admin123' },
  { role: 'lawyer', email: 'sarah.law@legalconnect.com', password: 'lawyer123' },
];

export default function Login() {
  const { user, login, loading, error, setError } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectForRole = (userRole) => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'lawyer') return '/lawyer';
    return '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login({ email, password, role });
      navigate(redirectForRole(user.role));
    } catch {
      /* error handled in context */
    }
  };

  useEffect(() => {
    if (user) {
      navigate(
        user.role === 'admin'
          ? '/admin'
          : user.role === 'lawyer'
            ? '/lawyer'
            : '/dashboard',
        { replace: true }
      );
    }
  }, [user, navigate]);

  const fillDemo = (account) => {
    setRole(account.role);
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="brand-mark large" aria-hidden="true" />
          <h1>Legal Aid Connect</h1>
          <p>Sign in to manage legal aid requests and cases</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>I am signing in as</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="client">Client</option>
              <option value="admin">Administrator</option>
              <option value="lawyer">Lawyer</option>
            </select>
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {role === 'client' && (
          <p className="auth-footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        )}

        <div className="demo-panel">
          <p className="demo-title">Demo accounts</p>
          <ul className="demo-list">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.role}>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => fillDemo(account)}
                >
                  Use {account.role} demo
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
