# expeditor — Development Specification

**Repository:** https://github.com/vye-ad/capstone
**Developer:** solo
**Timeline:** 4 weeks
**Document status:** authoritative. Where this document and the wireframe mockups disagree, **this document wins.** Deviations from the mockups are marked `[DEVIATION]` and are deliberate.

---

## 1. How to use this document

This is the build specification for a travel-planning web application. It is written to be executed by Claude Code.

**Rules for the implementer:**

1. Build in the order given in §15 (Build Order). Do not jump ahead to optional features.
2. Sections marked `[OPTIONAL]` are week-4 polish. They must be built so that removing them breaks nothing.
3. Every `[DEVIATION]` note exists because the mockup is wrong or incomplete. Follow this document, not the image.
4. Do not invent features not described here. If something is genuinely ambiguous, stop and ask rather than guessing.
5. Commit in small increments as each feature lands. See §17 for why this is a hard requirement, not a preference.

---

## 2. Project overview

**expeditor** is a personal trip planner. An authenticated user can browse country destinations, then create, track, edit and delete their own trips. Each trip has a destination, date range, budget, transport and accommodation type, free-text notes, and a status that reflects where the trip sits relative to today.

The app is bilingual-plus (English, French, Spanish) and multi-currency, with both switchable from a persistent header control.

There are two roles. Regular users manage their own trips. Admins additionally manage the destination catalogue and the user list through a separate dashboard.

### Core user journey

```
Landing → Sign Up / Sign In → Home (hub)
                                ├── Explore → country detail → "plan a trip" → Create Trip
                                ├── My Trips → expand row → edit / delete
                                ├── Profile → edit profile / change password
                                └── (+) → Create Trip
```

### Scope boundaries

- No payments, no bookings, no third-party travel data beyond country reference info.
- No social features. Trips are private to their owner.
- No email sending. Password reset by email is **out of scope**; users change their password while logged in.
- Notifications are **cut** from the design entirely.

---

## 3. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Required framework; Vite for fast dev builds |
| Styling | Tailwind CSS | Rubric expects a UI library; Tailwind suits a custom minimal design better than Bootstrap's opinionated components |
| Routing | React Router v6 | Nested routes + `AnimatePresence` compatibility |
| i18n | react-i18next | Locale JSON files, interpolation, plurals |
| Backend | Node.js + Express | Hand-built REST API — the rubric grades API development |
| Database | PostgreSQL | Data is genuinely relational; SQL aggregates needed for profile stats |
| ORM | Prisma | Declarative schema + migrations; schema in §5 is directly usable |
| Auth | JWT in httpOnly cookie | Token unreadable by JavaScript, so XSS cannot steal the session |
| Password hashing | bcrypt, cost factor 12 | Standard; never store or log plaintext |
| Image storage | Cloudinary | Local filesystem does not survive cloud redeploys |
| Validation | Zod (shared schemas) | Same validation rules on client and server |
| CI/CD | GitHub Actions | Rubric must-have |
| API testing | Postman | Collection generated from §7 and committed |

**Do not substitute any of these without updating this document first.**

### Why not Supabase / Firebase

Considered and rejected. A BaaS would be faster but hides the backend work the rubric explicitly grades ("Create a backend API that serves the frontend with data"). Building Express routes by hand is the point.

---

## 4. Repository and environment setup

### Structure

```
capstone/
├── client/                 # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── locales/        # en.json, fr.json, es.json
│   │   ├── lib/
│   │   └── App.jsx
│   └── vite.config.js
├── server/                 # Express
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── services/       # external API clients, status resolver
│   │   ├── lib/
│   │   └── index.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── package.json
├── postman/
│   └── expeditor.postman_collection.json
├── .github/workflows/
│   └── ci.yml
└── README.md
```

### Environment variables

`server/.env` — **never commit this file.** Commit `.env.example` with the keys and empty values.

```
DATABASE_URL=postgresql://...
JWT_SECRET=
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
PEXELS_API_KEY=
EXCHANGE_RATE_API_KEY=
REST_COUNTRIES_API_KEY=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
```

`REST_COUNTRIES_API_KEY`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` were missing from this list originally — added here since §12.1 (v5 auth) and §12.2 (seed admin) both require them and this is the single source of truth for env vars.

`client/.env`:

```
VITE_API_BASE_URL=http://localhost:3000
```

**Every third-party API call happens server-side.** No API key may ever appear in the client bundle.

---

## 5. Design system

The mockups define a deliberate visual identity. Encode it as Tailwind theme tokens and use those tokens everywhere — no arbitrary hex values in components.

### Non-negotiable characteristics

- **All interface text is lowercase.** Not CSS `text-transform` — write the strings lowercase in the locale files, so translations stay consistent. Exception: user-generated content renders exactly as the user typed it.
- **Pure white background, near-black text.** No cream, no off-white, no warm neutrals.
- **No colour except status dots and error states.** The palette is monochrome by design.
- **Fully rounded pill borders** (`border-radius: 9999px`) on inputs, trip rows, and dropdowns. Hairline 1px borders.
- **Generous whitespace.** The design's character comes from air, not decoration.

### Tokens

```js
// tailwind.config.js — theme.extend
colors: {
  ink:        '#111111',  // primary text, borders
  muted:      '#8A8A8A',  // secondary text, placeholders, values
  hairline:   '#CFCFCF',  // input borders, dividers
  paper:      '#FFFFFF',  // background
  status: {
    upcoming:  '#4CAF50', // green
    ongoing:   '#2F6FED', // blue
    completed: '#D9D9D9', // grey
  },
  danger:     '#D64545',  // validation errors, delete confirmation only
}
borderRadius: { pill: '9999px' }
```

### Typography

The mockups use a geometric/humanist sans throughout. If the exact face used in the design tool is known, use it; otherwise **Hanken Grotesk** or **Work Sans** via `@fontsource` are close matches. One family, varied by weight and size — no display/body pairing.

| Role | Size | Weight |
|---|---|---|
| Page wordmark (`expeditor \| explore`) | 32px | 400 |
| Section heading | 22px | 500 |
| Body / labels | 17px | 400 |
| Values / secondary | 17px | 400, `muted` |
| Header utility (`en \| cad`, `sign out`) | 15px | 400 |

### Explicitly forbidden

Claude Code must **not** introduce: gradients, drop shadows, card elevation, coloured accent backgrounds, cream/terracotta palettes, icon libraries beyond a minimal chevron and avatar placeholder, or rounded-rectangle cards with `border-radius: 8px`. The design is pills and hairlines. Anything else breaks it.

### Branding rule

Two forms of the name, used in strictly separate contexts:

| Form | Where | Placement |
|---|---|---|
| `xpdtr` | Landing, Sign In, Sign Up, Home | Top-left, alone |
| `expeditor \| [page name]` | Explore, My Trips, Create Trip, Profile, Admin | Top-centre |

`xpdtr` is the short logo mark. `expeditor` is the full wordmark used in section headers. This is intentional — do not "fix" the inconsistency.

---

## 6. Data model

### Prisma schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum TripStatus {
  UPCOMING
  ONGOING
  COMPLETED
}

enum TransportType {
  PLANE
  TRAIN
  CAR
  BUS
  FERRY
  OTHER
}

enum AccommodationType {
  HOTEL
  HOSTEL
  APARTMENT
  GUESTHOUSE
  CAMPING
  FRIENDS
  OTHER
}

model User {
  id             String   @id @default(uuid())
  name           String
  email          String   @unique
  passwordHash   String
  countryCode    String                          // ISO 3166-1 alpha-2, from sign-up
  role           Role     @default(USER)
  avatarUrl      String?
  avatarPublicId String?                         // Cloudinary public_id, needed to delete
  locale         String   @default("en")         // en | fr | es
  currency       String   @default("CAD")        // display currency
  createdAt      DateTime @default(now())        // "member since"
  updatedAt      DateTime @updatedAt

  trips          Trip[]
  country        Country  @relation(fields: [countryCode], references: [cca2])

  @@index([email])
}

model Trip {
  id                String            @id @default(uuid())
  userId            String
  countryCode       String                              // ISO 3166-1 alpha-2
  startDate         DateTime          @db.Date
  endDate           DateTime          @db.Date
  status            TripStatus
  statusIsManual    Boolean           @default(false)   // true = stop auto-recalculation
  budgetAmount      Decimal           @db.Decimal(12, 2)
  budgetCurrency    String                              // currency as entered, e.g. "CAD"
  transportType     TransportType?
  accommodationType AccommodationType?
  notes             String?           @db.Text
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  country           Country           @relation(fields: [countryCode], references: [cca2])

  @@index([userId])
  @@index([userId, status])
}

model Country {
  cca2           String   @id                     // "JP" — primary key everywhere
  cca3           String   @unique                 // "JPN"
  nameEn         String
  nameFr         String
  nameEs         String
  officialName   String
  capital        String?
  languages      Json                             // { "jpn": "Japanese" }
  currencyCode   String?                          // "JPY"
  currencyName   String?
  currencySymbol String?
  region         String?
  subregion      String?
  latitude       Float?                           // for globe camera targeting
  longitude      Float?
  flagSvgUrl     String
  flagPngUrl     String
  flagAlt        String?
  timezones      Json?
  drivingSide    String?                          // "left" | "right"
  callingCode    String?
  borders        Json?                            // ["KOR","CHN"] — neighbour cca3 codes
  population     Int?
  area           Float?
  googleMapsUrl  String?
  isFeatured     Boolean  @default(false)         // the 8 shown on Explore
  imageUrl       String?                          // Cloudinary, admin-uploaded
  imagePublicId  String?
  cachedPhotoUrl String?                          // Pexels fallback, cached
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  cities         City[]
  attractions    Attraction[]
  trips          Trip[]
  users          User[]

  @@index([isFeatured])
}

model City {
  id          String  @id @default(uuid())
  countryCode String
  name        String
  sortOrder   Int     @default(0)

  country     Country @relation(fields: [countryCode], references: [cca2], onDelete: Cascade)

  @@index([countryCode])
}

model Attraction {
  id          String  @id @default(uuid())
  countryCode String
  name        String
  sortOrder   Int     @default(0)

  country     Country @relation(fields: [countryCode], references: [cca2], onDelete: Cascade)

  @@index([countryCode])
}

model ExchangeRateSnapshot {
  id        String   @id @default(uuid())
  base      String                                // "CAD"
  rates     Json                                  // { "USD": 0.73, "JPY": 112.4, ... }
  fetchedAt DateTime @default(now())

  @@index([fetchedAt])
}
```

### Notes on the schema

- **`cca2` is the join key throughout.** Two-letter ISO codes are used for users, trips, cities and attractions. `cca3` is stored because the globe's GeoJSON dataset uses three-letter codes (see §14).
- **Country names are stored per-locale as columns**, not as a JSON blob, so they can be `ORDER BY`'d and searched directly in SQL.
- **Budget is stored as entered.** `budgetAmount` + `budgetCurrency`. Never store a converted value — that would bake a stale exchange rate into the database permanently. Conversion happens at display time.
- **Trip deletion is a hard delete.** There is no `deletedAt` column and no undo. The confirmation modal is the only safeguard.
- **`statusIsManual`** exists so a user's explicit status choice is not silently overwritten on the next page load.

---

## 7. Trip status — single source of truth

This is the most bug-prone area of the app. Implement it **once**, in one module, and import it everywhere.

### Derivation rule

Given `today` (server date, UTC-normalised to midnight):

| Condition | Status | Dot colour |
|---|---|---|
| `today < startDate` | `UPCOMING` | green `#4CAF50` |
| `startDate <= today <= endDate` | `ONGOING` | blue `#2F6FED` |
| `today > endDate` | `COMPLETED` | grey `#D9D9D9` |

Both bounds are **inclusive**. A one-day trip where `startDate == endDate == today` is `ONGOING`.

### Override behaviour

- On **create**, the status radio buttons pre-select the derived value. If the user submits without changing it, `statusIsManual = false`.
- If the user picks a different status, `statusIsManual = true`.
- On **read**, any trip with `statusIsManual = false` has its status recalculated. Trips with `statusIsManual = true` are returned as stored.
- Editing a trip's dates does **not** reset `statusIsManual`.

### Implementation requirement

```
server/src/services/tripStatus.js
  → resolveStatus(trip, today)   // returns TripStatus
  → resolveTrips(trips, today)   // maps over a list
```

**Every** endpoint that returns trips (`GET /api/trips`, `GET /api/trips/:id`, `GET /api/profile/stats`) must pass through this module. Do not write status logic inline in a controller, and do not compute status on the client.

**Why this matters:** the Profile page shows counts per status and My Trips shows the same statuses as rows. If these use different logic they will disagree — Profile reporting 3 upcoming while the table shows 2. That is a visible, easily-found defect.

---

## 8. API reference

Base path: `/api`. All responses JSON. All authenticated routes read the JWT from the `token` httpOnly cookie.

**This table is the single source of truth for the API.** The Postman collection in §16 is generated from it. When a route changes, update this table first.

### Conventions

- **Auth column:** `—` public · `user` any authenticated user · `admin` role `ADMIN` only · `owner` authenticated **and** owns the resource
- Validation failures → `400` with `{ error: "validation", fields: { fieldName: "message" } }`
- Not authenticated → `401 { error: "unauthenticated" }`
- Authenticated but not permitted → `403 { error: "forbidden" }`
- Not found, or owned by another user → `404 { error: "not_found" }`

> **Security note:** a trip belonging to another user returns **404, not 403.** Returning 403 confirms the resource exists, which leaks information.

### Auth

| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{ name, email, password, countryCode }` | `201 { user }` + sets cookie |
| POST | `/auth/login` | — | `{ email, password }` | `200 { user }` + sets cookie |
| POST | `/auth/logout` | user | — | `204`, clears cookie |
| GET | `/auth/me` | user | — | `200 { user }` |

`{ user }` never includes `passwordHash`. Strip it in a serializer, not ad-hoc per route.

Login failure returns `401 { error: "invalid_credentials" }` — **the same message for unknown email and wrong password.** Distinguishing them lets an attacker enumerate registered accounts.

### Profile

| Method | Path | Auth | Body | Success |
|---|---|---|---|---|
| GET | `/profile` | user | — | `200 { user }` |
| PATCH | `/profile` | user | `{ name?, email?, countryCode?, locale?, currency? }` | `200 { user }` |
| PATCH | `/profile/password` | user | `{ currentPassword, newPassword }` | `204` |
| POST | `/profile/avatar` | user | `multipart/form-data` field `image` | `200 { avatarUrl }` |
| DELETE | `/profile/avatar` | user | — | `204` |
| GET | `/profile/stats` | user | — | `200 { stats }` |

`PATCH /profile/password` returns `400` if `currentPassword` is wrong. Changing the password **invalidates the current token** — clear the cookie and require re-login.

`stats` shape:

```json
{
  "totalTrips": 8,
  "completedTrips": 5,
  "ongoingTrips": 1,
  "upcomingTrips": 2,
  "countriesVisited": 6,
  "regionsVisited": 3,
  "transportTypesUsed": 2,
  "longestTripDays": 12
}
```

- `countriesVisited` = `COUNT(DISTINCT countryCode)` across trips resolving to `COMPLETED` **or** `ONGOING`.
- `completed + ongoing + upcoming` always equals `totalTrips`, since deletion is permanent and the three statuses are exhaustive.
- Compute with a **single SQL aggregate query** (`COUNT` + `FILTER`/`CASE`), not by loading all trips into Node and counting in JavaScript.
- Manual status overrides must be honoured — route through the resolver in §7.
- `regionsVisited`, `transportTypesUsed`, `longestTripDays` power the §10.9 achievements column only — they are **not** one of Profile's five visible "travel statistics" rows. Same aggregate query, same `COMPLETED`/`ONGOING` scoping as `countriesVisited`.

### Trips

| Method | Path | Auth | Body / Query | Success |
|---|---|---|---|---|
| GET | `/trips` | user | `?status=upcoming\|ongoing\|completed` (optional) | `200 { trips: [] }` |
| POST | `/trips` | user | trip payload | `201 { trip }` |
| GET | `/trips/:id` | owner | — | `200 { trip }` |
| PATCH | `/trips/:id` | owner | partial trip payload | `200 { trip }` |
| DELETE | `/trips/:id` | owner | — | `204` |

Trip payload:

```json
{
  "countryCode": "JP",
  "startDate": "2026-05-10",
  "endDate": "2026-05-17",
  "status": "UPCOMING",
  "budgetAmount": 5000.00,
  "budgetCurrency": "CAD",
  "transportType": "PLANE",
  "accommodationType": "HOSTEL",
  "notes": "..."
}
```

Validation:

| Field | Rule |
|---|---|
| `countryCode` | required, must exist in `Country` |
| `startDate` | required, ISO date |
| `endDate` | required, ISO date, **`>= startDate`** |
| `budgetAmount` | required, `>= 0`, max 2 decimal places |
| `budgetCurrency` | required, one of the 10 supported codes |
| `transportType` | optional, must be a valid enum value |
| `accommodationType` | optional, must be a valid enum value |
| `notes` | optional, max 2000 characters |

`GET /trips` returns trips sorted by `startDate` descending. Response includes the joined country's `nameEn`/`nameFr`/`nameEs` and `flagSvgUrl` so the client does not need a second request to render the table.

### Countries

`[DEVIATION]` **Both endpoints below are public (`—`), not `user`.** Originally speced as authenticated; corrected after building Sign Up (§10.3), which needs the searchable country select *before* the user is authenticated — a `user`-gated endpoint made that select silently fail with 401. Country reference data (names/flags/currencies) isn't sensitive, so there's no security reason to gate it.

| Method | Path | Auth | Query | Success |
|---|---|---|---|---|
| GET | `/countries` | — | `?featured=true` or `?q=<search>` or `?region=<region>` | `200 { countries: [] }` |
| GET | `/countries/:cca2` | — | — | `200 { country }` |

- `?featured=true` returns the 8 featured destinations for the Explore landing view.
- `?q=` searches `nameEn`, `nameFr`, `nameEs` case-insensitively. This satisfies the mandatory search requirement.
- `?region=` filters by region — a second, cheap demonstration of filtering.
- `GET /countries/:cca2` returns the full record **with** `cities` and `attractions` arrays (empty for non-featured countries) and a resolved `imageUrl` (see §12).

### Exchange rates

| Method | Path | Auth | Success |
|---|---|---|---|
| GET | `/rates` | user | `200 { base: "CAD", rates: {...}, fetchedAt }` |

Served from the cached snapshot. See §11.

### Admin

All require role `ADMIN`.

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/admin/users` | — | `200 { users: [] }` |
| PATCH | `/admin/users/:id/role` | `{ role: "USER" \| "ADMIN" }` | `200 { user }` |
| DELETE | `/admin/users/:id` | — | `204` |
| GET | `/admin/countries` | — | `200 { countries: [] }` |
| PATCH | `/admin/countries/:cca2` | `{ isFeatured?, capital? }` | `200 { country }` |
| POST | `/admin/countries/:cca2/image` | `multipart/form-data` field `image` | `200 { imageUrl }` |
| POST | `/admin/countries/:cca2/cities` | `{ name, sortOrder? }` | `201 { city }` |
| DELETE | `/admin/cities/:id` | — | `204` |
| POST | `/admin/countries/:cca2/attractions` | `{ name, sortOrder? }` | `201 { attraction }` |
| DELETE | `/admin/attractions/:id` | — | `204` |

**An admin cannot delete their own account or demote themselves.** Return `400 { error: "cannot_modify_self" }`. Without this it is possible to lock every admin out of the system.

Deleting a user cascades to their trips (`onDelete: Cascade`).

---

## 9. Authentication and security

### Token handling

JWT signed with `JWT_SECRET`, 7-day expiry, set as an httpOnly cookie:

```js
res.cookie('token', jwt, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
});
```

Payload: `{ sub: user.id, role: user.role }`. Nothing sensitive — the payload is base64, not encrypted.

### CORS — get this right first

In development Vite runs on `:5173` and Express on `:3000`. These are different origins, so the cookie will be silently dropped unless all three of the following are set:

**Server:**
```js
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
}));
```

**Client — every request:**
```js
fetch(url, { credentials: 'include', ... })
```

**Cookie:** `sameSite: 'lax'` in dev; `'none'` + `secure: true` in production if the API and client are on different domains.

> Symptom if misconfigured: login appears to succeed, then every subsequent request returns 401. Postman will *not* reproduce this — Postman does not enforce CORS. A passing Postman test proves the route logic is correct; it does not prove the CORS config is. Verify auth in the browser separately.

### Middleware

```
requireAuth   → verifies cookie, attaches req.user, else 401
requireAdmin  → requireAuth + role === 'ADMIN', else 403
requireOwner  → loads resource, 404 if missing or owned by someone else
```

### Rules

- bcrypt cost factor 12. Never log or return `passwordHash`.
- Password minimum 8 characters, validated on both client and server with the same Zod schema.
- Rate-limit `/auth/login` and `/auth/register` (`express-rate-limit`, ~10 requests / 15 min / IP).
- Use `helmet` for security headers.
- **Never trust `role` from the client.** Read it from the database via the token's `sub`.
- Validate every input server-side even when the client already validated it.

---

## 10. Screen specifications

Every authenticated screen except Home uses the standard header:

```
< back            expeditor | [page]            en | cad    sign out
```

Home uses `xpdtr` top-left instead of a centred wordmark, with `en | cad` and `sign out` on the right.

`en | cad` is **two independent controls** — a locale selector and a currency selector — rendered adjacent with a pipe between them. Each opens a small dropdown. They do not share state.

---

### 10.1 Landing — `/`

Unauthenticated. Centred column: wordmark `expeditor`, static globe image, then `sign in` and `sign up` links stacked below.

No header. No 3D globe here — see §14.

If an authenticated user hits `/`, redirect to `/home`.

---

### 10.2 Sign In — `/signin`

`xpdtr` top-left. Static globe image, then two underlined text inputs (`login`, `password`) and an `enter account` button.

`[DEVIATION]` The mockup labels the first field `login`. It is an **email** field — validate as email, and label it `email` in the locale files.

Errors render below the form in `danger`. Failed login shows one message for both unknown email and wrong password.

On success → `/home`.

---

### 10.3 Sign Up — `/signup`

`xpdtr` top-left. Static globe, then four underlined inputs (`name`, `email`, `password`, `country`) and a `create account` button.

`country` is a **searchable select populated from the `Country` table**, not a free-text input — it stores a `cca2` code. It sets the user's `countryCode` and seeds the default display currency where that country's currency is among the supported ten (otherwise default `CAD`).

Inline validation on blur. On success, user is logged in immediately → `/home`.

---

### 10.4 Home — `/home`

The navigation hub. Globe centred, with four links positioned around it:

```
              profile
                 ↑
   explore  ←  [globe]  →  my trips
                 ↓
                (+)
```

- `profile` → `/profile`
- `explore` → `/explore`
- `my trips` → `/trips`
- `(+)` → `/trips/new`

Bottom-right panel, right-aligned, in `muted`:

```
welcome back {name}
upcoming trips
{flag} {country} in {n} days for {m} days
```

- Shows the **nearest upcoming trip only**.
- `n` = whole days from today to `startDate`. `m` = trip length in days, inclusive of both ends.
- If there are no upcoming trips, replace the whole block with a single line inviting action — e.g. `no upcoming trips yet` plus a link to create one. Do not render an empty panel.

Admins additionally see an `admin` link in the header.

---

### 10.5 Explore — `/explore`

Full-width `search destination` input below the header.

Below that, `featured destinations` — the 8 countries with `isFeatured = true`, in a two-column list of flag + name, each linking to `/explore/:cca2`. Static globe image on the right.

**Featured eight:** japan, greece, france, canada, egypt, usa, italy, portugal.

`[DEVIATION]` **Flags must be `<img>` tags using `flagSvgUrl`, not emoji.** Emoji flags do not render on Windows — they display as two letters instead. This affects Explore, My Trips, and the Home panel. Use `flagAlt` for alt text.

Search behaviour: debounce ~300ms, query `GET /countries?q=`. Results replace the featured list. Empty result shows a plain message, not a blank area.

A `region` filter control may be added beside the search field — cheap, and demonstrates the filtering requirement a second time.

---

### 10.6 Country detail — `/explore/:cca2`

Header shows `expeditor | explore`. Flag + country name below the search bar.

Two-column layout:

**Left:** destination image (portrait aspect). Resolution order per §12.

**Right:**
```
language: {languages joined}
currency: {name} ({symbol}) — 1 {code} = {rate} {user currency}
```
then two sub-columns:
```
main cities:            top attractions:
{cities}                {attractions}
```

Below, centred: `plan a trip >` → `/trips/new?country=:cca2` with the destination pre-selected.

**Non-featured countries** have no cities or attractions. Omit those headings entirely — do not render empty labels.

Country name renders in the active locale using `nameEn` / `nameFr` / `nameEs`.

---

### 10.7 Create / Edit Trip — `/trips/new`, `/trips/:id/edit`

One component serving both. Edit mode pre-populates and submits `PATCH` instead of `POST`.

Two-column form.

**Left column:**
- `choose destination` — searchable select from `Country`. **Not free text.**
- `start day` / `end day` — date pickers, side by side
- `status` — three radio buttons: `upcoming`, `ongoing`, `completed`, pre-selected to the derived value from §7
- `budget` — currency prefix + numeric input

**Right column:**
- `trip details` → `transport type` dropdown
- `accommodation details` → `accommodation type` dropdown
- `notes` → multi-line textarea

Bottom, centred: `cancel` and `submit >`.

`cancel` returns to the previous page without saving. If the form is dirty, confirm before discarding.

`[DEVIATION]` The mockup shows the notes area as dashed rules. Implement as a normal textarea styled to match the design.

Validation errors appear inline beneath each field, immediately — never animated.

On success → `/trips`.

---

### 10.8 My Trips — `/trips`

Column headers: `date`, `destination`, `status`, `budget`, `actions`.

Each trip is a pill-shaped row:

```
{start} - {end}   {flag} {country}   ● {status}   {currency}{amount}   edit  delete  (⌄)
```

- Sorted by `startDate` descending
- Budget displayed in the user's selected currency, converted from `budgetCurrency` at the cached rate
- Status dot uses the colours in §7
- `edit` → `/trips/:id/edit`
- `delete` → confirmation modal
- `⌄` chevron expands the row **in place**

A status filter control sits above the table (`all` / `upcoming` / `ongoing` / `completed`), calling `GET /trips?status=`.

**Empty state:** if the user has no trips, replace the table with a short line and a link to create one.

#### Expanded row

The row grows in height; other rows stay collapsed and shift down. Content:

```
{flag} {country}                              ● {status}       (⌃)

start day    end day        budget
{start}      {end}          {currency} {amount}

trip details                 notes
{transport}                  {notes}

accommodation details
{accommodation}
                                              edit      delete
```

`[DEVIATION]` **In the mockup, the expanded view renders `plane` and `hostel` inside bordered input pills. This is wrong.** The expanded view is read-only. Render these as plain text in `muted`. Bordered inputs appear only in the edit form. Rendering read-only data as inputs implies editability that does not exist.

Expansion is a height transition in place — **not** a page transition. See §13.

#### Delete confirmation

Centred modal, scale + fade in from centre. Copy must name the trip explicitly:

> delete your trip to {country}?
> this cannot be undone.
> `cancel`   `delete`

Deletion is permanent — there is no soft delete and no undo. The modal is the only safeguard, so a generic "are you sure?" is not acceptable.

---

### 10.9 Profile — `/profile`

**Left column:** avatar (or placeholder outline), `upload picture` link beneath, then:

```
travel statistics
total trips: {n}
completed trips: {n}
ongoing trips: {n}
upcoming trips: {n}
countries visited: {n}
```

`[DEVIATION]` The mockup shows four stats and labels the first `trips created`. It is now **five** stats — `ongoing trips` was missing — and the first is renamed `total trips`, because with permanent deletion the figure is a count of existing trips, not a lifetime total.

**Centre column:**
```
name: {name}
email: {email}
country: {country}
member since: {createdAt formatted}
```
then `edit profile` and `change password`.

`[DEVIATION]` **`notifications` is cut.** Do not build it.

`edit profile` toggles the centre fields into editable inputs with save/cancel.

**Right column — achievements** (not in the original mockup, added later at developer request to fill the empty space beside a two-column layout on wide viewports): a grid of pill badges, one per entry in `client/src/lib/achievements.js`, each purely a threshold check against the `stats` response above (no separate persisted "unlocked" state, so it can never drift out of sync with the trips it's derived from). 26 badges across trip count, completed-trip count, countries visited, continents (`Country.region`) visited, longest trip length, and transport-type variety.

Rendered as **text only, no icon art** — `§5`'s design constraints explicitly forbid icon libraries beyond a chevron/avatar, and a typical achievements UI leans on icon art per badge. Earned badges: `ink` text, `ink` border, and the same green dot trip rows use for `upcoming` status (reusing the existing status-dot colour rather than introducing a new one). Locked badges: `muted` text, `hairline` border, `hairline` dot. Names and descriptions are full translation keys under `profile.achievements.*` in all three locales, same as everything else on this page.

Avatar upload: accept `image/jpeg`, `image/png`, `image/webp`, max 5MB, validated **server-side** as well as client-side. Uploaded to Cloudinary; store both `avatarUrl` and `avatarPublicId` so the old image can be destroyed on replacement.

---

### 10.10 Admin dashboard — `/admin`

Visible only to `ADMIN`. Guarded on both client (route guard) and server (`requireAdmin`). A non-admin hitting `/admin` is redirected to `/home`.

Same header format: `expeditor | admin`. Two tabs.

**destinations**
- Table of all countries: flag, name, featured toggle, image thumbnail, city count, attraction count
- Toggle `isFeatured`
- Upload/replace the destination image (Cloudinary)
- Add and remove cities and attractions

**users**
- Table: name, email, country, role, member since, trip count
- Change role between `USER` and `ADMIN`
- Delete a user (cascades to their trips) — with a confirmation modal
- **Self-modification is blocked.** The current admin's own row has role and delete controls disabled.

The first admin is created by the seed script (§12). There is no self-service admin registration.

---

## 11. Internationalisation and currency

### Locales

Three: `en`, `fr`, `es`. `react-i18next`, one JSON file per locale in `client/src/locales/`.

**Every user-facing string must come from the locale files from day one.** Retrofitting i18n is painful and error-prone. Claude Code must never hardcode a visible string in a component.

Selected locale persists on `User.locale` and is applied on login, so it survives across devices. Unauthenticated pages use browser language detection falling back to `en`.

### What translates and what does not

| Translates | Does not translate |
|---|---|
| All labels, headings, buttons, validation messages | Trip notes (user-generated) |
| Country names (`nameEn` / `nameFr` / `nameEs`) | City names |
| Status names, transport and accommodation types | Attraction names |
| Date formats (via `Intl.DateTimeFormat`) | Email addresses, user names |

Country names are the one content exception, because REST Countries supplies translations for free (§12).

`[DEVIATION]` **Validation and error messages are not yet translated**, despite being listed above. Every Zod schema (client and server, 4 files: auth/trip/profile/admin) embeds English message strings directly, and ad-hoc errors (`email already registered`, `incorrect password`, `unknown country`, `cannot_modify_self`, etc.) are hardcoded the same way. Fixing this properly means switching the error contract from messages to translation keys everywhere — both schema files, every ad-hoc `validationError`/`apiError` call, and every component that currently renders `fieldErrors.x` directly instead of `t(fieldErrors.x)`. Deliberately deferred (developer decision, 2026-07-28) rather than attempted as a rushed addition late in an already large task — everything else in this section (all labels, headings, buttons, country names, date formats) is fully translated across all three locales.

**Interface text is lowercase in all three locales.** Write the strings lowercase in the JSON — do not apply `text-transform`, since that produces incorrect results for some accented characters and makes the translation files misleading.

### Currency

Ten supported codes:

```
CAD, USD, EUR, GBP, JPY, AUD, CHF, MXN, INR, BRL
```

Selected currency persists on `User.currency`.

**Storage rule:** a trip's budget is stored as the amount and the currency the user entered (`budgetAmount`, `budgetCurrency`). Never store a converted figure — the rate would be frozen at write time and drift permanently out of date.

**Display rule:** convert at render time using the cached snapshot. Format with `Intl.NumberFormat` using the active locale, so a French user sees `5 000,00 $ CA` rather than `CAD5000`.

### Rate caching

```
GET /api/rates
  → find the most recent ExchangeRateSnapshot
  → if fetchedAt is < 12 hours old, return it
  → otherwise fetch from the provider, write a new snapshot, return it
```

Provider: any free rate API (exchangerate-api.com, open.er-api.com). Key in `EXCHANGE_RATE_API_KEY`, call made **server-side only**.

**If the provider is unreachable, serve the last good snapshot rather than failing.** Show a stale-rate indicator if `fetchedAt` is more than 48 hours old. The app must never break because a third party is down during marking.

---

## 12. External APIs and seeding

Three third-party integrations, all proxied through Express. **No API key may reach the browser.**

### 12.1 REST Countries — seed-time only

`[DEVIATION]` **This section originally targeted REST Countries v3.1.** As of this build, v3.1 is fully deprecated — every request returns `{ success: false, errors: [{ message: "This API version has been deprecated... migrate to v5" }] }`. Updated below for v5. Confirmed by developer decision on 2026-07-27 to migrate rather than substitute a different data source.

`https://api.restcountries.com/countries/v5`

**Requires authentication**, unlike v3.1. `Authorization: Bearer <key>` header or `?api_key=<key>` query param. The free tier needs a real account (name/email/password, no card) — the public demo key (`rc_live_demo`) does **not** return live data; it always returns one fixed example object regardless of the query, with a message to sign up for a real key. Store the real key as `REST_COUNTRIES_API_KEY` in `server/.env` — **never commit it, never let it reach the browser.**

**Do not call this at request time.** Fetch the full dataset once in `server/prisma/seed.js` and write it into the `Country` table.

Reasons: search becomes a fast, filterable SQL query; the app has no third-party dependency on the critical path; and ISO codes live in your own schema where you control them.

Free tier caps list responses at 100/page — paginate with `?limit=100&offset=`.

Field mapping — **verified 2026-07-27 against live `/countries/v5` responses with a real API key** (Japan and France), not just the docs page:

| REST Countries v5 | `Country` column |
|---|---|
| `codes.alpha_2`, `codes.alpha_3` | `cca2` (PK), `cca3` |
| `names.common` | `nameEn` |
| `names.translations.fra.common` | `nameFr` |
| `names.translations.spa.common` | `nameEs` |
| `names.official` | `officialName` |
| `capitals[0].name` | `capital` (note: plural `capitals`, an array of `{name, coordinates, attributes}`) |
| `languages` (array of `{iso639_2t, name, ...}`) | `languages` (Json) — remap to `{ [iso639_2t]: name }` to match the `{ "jpn": "Japanese" }` shape in §6 |
| `currencies[0].code/name/symbol` | `currencyCode`, `currencyName`, `currencySymbol` — **`currencies` is an array of objects, not a keyed dict like v3.1** |
| `region`, `subregion` | `region`, `subregion` |
| `coordinates.lat`, `coordinates.lng` | `latitude`, `longitude` |
| `flag.url_svg`, `flag.url_png`, `flag.description` | `flagSvgUrl`, `flagPngUrl`, `flagAlt` |
| `timezones` | `timezones` |
| `cars.driving_side` | `drivingSide` |
| `calling_codes[0]` (array, e.g. `["81"]`) | `callingCode` — store as `"+81"` |
| `borders` (array of alpha_3 codes, e.g. `["AND","BEL",...]`, `[]` if none) | `borders` |
| `population`, `area.kilometers` | `population`, `area` |
| `links.google_maps` | `googleMapsUrl` |

**Verified gotcha the docs page didn't mention:** the full list (254 entries) includes unrecognized/disputed territories — Abkhazia, Northern Cyprus, Somaliland, South Ossetia — with `codes.alpha_2` as an **empty string**, not absent. Since `cca2` is our primary key, **skip any entry where `codes.alpha_2` is falsy** before upserting. This affects exactly 4 of 254 entries; everything else (including non-UN-member territories like Hong Kong that still hold real ISO codes) is fine to keep.

**Flags do not need the authenticated API at all** — `https://flags.restcountries.com/v5/w{width}/{code}.{format}` is a free, keyless CDN (widths w160–w2560, formats png/jpg/gif/svg). Prefer this over `flag.url_svg` from the authenticated response to keep flag rendering off the paid/rate-limited path.

Some countries lack a capital, currency, or translations. Handle nulls — do not let one malformed record abort the seed.

### 12.2 Seed data

The seed script must also:

1. Set `isFeatured = true` for: `JP`, `GR`, `FR`, `CA`, `EG`, `US`, `IT`, `PT`
2. Insert cities and attractions for those eight only
3. Create one admin user from env vars (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) with `role = ADMIN`
4. Optionally create a demo regular user with a few trips for screenshots and testing

Seed content for the eight (extend as desired — the capital is already in `Country`, so cities here are the non-capital ones):

| Country | Cities | Attractions |
|---|---|---|
| JP | tokyo, kyoto, osaka, fukuoka | tokyo tower, senso-ji, fushimi inari shrine |
| GR | athens, thessaloniki, heraklion | acropolis, santorini, delphi |
| FR | paris, lyon, marseille, nice | eiffel tower, louvre, mont saint-michel |
| CA | vancouver, toronto, montreal | banff national park, niagara falls, old quebec |
| EG | cairo, alexandria, luxor | pyramids of giza, karnak temple, valley of the kings |
| US | new york, los angeles, chicago | grand canyon, statue of liberty, yellowstone |
| IT | rome, milan, florence, venice | colosseum, duomo di milano, pompeii |
| PT | lisbon, porto, faro | belém tower, douro valley, sintra |

`[NOTE]` The mockup renders the Japan attraction as `fushimi-itari shrine`. The correct name is **fushimi inari shrine**.

### 12.3 Pexels — destination image fallback

`https://api.pexels.com/v1/search`

Image resolution order for `GET /countries/:cca2`, **in this order, never skipping**:

1. `Country.imageUrl` — admin-uploaded to Cloudinary. Used for the featured eight.
2. `Country.cachedPhotoUrl` — previously fetched from Pexels and stored.
3. Live Pexels request → write the result to `cachedPhotoUrl` → return it.
4. A neutral local placeholder image.

**Never render a broken image.** Small or rarely-photographed countries will sometimes return nothing usable; step 4 is not optional.

Query construction matters. Searching a bare country name returns flags, maps, and food. Use `"{nameEn} landscape"` or `"{nameEn} landmark"`, and request **portrait orientation** — the detail card's image slot is a tall rectangle.

Rate limit is roughly 200 requests/hour. Caching in step 3 is what keeps you inside it; without it, Vite hot-reloading will exhaust the quota in an afternoon.

Credit Pexels and the photographer in the README (§17).

### 12.4 Cloudinary

Used for two things: user avatars and admin-uploaded destination images.

- Upload server-side via the Node SDK, streaming from `multer` memory storage. The file never touches local disk.
- Store both the secure URL and the `public_id`. The `public_id` is required to destroy the old asset when an image is replaced — without it, orphaned files accumulate against the free quota.
- Request transformed variants via URL parameters rather than resizing in code (e.g. a 200×200 face-cropped avatar).
- Free tier is 25 credits/month, where one credit is 1GB storage, 1GB bandwidth, or 1,000 transformations. This project's realistic usage is a fraction of one credit.

---

## 13. Responsive design and page transitions

### Breakpoints

Mobile-friendly is a **hard requirement**, and the mockups are desktop-only. Every screen needs a mobile layout designed, not just scaled.

| Breakpoint | Width | Notes |
|---|---|---|
| `sm` | < 640px | Primary mobile target |
| `md` | 640–1024px | Tablet |
| `lg` | > 1024px | Matches the mockups |

Specific adaptations:

- **My Trips table → stacked cards below `md`.** A five-column table does not survive a 375px viewport. Each trip becomes a card with the date range and flag on one line, status and budget on the next, and actions below.
- **Create Trip: two columns → one column** below `md`, left column first.
- **Home: the four links reposition around the globe.** Below `md`, stack them vertically instead — the compass layout does not fit narrow screens.
- **Country detail: side-by-side → stacked**, image first.
- **Profile: three-region layout → single column**, avatar and stats first.
- **Header:** collapse `en | cad` and `sign out` into a menu below `sm`.

### Page transitions

Uniform horizontal pan.

- **Forward navigation:** new page enters from the right, old page exits to the left. Content moves right-to-left — the camera pans rightward. This matches the `>` arrows already used in the design (`plan a trip >`, `submit >`).
- **Back (`< back`):** reversed — new page enters from the left, old exits right.

Direction is a boolean held in navigation state, not derived from the route. Without it, back animates identically to forward and the app feels like it only ever moves deeper.

**These must NOT pan:**

| Element | Treatment |
|---|---|
| Delete confirmation modal | Scale + fade from centre |
| Expanding a trip row | Height transition in place |
| Dropdowns | Small fade, few pixels of movement |
| Locale / currency switch | No transition — the user has not navigated |
| Validation errors | Appear immediately, never animated |

**Constraints:**

1. **`prefers-reduced-motion` must be respected.** Large-area panning is the worst pattern for vestibular disorders. When set, drop to a ~100ms opacity fade or no transition at all. The same hook gates the 3D globe in §14.
2. **Animate only `transform` and `opacity`.** Never `left`, `top`, `width`, or `height` on the page container — those trigger layout every frame and will visibly stutter the globe if it is rendering simultaneously.
3. **200–300ms, ease-out.** Anything past ~350ms becomes irritating by the tenth navigation.
4. **Below `md`, shorten the pan distance or fall back to a fade**, so it does not fight the browser's back-swipe gesture.

Library: `motion` (formerly Framer Motion) with `AnimatePresence` wrapping the React Router outlet. Plain CSS transitions can handle enter animations, but coordinating *exit* animations without a library is painful.

**Build routing with no transitions first, then layer motion on top.** Wrapping a working router is additive; retrofitting routes to accommodate animation is not.

---

## 14. `[OPTIONAL]` 3D globe

**Week 4 only. Build this last. It must be removable without breaking anything.**

The static globe PNG is the baseline and ships from week 1. The 3D globe is a progressive enhancement layered over it.

### Library

`react-globe.gl` — React bindings for globe.gl, built on Three.js/WebGL. Both required features are documented, first-class use cases.

### Where it goes

| Screen | Globe |
|---|---|
| Home | 3D, auto-rotating |
| Country detail | 3D, rotates to the country and highlights its border |
| Explore (list view) | 3D or static — either is fine |
| **Landing, Sign In, Sign Up** | **Static PNG only** |

Landing and auth pages are cold-load, unauthenticated, first-impression screens with no interaction to justify roughly a megabyte of WebGL. Shipping a 3D globe on a login screen tanks the Lighthouse score for zero functional gain.

### Implementation

- **Spinning:** set `globeImageUrl` to a 2K texture and enable auto-rotate on the controls. A dark, low-contrast Earth suits the monochrome design better than a photographic one.

  > **[DEVIATION]** Shipped with a full-colour ("blue marble" style)
  > texture instead — an explicit request, not an oversight. The first
  > implementation followed this section literally (a levels-adjusted dark
  > monochrome texture), but at the sizes this app actually renders the
  > globe at, "dark, low-contrast" read as an almost-solid black circle
  > rather than a recognizable planet, even after a contrast pass. Asked
  > directly, the choice was to trade the monochrome rule for legibility
  > here rather than push contrast further. This is the one place in the
  > app where colour appears outside status dots / error states.
- **Border highlight:** pass GeoJSON country features to `polygonsData`; `polygonCapColor` and `polygonSideColor` take functions receiving each feature, so return the highlight colour for the matched country and a transparent/neutral colour for the rest. `polygonAltitude` raises the shape so edges read clearly.
- **Camera:** `pointOfView({ lat, lng, altitude })` animates to the country, using `Country.latitude` / `Country.longitude` already in the schema.

### The ISO code trap — read this before starting

The Natural Earth GeoJSON dataset stores country codes in `ISO_A2` / `ISO_A3` feature properties. Historically it contains **`-99` instead of a real code for several entries — France and Norway are the well-known cases.**

Matching naively on `ISO_A3` means those countries silently never highlight, with no error. Expect to lose hours to this if unprepared.

**Mitigation:** build a lookup table keyed by `Country.cca3`, and fall back to matching the feature's `ADMIN` name property when the ISO field is `-99`. Verify explicitly against France before considering the feature done.

### Performance requirements

Three.js is the weight, not the globe library. Budget roughly **500KB–1MB gzipped** for library + texture + border geometry, against a base React bundle of perhaps 150KB. Measure with `vite-bundle-visualizer` rather than trusting that estimate.

Mandatory mitigations:

1. **Lazy-load.** `React.lazy` + dynamic import so the globe is a separate chunk and never enters the initial bundle.
2. **Static PNG as fallback, not placeholder.** Serve it when: viewport is below `md`, `prefers-reduced-motion` is set, or WebGL is unavailable. WebGL globes are rough on low-end Android, and mobile-friendliness is a graded requirement.
3. **Pause the render loop when not visible.** Page Visibility API for tab changes, IntersectionObserver for scroll. A continuously rendering WebGL canvas drains battery while the user does nothing.
4. **TopoJSON, not GeoJSON**, for borders — converted client-side with `topojson-client`. Substantially smaller payload for identical shapes.
5. **2K texture maximum**, served from your own domain.

### Optional extra

`countriesVisited` from the profile stats is already a list of ISO codes. Once border matching works, highlighting visited countries on the Home globe costs almost nothing.

---

## 15. Build order

Mapped to the four capstone milestone weeks. **Do not start a week's work before the previous week's must-haves are complete.**

### Week 1 — foundations

- [x] Repo, `client/` + `server/` scaffolding, `.env.example`, `.gitignore`
- [x] README first draft
- [x] Prisma schema (§6), first migration
- [x] Seed script: REST Countries import, featured eight, cities/attractions, admin user
- [x] Express app skeleton: `helmet`, `cors`, `cookie-parser`, error handler
- [x] Auth endpoints: register, login, logout, me
- [x] Auth middleware: `requireAuth`, `requireAdmin`, `requireOwner`
- [x] **Verify cookie auth in the browser, not just Postman** (§9)
- [x] Tailwind config with the §5 tokens
- [x] React Router skeleton, all routes rendering placeholders, **no transitions**
- [x] Landing, Sign In, Sign Up wired to the auth API

### Week 2 — core data

- [x] Trip CRUD endpoints with full validation
- [x] Status resolver module (§7) — **write this before any screen consumes status**
- [x] Country endpoints: featured, search, detail
- [x] Home page with nearest-upcoming-trip panel
- [x] Explore list + search
- [x] Country detail page
- [x] Create Trip form
- [x] My Trips table, collapsed rows only
- [x] Postman collection generated and committed

### Week 3 — completing the requirements

- [x] Expandable trip rows (read-only — §10.8)
- [x] Edit trip
- [x] Delete with confirmation modal
- [x] Status filter on My Trips
- [x] Profile page + stats endpoint (single SQL aggregate)
- [x] Edit profile, change password
- [x] Cloudinary avatar upload
- [x] Admin dashboard: destinations tab, users tab, self-modification guard
- [x] i18n: extract every string, three locale files, locale switcher
- [x] Currency: rate caching, switcher, `Intl.NumberFormat` display
- [x] Pexels image fallback chain
- [x] **Responsive layouts for every screen**
- [x] GitHub Actions workflow
- [x] Deploy — get it live with time to spare

### Week 4 — polish and optional

- [x] Page transitions (§13)
- [x] `[OPTIONAL]` 3D globe (§14)
- [x] Empty states for every list
- [x] Loading and error states for every async operation
- [x] Accessibility pass: keyboard navigation, visible focus rings, alt text, form labels
- [x] Lighthouse pass
- [x] README final
- [x] Tests if time allows — Jest + Supertest (backend), Vitest (frontend)

**If week 4 runs short, cut the globe first, then transitions.** Both are good-to-haves. Every week-3 item is a graded must-have.

---

## 16. Postman

Generate `postman/expeditor.postman_collection.json` **from the §8 endpoint table** and commit it. Do not hand-maintain a separate API spec — one source of truth, two outputs. When a route changes, update §8 and regenerate.

Collection structure mirroring §8: `Auth`, `Profile`, `Trips`, `Countries`, `Rates`, `Admin`.

> **[GAP]** The committed collection currently only has `Auth`, `Trips`,
> `Countries` — it was generated in Week 2 and never regenerated after the
> Profile, Rates, and Admin endpoints landed in Week 3. Endpoint behavior
> for those three has been verified via the actual frontend and Playwright
> against the live deployment, so nothing is unverified, but the Postman
> collection itself is stale relative to this section's requirement.

Two environments:

| Variable | `local-user` | `local-admin` |
|---|---|---|
| `baseUrl` | `http://localhost:3000/api` | same |
| `email` | demo user | seeded admin |
| `password` | ... | ... |

**What Postman is for here:**

1. Testing endpoints in week 2, before any UI exists to call them
2. Debugging cookie auth — Postman keeps a cookie jar, so login once and subsequent requests carry the token
3. Role testing — hit `DELETE /admin/users/:id` as both environments; confirm `200` versus `403`
4. Inspecting third-party API responses before writing integration code

**What Postman does not prove:** it does not enforce CORS. Cookie auth can pass every Postman test and still fail in the browser (§9). Verify in the browser separately.

Committing the collection also serves the "detailed project documentation" requirement — a grader can import it and exercise the API in under a minute.

---

## 17. README and academic requirements

The rubric grades these directly. Failure on the citation rules is a course-level failure, not a mark deduction.

### README must contain

1. Project description and screenshots
2. Live deployment URL
3. Tech stack
4. Local setup: prerequisites, install, env vars, migration, seed, run
5. API overview (link to the Postman collection)
6. Database schema diagram or description
7. **Attribution section** (below)
8. Statement of which code is original and which is externally sourced

Update the README as work lands, not at the end.

### Attribution — mandatory

Every one of these must be credited with name, purpose, and link:

| Resource | Used for |
|---|---|
| REST Countries API | Country reference data |
| Pexels API | Destination image fallback |
| Cloudinary | Image storage and transformation |
| Exchange rate provider | Currency conversion |
| Tailwind CSS | Styling |
| Prisma | ORM |
| react-i18next | Internationalisation |
| `motion` / Framer Motion | Page transitions |
| `react-globe.gl` + Three.js | 3D globe `[if built]` |
| Natural Earth dataset | Country border geometry `[if built]` |
| Any Stack Overflow / tutorial code | Cite author, title, link |

### Commit discipline — important

The rubric explicitly flags **last-minute large commits as a plagiarism signal**, and requires you to document which portions are your own work and to explain your logic if questioned.

Practical consequences:

- Commit in small increments as each feature lands. A working day should produce several commits, not one.
- Write meaningful commit messages describing what changed and why.
- Keep a short decisions log — `DECISIONS.md` — recording why each significant choice was made. Much of it already exists in the planning conversation behind this document.
- **Understand every piece of code in the repository.** Being unable to explain your own logic under questioning is treated the same as plagiarism, regardless of who or what wrote it.

---

## 18. Decisions log

Choices already made and closed. Do not revisit without reason.

| Area | Decision | Rationale |
|---|---|---|
| Statuses | `upcoming` / `ongoing` / `completed` | `cancelled` from the mockup is cut — nothing could set it |
| Status source | Auto-derived, manually overridable | Correct default without input, user retains control |
| Status logic | One shared resolver module | Prevents Profile and My Trips disagreeing |
| Branding | `xpdtr` mark vs `expeditor \| page` header | Intentional, not an inconsistency |
| Expanded trip row | Read-only text, not inputs | Mockup implies editability that does not exist |
| Backend | Express, not a BaaS | Rubric grades hand-built API development |
| Database | PostgreSQL + Prisma | Relational data; SQL aggregates for stats |
| Auth | JWT in httpOnly cookie | Immune to XSS token theft, unlike localStorage |
| Country data | Seeded, not called live | Fast search, no third-party dependency at request time |
| Country names | Translated (from REST Countries) | The one content exception to the no-translation rule |
| Flags | SVG images, not emoji | Emoji flags do not render on Windows |
| Budget | Stored as entered + currency code | Storing converted values freezes a stale rate |
| Rates | Live API, cached ~12h server-side | Stays inside free tier; survives provider downtime |
| Destination images | Admin-uploaded, Pexels fallback | Quality control where it matters, coverage elsewhere |
| Image API | Pexels over Unsplash | 200/hr vs 50/hr; Unsplash's API terms make attribution mandatory and discourage caching |
| Avatar storage | Cloudinary, not local disk | Local files do not survive cloud redeploys |
| Deletion | Hard delete + confirmation modal | Simple; modal is the safeguard |
| Profile stats | Five, derived, single SQL query | `ongoing` was missing; `trips created` renamed `total trips` |
| Countries visited | Distinct, from completed + ongoing | Currently travelling counts as visited |
| Admin scope | Destinations + users | Satisfies role requirement with genuinely useful tools |
| Notifications | Cut | Was a good-to-have; not worth the scope |
| Transitions | Uniform horizontal pan, reversed on back | Matches the `>` / `<` arrows in the design |
| 3D globe | Optional, week 4, PNG fallback | Enhancement — cutting it must cost nothing |

---

## 19. Open items

Decide these during the build. None block week 1.

1. **Exact typeface** — confirm what the mockups use, or accept the §5 substitute.
2. **Exchange rate provider** — any free option; verify its current free-tier limits before committing.
3. **Deployment target** — frontend and backend hosts, plus a managed Postgres instance. Decide by end of week 2 so week 3 has time to deploy.
4. **Password reset by email** — currently out of scope. Only reconsider if everything else is finished.
5. **Testing depth** — a good-to-have. Prioritise auth and trip CRUD if time allows.

---

*End of specification.*
