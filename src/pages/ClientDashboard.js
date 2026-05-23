import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [casesByRequest, setCasesByRequest] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getRequestsByEmail(user.email);
        if (!active) return;
        setRequests(data);
        const caseMap = {};
        await Promise.all(
          data.map(async (req) => {
            const caseRecord = await api.getCaseForRequest(req.id);
            if (caseRecord) caseMap[req.id] = caseRecord;
          })
        );
        if (active) setCasesByRequest(caseMap);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user.email]);

  return (
    <Layout title="My legal aid requests">
      <div className="toolbar">
        <p className="muted">
          Track the status of every request you have submitted.
        </p>
        <Link to="/request/new" className="btn btn-primary">
          Request legal aid
        </Link>
      </div>

      {loading ? (
        <p className="loading-text">Loading your requests…</p>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <h2>No requests yet</h2>
          <p>Submit your first legal aid request to get started.</p>
          <Link to="/request/new" className="btn btn-primary">
            Request legal aid
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {requests.map((req) => (
            <article key={req.id} className="card">
              <div className="card-header">
                <span className="card-id">Request #{req.id}</span>
                <StatusBadge status={req.status} />
              </div>
              <p className="card-body">{req.request_details}</p>
              <dl className="meta-list">
                <div>
                  <dt>Submitted</dt>
                  <dd>{formatDate(req.requested_at)}</dd>
                </div>
                {req.assigned_to && (
                  <div>
                    <dt>Assigned lawyer</dt>
                    <dd>ID {req.assigned_to}</dd>
                  </div>
                )}
              </dl>
              {casesByRequest[req.id] && (
                <div className="case-snippet">
                  <h3>Court case</h3>
                  <StatusBadge
                    status={casesByRequest[req.id].status}
                    type="case"
                  />
                  <p>{casesByRequest[req.id].details}</p>
                </div>
              )}
            </article>
          ))}
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
