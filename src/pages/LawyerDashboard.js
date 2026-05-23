import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function LawyerDashboard() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getCasesForLawyer(user.id);
        if (active) setCases(data);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [user.id]);

  return (
    <Layout title="Assigned cases">
      <p className="muted toolbar">
        Cases filed from legal aid requests assigned to you. Open a case to
        update court status and outcomes.
      </p>

      {loading ? (
        <p className="loading-text">Loading cases…</p>
      ) : cases.length === 0 ? (
        <div className="empty-state">
          <h2>No assigned cases</h2>
          <p>When an administrator assigns you to a request, the case will appear here.</p>
        </div>
      ) : (
        <div className="card-grid">
          {cases.map((caseRecord) => (
            <article key={caseRecord.id} className="card">
              <div className="card-header">
                <span className="card-id">Case #{caseRecord.id}</span>
                <StatusBadge status={caseRecord.status} type="case" />
              </div>
              <p className="card-body">{caseRecord.details}</p>
              <dl className="meta-list">
                <div>
                  <dt>Request</dt>
                  <dd>#{caseRecord.legal_aid_id}</dd>
                </div>
                <div>
                  <dt>Filed</dt>
                  <dd>{formatDate(caseRecord.created_at)}</dd>
                </div>
              </dl>
              {caseRecord.request && (
                <p className="request-preview">{caseRecord.request.request_details}</p>
              )}
              <Link
                to={`/lawyer/cases/${caseRecord.id}`}
                className="btn btn-primary btn-small"
              >
                Manage case
              </Link>
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
