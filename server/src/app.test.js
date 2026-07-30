import request from 'supertest';
import app from './app.js';
import { prisma } from './lib/prisma.js';
import { seedTestCountries, clearTestData, disconnectTestDb } from './testHelpers.js';

function extractCookie(res) {
  const setCookie = res.headers['set-cookie'];
  return setCookie.find((c) => c.startsWith('token=')).split(';')[0];
}

async function registerUser(overrides = {}) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      countryCode: 'FR',
      ...overrides,
    });
  return { res, cookie: res.status === 201 ? extractCookie(res) : null };
}

beforeAll(async () => {
  await clearTestData();
  await seedTestCountries();
});

afterEach(async () => {
  await clearTestData();
});

afterAll(async () => {
  await disconnectTestDb();
});

describe('POST /api/auth/register', () => {
  it('creates a user and sets an auth cookie', async () => {
    const { res } = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('user@example.com');
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects a duplicate email with a field-level error', async () => {
    await registerUser();
    const { res } = await registerUser({ email: 'user@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.fields.email).toBeDefined();
  });

  it('rejects an unknown country code', async () => {
    const { res } = await registerUser({ countryCode: 'ZZ' });
    expect(res.status).toBe(400);
    expect(res.body.fields.countryCode).toBeDefined();
  });
});

describe('POST /api/auth/login — §9 identical error message', () => {
  it('returns the same status and error for an unknown email and a wrong password', async () => {
    await registerUser({ email: 'known@example.com', password: 'correctpassword' });

    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'whatever123' });

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email: 'known@example.com', password: 'wrongpassword' });

    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.body.error).toBe(wrongPassword.body.error);
  });

  it('logs in successfully with the correct credentials', async () => {
    await registerUser({ email: 'known@example.com', password: 'correctpassword' });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'known@example.com', password: 'correctpassword' });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

describe('Trip ownership — §8 not-mine returns 404, not 403', () => {
  it("returns 404 for another user's trip instead of 403", async () => {
    const owner = await registerUser({ email: 'owner@example.com' });
    const createRes = await request(app)
      .post('/api/trips')
      .set('Cookie', owner.cookie)
      .send({
        countryCode: 'FR',
        startDate: '2026-08-01',
        endDate: '2026-08-10',
        status: 'UPCOMING',
        budgetAmount: 500,
        budgetCurrency: 'CAD',
      });
    expect(createRes.status).toBe(201);
    const tripId = createRes.body.trip.id;

    const intruder = await registerUser({ email: 'intruder@example.com' });
    const getRes = await request(app).get(`/api/trips/${tripId}`).set('Cookie', intruder.cookie);

    expect(getRes.status).toBe(404);
  });

  it('lets the owner fetch their own trip', async () => {
    const owner = await registerUser();
    const createRes = await request(app)
      .post('/api/trips')
      .set('Cookie', owner.cookie)
      .send({
        countryCode: 'JP',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        status: 'UPCOMING',
        budgetAmount: 1000,
        budgetCurrency: 'CAD',
      });
    const tripId = createRes.body.trip.id;

    const getRes = await request(app).get(`/api/trips/${tripId}`).set('Cookie', owner.cookie);
    expect(getRes.status).toBe(200);
    expect(getRes.body.trip.id).toBe(tripId);
  });
});

describe('Admin self-modification guard — §10.10', () => {
  async function promoteToAdmin(email) {
    await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
  }

  it('blocks an admin from changing their own role', async () => {
    const admin = await registerUser({ email: 'admin@example.com' });
    await promoteToAdmin('admin@example.com');
    const me = await request(app).get('/api/auth/me').set('Cookie', admin.cookie);

    const res = await request(app)
      .patch(`/api/admin/users/${me.body.user.id}/role`)
      .set('Cookie', admin.cookie)
      .send({ role: 'USER' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('cannot_modify_self');
  });

  it('blocks an admin from deleting their own account', async () => {
    const admin = await registerUser({ email: 'admin2@example.com' });
    await promoteToAdmin('admin2@example.com');
    const me = await request(app).get('/api/auth/me').set('Cookie', admin.cookie);

    const res = await request(app).delete(`/api/admin/users/${me.body.user.id}`).set('Cookie', admin.cookie);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('cannot_modify_self');
  });

  it('lets an admin change another user\'s role', async () => {
    const admin = await registerUser({ email: 'admin3@example.com' });
    await promoteToAdmin('admin3@example.com');
    const other = await registerUser({ email: 'plain@example.com' });
    const otherMe = await request(app).get('/api/auth/me').set('Cookie', other.cookie);

    const res = await request(app)
      .patch(`/api/admin/users/${otherMe.body.user.id}/role`)
      .set('Cookie', admin.cookie)
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
  });
});
