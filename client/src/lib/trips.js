import { apiFetch, toQueryString } from './http.js';

export function listTrips(params) {
  return apiFetch(`/api/trips${toQueryString(params)}`);
}

export function createTrip(data) {
  return apiFetch('/api/trips', { method: 'POST', body: JSON.stringify(data) });
}

export function getTrip(id) {
  return apiFetch(`/api/trips/${id}`);
}

export function updateTrip(id, data) {
  return apiFetch(`/api/trips/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteTrip(id) {
  return apiFetch(`/api/trips/${id}`, { method: 'DELETE' });
}
