import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Login from './Login';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';
import { clearTestSession } from '../test-utils';

jest.mock('../services/api');

function renderLogin(initialRoute = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<div>Client dashboard</div>} />
          <Route path="/admin" element={<div>Admin dashboard</div>} />
          <Route path="/lawyer" element={<div>Lawyer dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Login', () => {
  beforeEach(() => {
    clearTestSession();
    jest.clearAllMocks();
  });

  it('renders the sign-in form', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /legal aid connect/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
  });

  it('submits credentials and navigates client to dashboard', async () => {
    api.login.mockResolvedValue({
      id: 1,
      name: 'John Martinez',
      email: 'john@gmail.com',
      role: 'client',
    });

    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'john@gmail.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith({
        email: 'john@gmail.com',
        password: 'password123',
        role: 'client',
      });
    });

    expect(await screen.findByText('Client dashboard')).toBeInTheDocument();
  });

  it('shows an error when login fails', async () => {
    api.login.mockRejectedValue(new Error('Invalid email or password'));

    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@gmail.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'bad');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('fills demo account credentials', async () => {
    renderLogin();

    await userEvent.click(screen.getByRole('button', { name: /use admin demo/i }));

    expect(screen.getByLabelText(/email/i)).toHaveValue('admin@legalconnect.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('admin123');
    expect(screen.getByLabelText(/signing in as/i)).toHaveValue('admin');
  });
});
