import { prisma } from './lib/prisma.js';

const TEST_COUNTRIES = [
  { cca2: 'FR', cca3: 'FRA', nameEn: 'France', nameFr: 'France', nameEs: 'Francia', officialName: 'French Republic', flagSvgUrl: 'https://flagcdn.com/fr.svg', flagPngUrl: 'https://flagcdn.com/w320/fr.png', currencyCode: 'EUR' },
  { cca2: 'JP', cca3: 'JPN', nameEn: 'Japan', nameFr: 'Japon', nameEs: 'Japón', officialName: 'Japan', flagSvgUrl: 'https://flagcdn.com/jp.svg', flagPngUrl: 'https://flagcdn.com/w320/jp.png', currencyCode: 'JPY' },
];

export async function seedTestCountries() {
  for (const country of TEST_COUNTRIES) {
    await prisma.country.upsert({
      where: { cca2: country.cca2 },
      create: { ...country, languages: {} },
      update: {},
    });
  }
}

export async function clearTestData() {
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();
}

export async function disconnectTestDb() {
  await prisma.$disconnect();
}
