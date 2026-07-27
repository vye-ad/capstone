import { apiFetch, toQueryString } from './http.js';

export function listCountries(params) {
  return apiFetch(`/api/countries${toQueryString(params)}`);
}

export function getCountry(cca2) {
  return apiFetch(`/api/countries/${cca2}`);
}
