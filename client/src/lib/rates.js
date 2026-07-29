import { apiFetch } from './http.js';

export function getRates() {
  return apiFetch('/api/rates');
}
