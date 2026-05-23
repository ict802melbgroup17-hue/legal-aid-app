import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { mockDb } from './mockDb';
import { resetDemoData } from '../services/api';

const STORAGE_KEY = 'legalAidDb';

export function seedTestDb(db = mockDb) {
  resetDemoData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function clearTestSession() {
  sessionStorage.clear();
  localStorage.clear();
  resetDemoData();
}

export function renderWithProviders(ui, { route = '/', ...options } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
    options
  );
}

export function flushApiTimers() {
  jest.advanceTimersByTime(500);
}
