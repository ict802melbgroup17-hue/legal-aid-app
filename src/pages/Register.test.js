import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Register from './Register';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';
import { clearTestSession } from '../test-utils';

jest.mock('../services/api');

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<div>Client dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Register', () => {
  beforeEach(() => {
    clearTestSession();
    jest.clearAllMocks();
  });

  it('renders registration fields', () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('registers a new client and navigates to dashboard', async () => {
    api.register.mockResolvedValue({
      id: 3,
      name: 'Jane Doe',
      email: 'jane@gmail.com',
      role: 'client',
    });

    renderRegister();

    await userEvent.type(screen.getByLabelText(/full name/i), 'Jane Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'jane@gmail.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'secret12');
    await userEvent.type(screen.getByLabelText(/address/i), '10 Park Ave');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith({
        name: 'Jane Doe',
        email: 'jane@gmail.com',
        password: 'secret12',
        address: '10 Park Ave',
      });
    });

    expect(await screen.findByText('Client dashboard')).toBeInTheDocument();
  });
});
