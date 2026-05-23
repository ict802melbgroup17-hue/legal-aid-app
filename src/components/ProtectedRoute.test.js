import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../context/AuthContext';
import { clearTestSession } from '../test-utils';

function renderRoute(sessionUser, { path = '/protected', roles } = {}) {
  if (sessionUser) {
    sessionStorage.setItem('legalAidSession', JSON.stringify(sessionUser));
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/dashboard" element={<div>Client home</div>} />
          <Route path="/admin" element={<div>Admin home</div>} />
          <Route path="/lawyer" element={<div>Lawyer home</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute roles={roles}>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    clearTestSession();
  });

  it('redirects unauthenticated users to login', () => {
    renderRoute(null);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders children for authorized role', () => {
    renderRoute(
      { id: 1, name: 'John', email: 'john@gmail.com', role: 'client' },
      { roles: ['client'] }
    );
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects client away from admin-only route', () => {
    renderRoute(
      { id: 1, name: 'John', email: 'john@gmail.com', role: 'client' },
      { roles: ['admin'] }
    );
    expect(screen.getByText('Client home')).toBeInTheDocument();
  });

  it('redirects admin away from client-only route', () => {
    renderRoute(
      { id: 2, name: 'Admin', email: 'admin@legalconnect.com', role: 'admin' },
      { roles: ['client'] }
    );
    expect(screen.getByText('Admin home')).toBeInTheDocument();
  });
});
