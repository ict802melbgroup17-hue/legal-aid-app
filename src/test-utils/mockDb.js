export const mockDb = {
  users: [
    {
      id: 1,
      name: 'John Martinez',
      email: 'john@gmail.com',
      password: 'password123',
      address: '142 Oak Street',
      role: 'client',
    },
    {
      id: 2,
      name: 'Admin User',
      email: 'admin@legalconnect.com',
      password: 'admin123',
      address: '100 Justice Plaza',
      role: 'admin',
    },
  ],
  lawyers: [
    {
      id: 1,
      name: 'Sarah Chen',
      email: 'sarah.law@legalconnect.com',
      password: 'lawyer123',
      qualification: 'J.D., Family Law',
    },
    {
      id: 2,
      name: 'Michael Brooks',
      email: 'mbrooks@legalconnect.com',
      password: 'lawyer123',
      qualification: 'J.D., Criminal Defense',
    },
  ],
  legalAidRequests: [
    {
      id: 1,
      request_details: 'Eviction dispute',
      email: 'john@gmail.com',
      assigned_to: null,
      status: 'Pending',
      requested_at: '2026-05-10T09:30:00.000Z',
    },
    {
      id: 2,
      request_details: 'Custody modification',
      email: 'john@gmail.com',
      assigned_to: 1,
      status: 'Assigned',
      requested_at: '2026-04-22T14:15:00.000Z',
    },
  ],
  cases: [
    {
      id: 1,
      details: 'Custody petition filed',
      status: 'Hearing Scheduled',
      legal_aid_id: 2,
      created_at: '2026-04-25T10:00:00.000Z',
    },
  ],
  counters: {
    user: 3,
    request: 3,
    case: 2,
    lawyer: 3,
  },
};
