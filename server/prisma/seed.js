import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const API_BASE = 'https://api.restcountries.com/countries/v5';
const FLAG_CDN = 'https://flags.restcountries.com/v5';
const PAGE_SIZE = 100;

const FEATURED_CCA2 = ['JP', 'GR', 'FR', 'CA', 'EG', 'US', 'IT', 'PT'];

const FEATURED_CITIES = {
  JP: ['Tokyo', 'Kyoto', 'Osaka', 'Fukuoka'],
  GR: ['Athens', 'Thessaloniki', 'Heraklion'],
  FR: ['Paris', 'Lyon', 'Marseille', 'Nice'],
  CA: ['Vancouver', 'Toronto', 'Montreal'],
  EG: ['Cairo', 'Alexandria', 'Luxor'],
  US: ['New York', 'Los Angeles', 'Chicago'],
  IT: ['Rome', 'Milan', 'Florence', 'Venice'],
  PT: ['Lisbon', 'Porto', 'Faro'],
};

const FEATURED_ATTRACTIONS = {
  JP: ['Tokyo Tower', 'Senso-ji', 'Fushimi Inari Shrine'],
  GR: ['Acropolis', 'Santorini', 'Delphi'],
  FR: ['Eiffel Tower', 'Louvre', 'Mont Saint-Michel'],
  CA: ['Banff National Park', 'Niagara Falls', 'Old Quebec'],
  EG: ['Pyramids of Giza', 'Karnak Temple', 'Valley of the Kings'],
  US: ['Grand Canyon', 'Statue of Liberty', 'Yellowstone'],
  IT: ['Colosseum', 'Duomo di Milano', 'Pompeii'],
  PT: ['Belém Tower', 'Douro Valley', 'Sintra'],
};

async function fetchAllCountries(apiKey) {
  const countries = [];
  let offset = 0;

  while (true) {
    const url = `${API_BASE}?limit=${PAGE_SIZE}&offset=${offset}&api_key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`REST Countries request failed: ${res.status} ${await res.text()}`);
    }
    const body = await res.json();
    countries.push(...body.data.objects);

    if (!body.data.meta.more) break;
    offset += PAGE_SIZE;
  }

  return countries;
}

function mapLanguages(languages) {
  if (!languages || languages.length === 0) return {};
  return Object.fromEntries(languages.map((l) => [l.iso639_2t, l.name]));
}

function mapCountry(raw) {
  const cca2 = raw.codes?.alpha_2;
  const cca2Lower = cca2.toLowerCase();
  const nameEn = raw.names.common;
  const currency = raw.currencies?.[0];
  const callingCode = raw.calling_codes?.[0];

  return {
    cca2,
    cca3: raw.codes?.alpha_3 ?? '',
    nameEn,
    nameFr: raw.names.translations?.fra?.common ?? nameEn,
    nameEs: raw.names.translations?.spa?.common ?? nameEn,
    officialName: raw.names.official ?? nameEn,
    capital: raw.capitals?.[0]?.name ?? null,
    languages: mapLanguages(raw.languages),
    currencyCode: currency?.code ?? null,
    currencyName: currency?.name ?? null,
    currencySymbol: currency?.symbol ?? null,
    region: raw.region ?? null,
    subregion: raw.subregion ?? null,
    latitude: raw.coordinates?.lat ?? null,
    longitude: raw.coordinates?.lng ?? null,
    flagSvgUrl: `${FLAG_CDN}/svg/${cca2Lower}.svg`,
    flagPngUrl: `${FLAG_CDN}/w640/${cca2Lower}.png`,
    flagAlt: raw.flag?.description ?? `${nameEn} flag`,
    timezones: raw.timezones ?? null,
    drivingSide: raw.cars?.driving_side ?? null,
    callingCode: callingCode ? `+${callingCode}` : null,
    borders: raw.borders ?? null,
    population: raw.population ?? null,
    area: raw.area?.kilometers ?? null,
    googleMapsUrl: raw.links?.google_maps ?? null,
    isFeatured: FEATURED_CCA2.includes(cca2),
  };
}

async function seedCountries() {
  const apiKey = process.env.REST_COUNTRIES_API_KEY;
  if (!apiKey) {
    throw new Error('REST_COUNTRIES_API_KEY is not set in server/.env');
  }

  console.log('Fetching countries from REST Countries v5...');
  const raw = await fetchAllCountries(apiKey);
  console.log(`Fetched ${raw.length} entries.`);

  const withCode = raw.filter((c) => c.codes?.alpha_2);
  const skipped = raw.length - withCode.length;
  if (skipped > 0) {
    console.log(`Skipping ${skipped} entries with no alpha_2 code (unrecognized/disputed territories).`);
  }

  let count = 0;
  for (const entry of withCode) {
    const data = mapCountry(entry);
    await prisma.country.upsert({
      where: { cca2: data.cca2 },
      create: data,
      update: data,
    });
    count += 1;
  }
  console.log(`Upserted ${count} countries.`);
}

async function seedFeaturedContent() {
  for (const cca2 of FEATURED_CCA2) {
    const cities = FEATURED_CITIES[cca2] ?? [];
    for (const [index, name] of cities.entries()) {
      const existing = await prisma.city.findFirst({ where: { countryCode: cca2, name } });
      if (!existing) {
        await prisma.city.create({ data: { countryCode: cca2, name, sortOrder: index } });
      }
    }

    const attractions = FEATURED_ATTRACTIONS[cca2] ?? [];
    for (const [index, name] of attractions.entries()) {
      const existing = await prisma.attraction.findFirst({ where: { countryCode: cca2, name } });
      if (!existing) {
        await prisma.attraction.create({ data: { countryCode: cca2, name, sortOrder: index } });
      }
    }
  }
  console.log('Seeded cities and attractions for the featured eight.');
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD are not set in server/.env');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      name: 'Admin',
      email,
      passwordHash,
      countryCode: 'CA',
      role: 'ADMIN',
    },
    update: {
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log(`Seeded admin user (${email}).`);
}

const DEMO_USER = {
  email: 'demo@expeditor.dev',
  password: 'demopassword123',
  name: 'Demo User',
  countryCode: 'FR',
};

function daysFromNow(n) {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

// §12.2 point 4: optional demo regular user with a few trips, for
// screenshots/testing and to give the Postman "local-user" environment
// (§16) real, non-admin credentials.
async function seedDemoUser() {
  const passwordHash = await bcrypt.hash(DEMO_USER.password, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    create: {
      name: DEMO_USER.name,
      email: DEMO_USER.email,
      passwordHash,
      countryCode: DEMO_USER.countryCode,
    },
    update: { passwordHash },
  });

  const existingTrips = await prisma.trip.count({ where: { userId: user.id } });
  if (existingTrips === 0) {
    await prisma.trip.createMany({
      data: [
        {
          userId: user.id,
          countryCode: 'JP',
          startDate: daysFromNow(30),
          endDate: daysFromNow(37),
          status: 'UPCOMING',
          budgetAmount: 4500,
          budgetCurrency: 'EUR',
          transportType: 'PLANE',
          accommodationType: 'HOSTEL',
          notes: 'demo trip for screenshots',
        },
        {
          userId: user.id,
          countryCode: 'IT',
          startDate: daysFromNow(-180),
          endDate: daysFromNow(-173),
          status: 'COMPLETED',
          budgetAmount: 2200,
          budgetCurrency: 'EUR',
          transportType: 'TRAIN',
          accommodationType: 'APARTMENT',
          notes: 'demo trip for screenshots',
        },
      ],
    });
  }

  console.log(`Seeded demo user (${DEMO_USER.email}).`);
}

async function main() {
  await seedCountries();
  await seedFeaturedContent();
  await seedAdmin();
  await seedDemoUser();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
