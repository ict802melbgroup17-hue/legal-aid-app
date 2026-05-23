import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function NewRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requestDetails, setRequestDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.createRequest({
        email: user.email,
        request_details: requestDetails.trim(),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Request legal aid">
      <div className="form-panel">
        <p className="muted">
          Describe your legal issue in detail. An administrator will review your
          request and may assign a lawyer if approved.
        </p>

        <form onSubmit={handleSubmit} className="stack-form">
          <label className="field">
            <span>Details of your legal issue</span>
            <textarea
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              required
              rows={8}
              placeholder="Include relevant dates, parties involved, and what outcome you are seeking."
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit request'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
