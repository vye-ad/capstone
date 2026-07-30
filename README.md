# expeditor

A personal trip planner. Browse country destinations, then create, track,
edit, and delete your own trips — bilingual-plus (English, French, Spanish)
and multi-currency. Built as a solo, 4-week capstone project.

> **Status:** in progress (Week 3). This README will be filled in as work
> lands — see the sections marked TODO below.

## Screenshots

TODO — added once the core screens are built.

## Live deployment

**https://capstone-lovat-kappa.vercel.app** (frontend, Vercel) — backend on
Render (`https://expeditor-api.onrender.com`), database on Prisma Postgres.
See [Deployment](#deployment) below for the setup used to get it there.

Note: Render's free tier spins the backend down after 15 min idle — the
first request after a quiet spell takes 30-60s to wake up.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| i18n | react-i18next |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT in an httpOnly cookie |
| Password hashing | bcrypt |
| Image storage | Cloudinary |
| Validation | Zod (shared client/server schemas) |
| CI/CD | GitHub Actions |
| API testing | Postman |

See `DEVELOPMENT.md` for the full specification and rationale behind each choice.

## Local setup

### Prerequisites

- Node.js 22+
- PostgreSQL running locally (or reachable via `DATABASE_URL`)

### Install

```bash
cd client && npm install
cd ../server && npm install
```

### Environment variables

Copy the example files and fill in real values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env` needs a running Postgres instance for `DATABASE_URL`, a
`JWT_SECRET`, and API keys for Cloudinary / Pexels / an exchange rate
provider / REST Countries (v5 requires a free account — see
`DEVELOPMENT.md` §12.1). `client/.env` only needs the backend's base URL.

### Migrate and seed

```bash
cd server
npx prisma migrate dev
npx prisma db seed
```

### Run

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

## API overview

Import `postman/expeditor.postman_collection.json` plus the
`local-user`/`local-admin` environment files into Postman to exercise the
API directly. `local-user` already has working demo credentials (seeded by
`prisma db seed`); `local-admin`'s email/password are left blank in the
committed file — fill them in yourself from your own `server/.env`'s
`SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` rather than committing them.
See `DEVELOPMENT.md` §8 for the full endpoint reference.

The collection currently covers Auth, Trips, and Countries — Profile,
Rates, and Admin will be added as those endpoints land.

## Deployment

Three services: **Vercel** (frontend), **Render** (backend, free tier —
free web services spin down after 15 min idle, so the first request after
a quiet spell takes 30-60s to wake up), **Prisma Postgres** (database).

### 1. Database

Already provisioned on Prisma Postgres — grab the **direct** Postgres
connection string (not the Accelerate/`prisma://` one — this project uses
the classic `prisma-client-js` generator, not the Accelerate extension).

### 2. Backend (Render)

This repo includes `render.yaml` (a Blueprint) describing the service:
Node runtime, `server/` as root, builds with
`npm install && npx prisma generate && npx prisma migrate deploy` (so
migrations apply to production on every deploy), starts with `npm start`.

1. On Render: **New → Blueprint**, connect this GitHub repo.
2. Render reads `render.yaml` and prompts for the env vars marked
   `sync: false` — fill in `DATABASE_URL` (from step 1), a fresh
   `JWT_SECRET` (don't reuse the local dev one), `CLOUDINARY_*`,
   `PEXELS_API_KEY`, `REST_COUNTRIES_API_KEY`, `SEED_ADMIN_EMAIL`/
   `SEED_ADMIN_PASSWORD`. Leave `CLIENT_ORIGIN` blank for now — the
   frontend doesn't exist yet.
3. Deploy. Note the resulting URL (e.g. `https://expeditor-api.onrender.com`).

### 3. Frontend (Vercel)

`client/vercel.json` adds the SPA rewrite React Router needs (without it,
refreshing any route other than `/` 404s).

1. On Vercel: **Add New → Project**, import this repo, set **Root
   Directory** to `client`.
2. Add an environment variable: `VITE_API_BASE_URL` = the Render URL from
   step 2.
3. Deploy. Note the resulting URL (e.g. `https://expeditor.vercel.app`).

### 4. Close the loop

Go back to the Render service's environment settings and set
`CLIENT_ORIGIN` to the Vercel URL from step 3, then trigger a redeploy —
CORS won't accept requests from the frontend until this is set.

## Database schema

See `DEVELOPMENT.md` §6 for the Prisma schema (`User`, `Trip`, `Country`,
`City`, `Attraction`, `ExchangeRateSnapshot`) and the reasoning behind each
field.

## Attribution

| Resource | Used for | Link |
|---|---|---|
| REST Countries API (v5) | Country reference data | https://restcountries.com |
| Pexels API | Destination image fallback | https://www.pexels.com/api/ |
| Cloudinary | Image storage and transformation | https://cloudinary.com |
| Exchange rate provider (open.er-api.com) | Currency conversion | https://www.exchangerate-api.com/docs/free |
| Tailwind CSS | Styling | https://tailwindcss.com |
| Prisma | ORM | https://www.prisma.io |
| react-i18next | Internationalisation | https://react.i18next.com |
| `motion` (Framer Motion) | Page transitions | https://motion.dev |

Updated as each dependency is actually introduced.

## Original work statement

All application code (React components, Express routes/controllers,
Prisma schema, seed logic) is original, written for this course. Third-party
libraries and APIs are listed under Attribution above; any code adapted
from documentation, Stack Overflow, or a tutorial will be cited inline and
added to that table.
