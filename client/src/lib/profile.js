import { apiFetch } from './http.js';

export function getProfile() {
  return apiFetch('/api/profile');
}

export function updateProfile(data) {
  return apiFetch('/api/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

export function changePassword(data) {
  return apiFetch('/api/profile/password', { method: 'PATCH', body: JSON.stringify(data) });
}

export function getStats() {
  return apiFetch('/api/profile/stats');
}
