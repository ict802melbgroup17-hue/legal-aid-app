const REQUEST_STYLES = {
  Pending: 'badge-pending',
  Reviewed: 'badge-reviewed',
  Assigned: 'badge-assigned',
  Rejected: 'badge-rejected',
};

const CASE_STYLES = {
  Filed: 'badge-filed',
  'Hearing Scheduled': 'badge-hearing',
  Resolved: 'badge-resolved',
  Closed: 'badge-closed',
};

export default function StatusBadge({ status, type = 'request' }) {
  const map = type === 'case' ? CASE_STYLES : REQUEST_STYLES;
  const className = map[status] || 'badge-default';
  return <span className={`badge ${className}`}>{status}</span>;
}
