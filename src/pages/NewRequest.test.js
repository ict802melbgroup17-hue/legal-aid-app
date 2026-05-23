import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NewRequest from './NewRequest';
import { AuthProvider } from '../context/AuthContext';
import * as api from '../services/api';
import { clearTestSession } from '../test-utils';

jest.mock('../services/api');

const clientUser = {
  id: 1,
  name: 'John Martinez',
  email: 'john@gmail.com',
  role: 'client',
};

describe('NewRequest', () => {
  beforeEach(() => {
    clearTestSession();
    jest.clearAllMocks();
  });

  it('submits a legal aid request', async () => {
    api.createRequest.mockResolvedValue({
      id: 3,
      request_details: 'Need help with contract dispute',
      email: clientUser.email,
      status: 'Pending',
    });

    sessionStorage.setItem('legalAidSession', JSON.stringify(clientUser));
    render(
      <MemoryRouter initialEntries={['/request/new']}>
        <AuthProvider>
          <Routes>
            <Route path="/request/new" element={<NewRequest />} />
            <Route path="/dashboard" element={<div>My requests</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    await userEvent.type(
      screen.getByLabelText(/details of your legal issue/i),
      'Need help with contract dispute'
    );
    await userEvent.click(screen.getByRole('button', { name: /submit request/i }));

    await waitFor(() => {
      expect(api.createRequest).toHaveBeenCalledWith({
        email: clientUser.email,
        request_details: 'Need help with contract dispute',
      });
    });

    expect(await screen.findByText('My requests')).toBeInTheDocument();
  });
});
