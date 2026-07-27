const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path, options = {}) {
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

export function toQueryString(params) {
  const entries = Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}
