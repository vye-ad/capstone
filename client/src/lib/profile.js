import { apiFetch } from './http.js';

export function getProfile() {
  return apiFetch('/api/profile');
}

export function getStats() {
  return apiFetch('/api/profile/stats');
}
