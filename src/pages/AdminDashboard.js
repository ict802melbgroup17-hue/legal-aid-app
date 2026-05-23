import { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import * as api from '../services/api';
import { resetDemoData } from '../services/api';

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [lawyerId, setLawyerId] = useState('');
  const [caseDetails, setCaseDetails] = useState('');
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqs, lawyerList] = await Promise.all([
        api.getAllRequests(),
        api.getLawyers(),
      ]);
      setRequests(reqs);
      setLawyers(lawyerList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openAssign = async (request) => {
    setSelected(request);
    setLawyerId(request.assigned_to ? String(request.assigned_to) : '');
    setActionError(null);
    const existing = await api.getCaseForRequest(request.id);
    setCaseDetails(existing ? existing.details : '');
    if (request.status === 'Pending') {
      await api.markRequestReviewed(request.id);
      loadData();
    }
  };

  const closeModal = () => {
    setSelected(null);
    setActionError(null);
  };

  const handleReject = async (requestId) => {
    if (!window.confirm('Reject this legal aid request?')) return;
    setSaving(true);
    try {
      await api.rejectRequest(requestId);
      await loadData();
      closeModal();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileCase = async (e) => {
    e.preventDefault();
    if (!lawyerId) {
      setActionError('Select a lawyer to assign.');
      return;
    }
    if (!caseDetails.trim()) {
      setActionError('Enter court filing details.');
      return;
    }
    setSaving(true);
    setActionError(null);
    try {
      await api.fileCaseAndAssign({
        requestId: selected.id,
        lawyerId: Number(lawyerId),
        details: caseDetails.trim(),
      });
      await loadData();
      closeModal();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Reset all data to the original demo dataset?')) return;
    resetDemoData();
    loadData();
    closeModal();
  };

  return (
    <Layout title="Incoming legal aid requests">
      <div className="toolbar">
        <p className="muted">
          Review requests, file cases in court, and assign qualified lawyers.
        </p>
        <button type="button" className="btn btn-ghost" onClick={handleReset}>
          Reset demo data
        </button>
      </div>

      {loading ? (
        <p className="loading-text">Loading requests…</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client email</th>
                <th>Summary</th>
                <th>Status</th>
                <th>Submitted</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td>#{req.id}</td>
                  <td>{req.email}</td>
                  <td className="truncate">{req.request_details}</td>
                  <td>
                    <StatusBadge status={req.status} />
                  </td>
                  <td>{formatDate(req.requested_at)}</td>
                  <td>
                    {req.status !== 'Rejected' && (
                      <button
                        type="button"
                        className="btn btn-small btn-primary"
                        onClick={() => openAssign(req)}
                      >
                        {req.status === 'Assigned' ? 'View' : 'Review'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="review-title"
          >
            <h2 id="review-title">Request #{selected.id}</h2>
            <p className="modal-meta">{selected.email}</p>
            <StatusBadge status={selected.status} />
            <p className="modal-body">{selected.request_details}</p>

            {selected.status !== 'Rejected' && (
              <form onSubmit={handleFileCase} className="stack-form">
                <label className="field">
                  <span>Assign lawyer</span>
                  <select
                    value={lawyerId}
                    onChange={(e) => setLawyerId(e.target.value)}
                    required
                    disabled={selected.status === 'Assigned'}
                  >
                    <option value="">Select a lawyer</option>
                    {lawyers.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.qualification}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Court filing details</span>
                  <textarea
                    value={caseDetails}
                    onChange={(e) => setCaseDetails(e.target.value)}
                    rows={5}
                    placeholder="Case number, court name, filing notes…"
                    disabled={selected.status === 'Assigned'}
                  />
                </label>

                {actionError && <p className="form-error">{actionError}</p>}

                <div className="form-actions">
                  {selected.status !== 'Assigned' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleReject(selected.id)}
                        disabled={saving}
                      >
                        Reject
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                      >
                        {saving ? 'Saving…' : 'File case & assign'}
                      </button>
                    </>
                  )}
                  <button type="button" className="btn btn-ghost" onClick={closeModal}>
                    Close
                  </button>
                </div>
              </form>
            )}

            {selected.status === 'Rejected' && (
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
