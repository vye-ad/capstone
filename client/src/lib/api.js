import { apiFetch } from './http.js';

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
