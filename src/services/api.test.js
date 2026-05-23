import { mockDb } from '../test-utils/mockDb';
import {
  createRequest,
  fileCaseAndAssign,
  getAllRequests,
  getCaseForRequest,
  getCasesForLawyer,
  getLawyers,
  getRequestsByEmail,
  login,
  markRequestReviewed,
  register,
  rejectRequest,
  resetDemoData,
  updateCaseStatus,
} from './api';
import { clearTestSession, seedTestDb } from '../test-utils';

describe('api service', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    seedTestDb();
  });

  afterEach(() => {
    jest.useRealTimers();
    clearTestSession();
  });

  async function runApi(call) {
    const promise = call();
    jest.advanceTimersByTime(500);
    return promise;
  }

  describe('login', () => {
    it('authenticates a client', async () => {
      const user = await runApi(() =>
        login({
          email: 'john@gmail.com',
          password: 'password123',
          role: 'client',
        })
      );
      expect(user).toEqual({
        id: 1,
        name: 'John Martinez',
        email: 'john@gmail.com',
        address: '142 Oak Street',
        role: 'client',
      });
    });

    it('authenticates an admin', async () => {
      const user = await runApi(() =>
        login({
          email: 'admin@legalconnect.com',
          password: 'admin123',
          role: 'admin',
        })
      );
      expect(user.role).toBe('admin');
    });

    it('authenticates a lawyer', async () => {
      const user = await runApi(() =>
        login({
          email: 'sarah.law@legalconnect.com',
          password: 'lawyer123',
          role: 'lawyer',
        })
      );
      expect(user).toEqual({
        id: 1,
        name: 'Sarah Chen',
        email: 'sarah.law@legalconnect.com',
        role: 'lawyer',
      });
    });

    it('rejects invalid credentials', async () => {
      await expect(
        runApi(() =>
          login({
            email: 'john@gmail.com',
            password: 'wrong',
            role: 'client',
          })
        )
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('register', () => {
    it('creates a new client account', async () => {
      const user = await runApi(() =>
        register({
          name: 'Jane Doe',
          email: 'jane@gmail.com',
          password: 'secret12',
          address: '55 Main St',
        })
      );
      expect(user).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@gmail.com',
        role: 'client',
        address: '55 Main St',
      });

      const stored = JSON.parse(localStorage.getItem('legalAidDb'));
      expect(stored.users.some((u) => u.email === 'jane@gmail.com')).toBe(true);
    });

    it('rejects duplicate email', async () => {
      await expect(
        runApi(() =>
          register({
            name: 'Duplicate',
            email: 'john@gmail.com',
            password: 'pass',
            address: 'Addr',
          })
        )
      ).rejects.toThrow('An account with this email already exists');
    });
  });

  describe('legal aid requests', () => {
    it('returns requests for a client email sorted newest first', async () => {
      const requests = await runApi(() => getRequestsByEmail('john@gmail.com'));
      expect(requests).toHaveLength(2);
      expect(requests[0].id).toBe(1);
      expect(requests[1].id).toBe(2);
    });

    it('creates a pending request', async () => {
      const request = await runApi(() =>
        createRequest({
          email: 'john@gmail.com',
          request_details: 'New legal issue',
        })
      );
      expect(request).toMatchObject({
        request_details: 'New legal issue',
        email: 'john@gmail.com',
        status: 'Pending',
        assigned_to: null,
      });
      expect(request.id).toBe(3);
    });

    it('returns all requests for admin', async () => {
      const requests = await runApi(() => getAllRequests());
      expect(requests.length).toBeGreaterThanOrEqual(2);
    });

    it('marks a pending request as reviewed', async () => {
      const updated = await runApi(() => markRequestReviewed(1));
      expect(updated.status).toBe('Reviewed');
    });

    it('rejects a request', async () => {
      const updated = await runApi(() => rejectRequest(1));
      expect(updated.status).toBe('Rejected');
    });
  });

  describe('lawyers and cases', () => {
    it('returns lawyers without passwords', async () => {
      const lawyers = await runApi(() => getLawyers());
      expect(lawyers).toHaveLength(2);
      lawyers.forEach((lawyer) => {
        expect(lawyer.password).toBeUndefined();
      });
    });

    it('files a case and assigns a lawyer', async () => {
      const result = await runApi(() =>
        fileCaseAndAssign({
          requestId: 1,
          lawyerId: 1,
          details: 'Filed in county court',
        })
      );
      expect(result.request.status).toBe('Assigned');
      expect(result.request.assigned_to).toBe(1);
      expect(result.caseRecord).toMatchObject({
        details: 'Filed in county court',
        status: 'Filed',
        legal_aid_id: 1,
      });
    });

    it('returns cases assigned to a lawyer', async () => {
      const cases = await runApi(() => getCasesForLawyer(1));
      expect(cases).toHaveLength(1);
      expect(cases[0].request).toBeDefined();
      expect(cases[0].legal_aid_id).toBe(2);
    });

    it('finds a case linked to a request', async () => {
      const caseRecord = await runApi(() => getCaseForRequest(2));
      expect(caseRecord).not.toBeNull();
      expect(caseRecord.id).toBe(1);
    });

    it('updates case status and details', async () => {
      const updated = await runApi(() =>
        updateCaseStatus(1, 'Resolved', '  Settlement reached  ')
      );
      expect(updated.status).toBe('Resolved');
      expect(updated.details).toBe('Settlement reached');
    });

    it('throws when case is missing', async () => {
      await expect(runApi(() => updateCaseStatus(99, 'Closed', ''))).rejects.toThrow(
        'Case not found'
      );
    });
  });

  describe('resetDemoData', () => {
    it('clears persisted storage', async () => {
      await runApi(() => createRequest({ email: 'a@b.com', request_details: 'x' }));
      expect(localStorage.getItem('legalAidDb')).not.toBeNull();
      resetDemoData();
      expect(localStorage.getItem('legalAidDb')).toBeNull();
    });
  });
});
