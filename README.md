# expeditor

A personal trip planner. Browse country destinations, then create, track,
edit, and delete your own trips — bilingual-plus (English, French, Spanish)
and multi-currency. Built as a solo, 4-week capstone project.

> **Status:** in progress (Week 1). This README will be filled in as work
> lands — see the sections marked TODO below.

## Screenshots

TODO — added once the core screens are built.

## Live deployment

TODO — not yet deployed.

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

TODO — once endpoints exist, link the generated Postman collection at
`postman/expeditor.postman_collection.json` here. See `DEVELOPMENT.md` §8
for the full endpoint reference in the meantime.

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
| Exchange rate provider | Currency conversion | TBD |
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
