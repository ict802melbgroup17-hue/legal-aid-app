import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders request status with matching style class', () => {
    render(<StatusBadge status="Pending" />);
    const badge = screen.getByText('Pending');
    expect(badge).toHaveClass('badge', 'badge-pending');
  });

  it('renders case status when type is case', () => {
    render(<StatusBadge status="Hearing Scheduled" type="case" />);
    const badge = screen.getByText('Hearing Scheduled');
    expect(badge).toHaveClass('badge-hearing');
  });

  it('uses default style for unknown status', () => {
    render(<StatusBadge status="Unknown" />);
    expect(screen.getByText('Unknown')).toHaveClass('badge-default');
  });
});
