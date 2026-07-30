// One-time data-prep script (§14): converts the raw Natural Earth admin-0
// countries GeoJSON into a compact TopoJSON file for the 3D globe's border
// highlight. Not part of the app's runtime — its OUTPUT (client/public/data/
// countries-topology.json) is what actually ships and is fetched at runtime.
//
// Source: Natural Earth (public domain), 1:110m admin-0 countries, via the
// project's official GitHub mirror. Deliberately keeps ISO_A2/ISO_A3/ADMIN —
// §14 documents that ISO_A3 is "-99" for several entries (France, Norway,
// Northern Cyprus, Somaliland, Kosovo), so ADMIN is needed as a fallback key.
// Verified live against this exact source before writing the fallback.
//
// The raw GeoJSON isn't committed (838KB, and it's only an intermediate
// build input, not something the app runs against). Re-fetch it with:
//   curl -sL https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson \
//     -o scripts/ne_110m_admin_0_countries.geojson
import { readFileSync, writeFileSync } from 'fs';
import { topology } from 'topojson-server';
import { presimplify, simplify } from 'topojson-simplify';

const RAW_PATH = process.argv[2] ?? './scripts/ne_110m_admin_0_countries.geojson';
const OUT_PATH = process.argv[3] ?? './public/data/countries-topology.json';

const raw = JSON.parse(readFileSync(RAW_PATH, 'utf-8'));

// Strip to only the properties the app actually matches on, before building
// the topology — Natural Earth's admin-0 table has ~170 columns per feature.
const trimmed = {
  ...raw,
  features: raw.features.map((f) => ({
    ...f,
    properties: {
      ISO_A2: f.properties.ISO_A2,
      ISO_A3: f.properties.ISO_A3,
      ADMIN: f.properties.ADMIN,
    },
  })),
};

let topo = topology({ countries: trimmed }, 1e5);
topo = presimplify(topo);
topo = simplify(topo, 0.1);

writeFileSync(OUT_PATH, JSON.stringify(topo));
console.log(`Wrote ${OUT_PATH}`);
