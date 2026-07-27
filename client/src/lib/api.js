const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(body?.error ?? 'request_failed');
    error.status = res.status;
    error.publicError = body?.error;
    error.fields = body?.fields;
    throw error;
  }

  return body;
}

export function register(data) {
  return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
}

export function login(data) {
  return apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
}

export function logout() {
  return apiFetch('/api/auth/logout', { method: 'POST' });
}

export function me() {
  return apiFetch('/api/auth/me');
}
