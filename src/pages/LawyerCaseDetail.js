import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const CASE_STATUSES = ['Filed', 'Hearing Scheduled', 'Resolved', 'Closed'];

export default function LawyerCaseDetail() {
  const { caseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [caseRecord, setCaseRecord] = useState(null);
  const [status, setStatus] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cases = await api.getCasesForLawyer(user.id);
        const found = cases.find((c) => String(c.id) === caseId);
        if (!active) return;
        if (!found) {
          setCaseRecord(null);
        } else {
          setCaseRecord(found);
          setStatus(found.status);
          setDetails(found.details);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user.id, caseId]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await api.updateCaseStatus(Number(caseId), status, details);
      setMessage('Case updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Case details">
        <p className="loading-text">Loading case…</p>
      </Layout>
    );
  }

  if (!caseRecord) {
    return (
      <Layout title="Case not found">
        <div className="empty-state">
          <p>This case is not assigned to you or does not exist.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/lawyer')}
          >
            Back to cases
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Case #${caseRecord.id}`}>
      <div className="detail-header">
        <StatusBadge status={caseRecord.status} type="case" />
        <span className="muted">Linked to request #{caseRecord.legal_aid_id}</span>
      </div>

      {caseRecord.request && (
        <section className="detail-section">
          <h2>Client request</h2>
          <p>{caseRecord.request.request_details}</p>
          <p className="muted">{caseRecord.request.email}</p>
        </section>
      )}

      <section className="detail-section">
        <h2>Update court status</h2>
        <form onSubmit={handleSave} className="stack-form form-panel">
          <label className="field">
            <span>Case status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {CASE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Case notes & outcomes</span>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={8}
            />
          </label>

          {error && <p className="form-error">{error}</p>}
          {message && <p className="form-success">{message}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/lawyer')}
            >
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save updates'}
            </button>
          </div>
        </form>
      </section>
    </Layout>
  );
}
