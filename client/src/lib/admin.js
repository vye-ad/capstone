import { apiFetch } from './http.js';

export function listUsers() {
  return apiFetch('/api/admin/users');
}

export function updateUserRole(id, role) {
  return apiFetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
}

export function deleteUser(id) {
  return apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
}

export function listCountriesAdmin() {
  return apiFetch('/api/admin/countries');
}

export function updateCountry(cca2, data) {
  return apiFetch(`/api/admin/countries/${cca2}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function uploadCountryImage(cca2, file) {
  const formData = new FormData();
  formData.append('image', file);
  return apiFetch(`/api/admin/countries/${cca2}/image`, { method: 'POST', body: formData });
}

export function createCity(cca2, name) {
  return apiFetch(`/api/admin/countries/${cca2}/cities`, { method: 'POST', body: JSON.stringify({ name }) });
}

export function deleteCity(id) {
  return apiFetch(`/api/admin/cities/${id}`, { method: 'DELETE' });
}

export function createAttraction(cca2, name) {
  return apiFetch(`/api/admin/countries/${cca2}/attractions`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteAttraction(id) {
  return apiFetch(`/api/admin/attractions/${id}`, { method: 'DELETE' });
}
