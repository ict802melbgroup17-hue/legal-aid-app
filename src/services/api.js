const STORAGE_KEY = 'legalAidDb';
const DB_URL = `${process.env.PUBLIC_URL || ''}/data/db.json`;

const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

let cache = null;

async function loadDb() {
  if (cache) return cache;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    cache = JSON.parse(stored);
    return cache;
  }
  const response = await fetch(DB_URL);
  if (!response.ok) {
    throw new Error('Unable to load data');
  }
  cache = await response.json();
  persist();
  return cache;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
}

function nextId(db, key) {
  const id = db.counters[key];
  db.counters[key] = id + 1;
  return id;
}

export async function login({ email, password, role }) {
  await wait();
  const db = await loadDb();

  if (role === 'lawyer') {
    const lawyer = db.lawyers.find(
      (l) => l.email === email && l.password === password
    );
    if (!lawyer) {
      throw new Error('Invalid email or password');
    }
    return {
      id: lawyer.id,
      name: lawyer.name,
      email: lawyer.email,
      role: 'lawyer',
    };
  }

  const user = db.users.find(
    (u) => u.email === email && u.password === password && u.role === role
  );
  if (!user) {
    throw new Error('Invalid email or password');
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
  };
}

export async function register({ name, email, password, address }) {
  await wait();
  const db = await loadDb();
  const exists = db.users.some((u) => u.email === email);
  if (exists) {
    throw new Error('An account with this email already exists');
  }
  const user = {
    id: nextId(db, 'user'),
    name,
    email,
    password,
    address,
    role: 'client',
  };
  db.users.push(user);
  persist();
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: 'client',
  };
}

export async function getRequestsByEmail(email) {
  await wait();
  const db = await loadDb();
  return db.legalAidRequests
    .filter((r) => r.email === email)
    .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at));
}

export async function createRequest({ email, request_details }) {
  await wait();
  const db = await loadDb();
  const request = {
    id: nextId(db, 'request'),
    request_details,
    email,
    assigned_to: null,
    status: 'Pending',
    requested_at: new Date().toISOString(),
  };
  db.legalAidRequests.push(request);
  persist();
  return request;
}

export async function getAllRequests() {
  await wait();
  const db = await loadDb();
  return [...db.legalAidRequests].sort(
    (a, b) => new Date(b.requested_at) - new Date(a.requested_at)
  );
}

export async function getLawyers() {
  await wait();
  const db = await loadDb();
  return db.lawyers.map(({ password, ...lawyer }) => lawyer);
}

export async function rejectRequest(requestId) {
  await wait();
  const db = await loadDb();
  const request = db.legalAidRequests.find((r) => r.id === requestId);
  if (!request) throw new Error('Request not found');
  request.status = 'Rejected';
  persist();
  return request;
}

export async function fileCaseAndAssign({ requestId, lawyerId, details }) {
  await wait();
  const db = await loadDb();
  const request = db.legalAidRequests.find((r) => r.id === requestId);
  if (!request) throw new Error('Request not found');

  request.status = 'Assigned';
  request.assigned_to = lawyerId;

  const existingCase = db.cases.find((c) => c.legal_aid_id === requestId);
  if (existingCase) {
    existingCase.details = details;
    existingCase.status = 'Filed';
    persist();
    return { request, caseRecord: existingCase };
  }

  const caseRecord = {
    id: nextId(db, 'case'),
    details,
    status: 'Filed',
    legal_aid_id: requestId,
    created_at: new Date().toISOString(),
  };
  db.cases.push(caseRecord);
  request.status = 'Assigned';
  persist();
  return { request, caseRecord };
}

export async function markRequestReviewed(requestId) {
  await wait();
  const db = await loadDb();
  const request = db.legalAidRequests.find((r) => r.id === requestId);
  if (!request) throw new Error('Request not found');
  if (request.status === 'Pending') {
    request.status = 'Reviewed';
    persist();
  }
  return request;
}

export async function getCasesForLawyer(lawyerId) {
  await wait();
  const db = await loadDb();
  const assignedRequestIds = db.legalAidRequests
    .filter((r) => r.assigned_to === lawyerId)
    .map((r) => r.id);

  return db.cases
    .filter((c) => assignedRequestIds.includes(c.legal_aid_id))
    .map((caseRecord) => {
      const request = db.legalAidRequests.find(
        (r) => r.id === caseRecord.legal_aid_id
      );
      return { ...caseRecord, request };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function updateCaseStatus(caseId, status, details) {
  await wait();
  const db = await loadDb();
  const caseRecord = db.cases.find((c) => c.id === caseId);
  if (!caseRecord) throw new Error('Case not found');
  caseRecord.status = status;
  if (details !== undefined && details.trim()) {
    caseRecord.details = details.trim();
  }
  persist();
  return caseRecord;
}

export async function getCaseForRequest(requestId) {
  await wait();
  const db = await loadDb();
  return db.cases.find((c) => c.legal_aid_id === requestId) || null;
}

export function resetDemoData() {
  cache = null;
  localStorage.removeItem(STORAGE_KEY);
}
