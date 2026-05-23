import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as api from '../services/api';
import { clearTestSession } from '../test-utils';

jest.mock('../services/api');

function wrapper({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthContext', () => {
  beforeEach(() => {
    clearTestSession();
    jest.clearAllMocks();
  });

  it('login stores the user in session storage', async () => {
    const sessionUser = {
      id: 1,
      name: 'John Martinez',
      email: 'john@gmail.com',
      role: 'client',
    };
    api.login.mockResolvedValue(sessionUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({
        email: 'john@gmail.com',
        password: 'password123',
        role: 'client',
      });
    });

    expect(result.current.user).toEqual(sessionUser);
    expect(sessionStorage.getItem('legalAidSession')).toBe(
      JSON.stringify(sessionUser)
    );
  });

  it('login sets error message on failure', async () => {
    api.login.mockRejectedValue(new Error('Invalid email or password'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await expect(
        result.current.login({
          email: 'bad@gmail.com',
          password: 'x',
          role: 'client',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    expect(result.current.error).toBe('Invalid email or password');
    expect(result.current.user).toBeNull();
  });

  it('register persists a new session', async () => {
    const sessionUser = {
      id: 3,
      name: 'Jane Doe',
      email: 'jane@gmail.com',
      role: 'client',
    };
    api.register.mockResolvedValue(sessionUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        name: 'Jane Doe',
        email: 'jane@gmail.com',
        password: 'secret',
        address: '1 Main St',
      });
    });

    expect(api.register).toHaveBeenCalled();
    expect(result.current.user).toEqual(sessionUser);
  });

  it('logout clears session', async () => {
    sessionStorage.setItem(
      'legalAidSession',
      JSON.stringify({ id: 1, name: 'John', email: 'j@e.com', role: 'client' })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.user).not.toBeNull());

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(sessionStorage.getItem('legalAidSession')).toBeNull();
  });

  it('throws when useAuth is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider'
    );
    consoleError.mockRestore();
  });
});
