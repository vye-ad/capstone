import { feature } from 'topojson-client';

let cachedFeatures = null;
let inFlight = null;

// §14: the underlying Natural Earth data has ISO_A3 = "-99" for several
// entries (France, Norway, Northern Cyprus, Somaliland, Kosovo) — verified
// directly against the source before writing this. Matching on ISO_A3 alone
// means those countries silently never highlight, with no error, so cca3 is
// tried first and the feature's ADMIN name is the fallback key.
export async function loadCountryFeatures() {
  if (cachedFeatures) return cachedFeatures;
  if (inFlight) return inFlight;

  inFlight = fetch('/data/countries-topology.json')
    .then((res) => res.json())
    .then((topology) => {
      const collection = feature(topology, topology.objects.countries);
      cachedFeatures = collection.features;
      return cachedFeatures;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function findCountryFeature(features, cca3, nameEn) {
  if (!features) return null;
  const byIso = features.find((f) => f.properties.ISO_A3 === cca3);
  if (byIso) return byIso;
  return features.find((f) => f.properties.ADMIN === nameEn) ?? null;
}
