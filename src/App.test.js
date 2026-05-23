import { render, screen } from '@testing-library/react';
import App from './App';
import { clearTestSession } from './test-utils';

describe('App', () => {
  beforeEach(() => {
    clearTestSession();
  });

  it('redirects visitors to the login page', async () => {
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: /legal aid connect/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
