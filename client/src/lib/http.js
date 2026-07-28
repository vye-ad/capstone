const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(path, options = {}) {
  // FormData needs the browser to set its own multipart boundary header —
  // forcing application/json here would break file uploads.
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    headers: isFormData ? { ...options.headers } : { 'Content-Type': 'application/json', ...options.headers },
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
